import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { supabase } from "../supabase";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState("");

  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
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

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error.message);
      return;
    }

    if (data) {
      setTitle(data.title || "");
      setDescription(data.description || "");
      setType(data.type || "");
      setMainPreview(data.image_url || "");
      setImages(data.images || []);
      setPreviews(data.images || []);
    }
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const removeMainImage = () => {
    setMainImage(null);
    setMainPreview("");
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setNewImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePost = async () => {
    setLoading(true);

    let finalImageUrl = mainPreview;
    let finalImages = [...images];

    if (mainImage) {
      const ext = mainImage.name.split(".").pop();
      const path = `posts/${id}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(path, mainImage, { upsert: true });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      finalImageUrl = supabase.storage
        .from("images")
        .getPublicUrl(path).data.publicUrl;
    }

    for (const img of newImages) {
      const ext = img.name.split(".").pop();
      const path = `posts/${Date.now()}-${Math.random()}.${ext}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(path, img);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      const url = supabase.storage
        .from("images")
        .getPublicUrl(path).data.publicUrl;

      finalImages.push(url);
    }

      const cleanDescription = description
        .replace(/&nbsp;/g, " ")
        .replace(/\u00A0/g, " ");

      const { error } = await supabase
        .from("news")
        .update({
          title,
          description: cleanDescription,
          type,
          image_url: finalImageUrl,
          images: finalImages,
        })
        .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/admin/news");
  };

  const deletePost = async () => {
    if (!window.confirm("Энэ мэдээг устгах уу?")) return;

    setLoading(true);

    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/admin/news");
  };

  return (
    <div className="form-container">
      <h2>Мэдээ засах</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Гарчиг"
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

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Мэдээ">Мэдээ</option>
        <option value="Зар">Зар</option>
        {/*value="БСА Зар">БСА Зар*/}
        <option value="Амжилтын зар">Амжилтын зар</option>
        <option value="Хурлын зар">Хурлын зар</option>
        <option value="Ажлын байрны зар">Ажлын байрны зар</option>
        <option value="Видео контент">Видео контент</option>
        <option value="Пин постер">Пин постер</option>
      </select>

      <p>
        <b>Үндсэн зураг</b>
      </p>

      {mainPreview && (
        <div className="preview-wrapper">
          <img src={mainPreview} className="preview" alt="" />
          <button type="button" className="remove-btn" onClick={removeMainImage}>
            ✕
          </button>
        </div>
      )}

      <input type="file" accept="image/*" onChange={handleMainImage} />

      <p>
        <b>Нэмэлт зураг</b>
      </p>

      <input type="file" accept="image/*" multiple onChange={handleImages} />

      <div className="preview-grid">
        {previews.map((src, i) => (
          <div key={i} className="preview-wrapper">
            <img src={src} className="preview" alt="" />
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeImage(i)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="form-button-row">
        <button onClick={updatePost} disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </button>

        <button onClick={deletePost} disabled={loading} className="danger-btn">
          Устгах
        </button>
      </div>
    </div>
  );
}