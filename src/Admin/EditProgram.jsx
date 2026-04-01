import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function EditProgram() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ================================
     FORM STATE
  ================================ */
  const [form, setForm] = useState({
    degree: "",
    major: "",
    university: "",
    country: "",
    city: "",
    duration: "",
    lang: "",
    tuition: "",
    credits: "",
    format: "",
    description: "",
    video_url: "",
  });

  const [imgUrl, setImgUrl] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imgRemoved, setImgRemoved] = useState(false);

  // ✅ MULTIPLE IMAGES
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);

  /* ================================
     FETCH PROGRAM
  ================================ */
  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setForm({
        degree: data.degree || "",
        major: data.major || "",
        university: data.university || "",
        country: data.country || "",
        city: data.city || "",
        duration: data.duration || "",
        lang: data.lang || "",
        credits: data.credits || "",
        format: data.format || "",
        tuition: data.tuition || "",
        description: data.description || "",
        video_url: data.video_url || "",
      });

      setImgUrl(data.img_url || "");

      // ✅ FIXED: always set a real array
      const imgs = Array.isArray(data.images) ? data.images : [];
      setImages(imgs);
      setPreviews(imgs);
    }
  };

  /* ================================
     HANDLE INPUT CHANGE
  ================================ */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================================
     MAIN IMAGE REMOVE
  ================================ */
  const removeMainImage = () => {
    setImgUrl("");
    setNewImage(null);
    setImgRemoved(true);
  };

  /* ================================
     MULTIPLE IMAGE HANDLER
  ================================ */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);

    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  const removeImage = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedNewImages = newImages.filter((_, i) => i !== index);

    setPreviews(updatedPreviews);
    setImages(updatedImages);
    setNewImages(updatedNewImages);
  };

  /* ================================
     UPDATE PROGRAM
  ================================ */
  const updateProgram = async () => {
    setLoading(true);

    try {
      let finalImgUrl = imgRemoved ? null : imgUrl;

      // upload main image
      if (newImage) {
        const ext = newImage.name.split(".").pop();
        const filePath = `programs/main_${id}_${Date.now()}.${ext}`;

        await supabase.storage
          .from("images")
          .upload(filePath, newImage, { upsert: true });

        finalImgUrl = supabase.storage
          .from("images")
          .getPublicUrl(filePath).data.publicUrl;
      }

      // ✅ upload multiple images
      let uploadedUrls = [...images];

      for (let file of newImages) {
        const ext = file.name.split(".").pop();
        const filePath = `programs/multi_${id}_${Date.now()}_${file.name}`;

        await supabase.storage.from("images").upload(filePath, file);

        const publicUrl = supabase.storage
          .from("images")
          .getPublicUrl(filePath).data.publicUrl;

        uploadedUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from("programs")
        .update({
          ...form,
          img_url: finalImgUrl,
          images: uploadedUrls,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Хөтөлбөр амжилттай засагдлаа");
      navigate("/admin/program");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     DELETE PROGRAM
  ================================ */
  const deleteProgram = async () => {
    if (!window.confirm("Та устгахдаа итгэлтэй байна уу?")) return;

    setLoading(true);
    await supabase.from("programs").delete().eq("id", id);
    setLoading(false);
    navigate("/admin/program");
  };

  /* ================================
     UI
  ================================ */
  return (
    <div className="form-container full">
      <h1>Хөтөлбөр засах</h1>

      <input name="major" value={form.major} onChange={handleChange} placeholder="Мэргэжил" />
      <input name="university" value={form.university} onChange={handleChange} placeholder="Их сургууль" />
      <input name="country" value={form.country} onChange={handleChange} placeholder="Улс" />
      <input name="city" value={form.city} onChange={handleChange} placeholder="Хот" />
      <input name="duration" value={form.duration} onChange={handleChange} placeholder="Суралцах хугацаа" />

      <select name="degree" value={form.degree} onChange={handleChange}>
        <option value="">Сонгох</option>
        <option value="Үндсэн">Үндсэн</option>
        <option value="Хамтарсан">Хамтарсан</option>
        <option value="Rotation">Rotation</option>
        <option value="BTEC">BTEC</option>
        <option value="Цагийн">Цагийн</option>
        <option value="ACCA, CGMA">ACCA, CGMA</option>
      </select>

      <input name="format" value={form.format} onChange={handleChange} placeholder="Суралцах хэлбэр" />
      <input name="credits" value={form.credits} onChange={handleChange} placeholder="Судлах кредит" />
      <input name="lang" value={form.lang} onChange={handleChange} placeholder="Суралцах хэл" />
      <input name="tuition" value={form.tuition} onChange={handleChange} placeholder="Төлбөр" />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Тайлбар"
      />

      <input
        name="video_url"
        value={form.video_url}
        onChange={handleChange}
        placeholder="Video URL"
      />

      {/* MAIN IMAGE */}
      <p><b>Үндсэн зураг</b></p>

      {imgUrl && (
        <div className="preview-wrapper">
          <img src={imgUrl} className="preview" alt="" />
          <button type="button" className="remove-btn" onClick={removeMainImage}>
            ✕
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setNewImage(e.target.files[0]);
          setImgRemoved(false);
        }}
      />

      {/* MULTIPLE IMAGES */}
      <p><b>Нэмэлт зураг</b></p>

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
        <button onClick={updateProgram} disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </button>

        <button onClick={deleteProgram} disabled={loading} className="danger-btn">
          Устгах
        </button>
      </div>
    </div>
  );
}