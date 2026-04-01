import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AddPost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  // main image
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // multiple images
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  // main image handler
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ FIXED: append images instead of replacing
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    // allow selecting the same file again
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

    // upload main image
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

    // upload multiple images
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

    // insert news
    const { error } = await supabase.from("news").insert([
      {
        title,
        description,
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

        <textarea
          placeholder="Мэдээ"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          <option value="БСА Зар">БСА Зар</option>
          <option value="Хурлын зар">Хурлын зар</option>
          <option value="Ажлын байрны зар">Ажлын байрны зар</option>
          <option value="Видео контент">Видео контент</option>
          <option value="Пин постер">Пин постер</option>
        </select>

        {/* Main image */}
        <label>Үндсэн зураг</label>
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} className="preview" alt="preview" />}

        {/* Multiple images */}
        <label>Нэмэлт зургууд</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImages}
        />

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
