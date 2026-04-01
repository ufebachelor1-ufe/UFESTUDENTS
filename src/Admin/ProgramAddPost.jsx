import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function ProgramAddPost() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    major: "",
    country: "",
    city: "",
    university: "",
    duration: "",
    degree: "",
    description: "",
    language: "",
    credits: "",
    format: "",
    tuition: "",
    video_url: "",
  });

  // main image
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ✅ multiple images (same as AddPost)
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // main image handler
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ EXACT SAME multiple image logic
  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    // allow selecting same file again
    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.major.trim()) {
      alert("Major is required");
      return;
    }

    setLoading(true);

    let imageUrl = null;
    let imageUrls = [];

    try {
      // upload main image
      if (image) {
        const ext = image.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("images")
          .upload(`programs/${fileName}`, image);

        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("images")
          .getPublicUrl(`programs/${fileName}`);

        imageUrl = data.publicUrl;
      }

      // ✅ upload multiple images (same logic as AddPost)
      for (const img of images) {
        const ext = img.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${ext}`;

        const { error } = await supabase.storage
          .from("images")
          .upload(`programs/${fileName}`, img);

        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("images")
          .getPublicUrl(`programs/${fileName}`);

        imageUrls.push(data.publicUrl);
      }

      // insert program
      const { error } = await supabase.from("programs").insert([
        {
          major: form.major,
          country: form.country || null,
          city: form.city || null,
          university: form.university || null,
          duration: form.duration || null,
          degree: form.degree || null,
          description: form.description || null,
          lang: form.language || null,
          tuition: form.tuition || null,
          credits: form.credits || null,
          format: form.format || null,
          video_url: form.video_url || null,
          img_url: imageUrl,
          images: imageUrls.length > 0 ? imageUrls : null, // ✅ save array
        },
      ]);

      if (error) throw error;

      alert("Хөтөлбөр амжилттай нэмэгдлээ!");
      navigate("/admin/program");
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container full">
      <h1>Хөтөлбөр нэмэх</h1>

      <form onSubmit={handleSubmit} className="program-form">
        <input
          name="major"
          placeholder="Мэргэжил *"
          value={form.major}
          onChange={handleChange}
          required
        />

        <input
          name="country"
          placeholder="Улс"
          value={form.country}
          onChange={handleChange}
        />

        <input
          name="city"
          placeholder="Хот"
          value={form.city}
          onChange={handleChange}
        />

        <input
          name="university"
          placeholder="Их сургууль"
          value={form.university}
          onChange={handleChange}
        />

        <input
          name="duration"
          placeholder="Суралцах хугацаа (e.g. 4 years)"
          value={form.duration}
          onChange={handleChange}
        />

        <select name="degree" value={form.degree} onChange={handleChange}>
          <option value="">Хөтөлбөр сонгох</option>
          <option value="Үндсэн">Үндсэн</option>
          <option value="Хамтарсан">Хамтарсан</option>
          <option value="Rotation">Rotation</option>
          <option value="BTEC">BTEC</option>
          <option value="Цагийн">Цагийн</option>
          <option value="ACCA, CGMA">ACCA, CGMA</option>
        </select>

        <textarea
          name="description"
          placeholder="Тайлбар"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="language"
          placeholder="Суралцах хэл"
          value={form.language}
          onChange={handleChange}
        />

        <input
          name="format"
          placeholder="Суралцах хэлбэр"
          value={form.format}
          onChange={handleChange}
        />

        <input
          name="credits"
          placeholder="Судлах кредит"
          value={form.credits}
          onChange={handleChange}
        />

        <input
          name="tuition"
          placeholder="Төлбөр"
          value={form.tuition}
          onChange={handleChange}
        />

        <input
          name="video_url"
          placeholder="Video URL (YouTube / MP4)"
          value={form.video_url}
          onChange={handleChange}
        />

        {/* Main image */}
        <input type="file" accept="image/*" onChange={handleImage} />
        {preview && <img src={preview} className="preview" alt="preview" />}

        {/* Multiple images */}
        <div className="left-upload">
        <label>Нэмэлт зургууд</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImages}
        />
        </div>

        <div className="preview-grid">
          {previews.map((src, i) => (
            <img key={i} src={src} className="preview" alt="extra" />
          ))}
        </div>

        <button disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </form>
    </div>
  );
}