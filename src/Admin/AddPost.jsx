import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { supabase } from "../supabase";

export default function AddPost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "link",
    "blockquote",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      alert("Нийтлэлийн төрөл сонгоно уу");
      return;
    }

    setLoading(true);

    let imageUrl = null;
    let imageUrls = [];

    if (image) {
      const ext = image.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(`posts/${fileName}`, image);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(`posts/${fileName}`);

      imageUrl = data.publicUrl;
    }

    for (const img of images) {
      const ext = img.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${ext}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(`posts/${fileName}`, img);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(`posts/${fileName}`);

      imageUrls.push(data.publicUrl);
    }

      const cleanDescription = description
        .replace(/&nbsp;/g, " ")
        .replace(/\u00A0/g, " ");

      const { error } = await supabase.from("news").insert([
        {
          title,
          description: cleanDescription,
          type,
          image_url: imageUrl,
          images: imageUrls,
        },
      ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Шинэ мэдээ амжилттай нэмэгдлээ!");
      navigate("/admin/news");
    }

    setLoading(false);
  };

  return (
    <div className="form-container full">
      <h1>Шинэ Мэдээ Нэмэх</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Гарчиг"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Мэдээний агуулга</label>
        <ReactQuill
          theme="snow"
          value={description}
          onChange={setDescription}
          modules={modules}
          formats={formats}
          placeholder="Мэдээний агуулга бичнэ үү..."
        />

        <label>
          Нийтлэлийн төрөл <span style={{ color: "red" }}>*</span>
        </label>

        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="" disabled>
            -- Сонгох --
          </option>
          <option value="Мэдээ">Мэдээ</option>
          <option value="Зар">Зар</option>
          {/*value="БСА Зар">БСА Зар*/}
          <option value="Хурлын зар">Хурлын зар</option>
          <option value="Ажлын байрны зар">Ажлын байрны зар</option>
          <option value="Видео контент">Видео контент</option>
          <option value="Пин постер">Пин постер</option>
        </select>

        <label>Үндсэн зураг</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} className="preview" alt="preview" />}

        <label>Нэмэлт зургууд</label>
        <input type="file" accept="image/*" multiple onChange={handleImages} />

        <div className="preview-grid">
          {previews.map((src, i) => (
            <img key={i} src={src} className="preview" alt="extra" />
          ))}
        </div>

        <button className="upload-btn" disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </form>
    </div>
  );
}