import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function EditCalendar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendar();
  }, [id]);

  const fetchCalendar = async () => {
    const { data, error } = await supabase
      .from("calendar")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setTitle(data.title || "");
      setType(data.type || "");
      setDate(data.date ? data.date.split("T")[0] : "");
    }
  };

  const updateCalendar = async () => {
    if (!title || !date || !type) {
      alert("Бүх талбарыг бөглөнө үү");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("calendar")
      .update({
        title,
        date,
        type,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/admin/calendar", { replace: true });
  };

  const deleteCalendar = async () => {
    if (!window.confirm("Энэ календарийг устгах уу?")) return;

    setLoading(true);

    const { error } = await supabase
      .from("calendar")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/admin/calendar", { replace: true });
  };

  return (
    <div className="form-container">
      <h2>Календарь засах</h2>

      <label>Гарчиг</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Огноо</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>Төрөл</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">-- Сонгох --</option>
        <option value="БСА-ны ажил">Бакалаврын сургалтын алба</option>
        <option value="Хөтөлбөр хэрэгжүүлэгч нэгж">Хөтөлбөр хэрэгжүүлэгч нэгж</option>
        <option value="Оюутны хөгжлийн төвийн ажил">Оюутны хөгжлийн төв</option>
        <option value="Олон улсын хамтарсан хөтөлбөр">Олон улсын хөтөлбөр</option>
        <option value="Оюутны холбоо, Оюутны клуб">Оюутны холбоо, клуб</option>
        <option value="Тэмдэглэлт өдөр">Тэмдэглэлт өдөр</option>
      </select>
      
      <div className="form-button-row">
        <button onClick={updateCalendar} disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </button>

        <button
          onClick={deleteCalendar}
          disabled={loading}
          className="danger-btn"
        >
          Устгах
        </button>
      </div>
    </div>
  );
}
  