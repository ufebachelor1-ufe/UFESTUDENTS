import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AddCalendar() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([
    { title: "", date: "", type: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addMoreRow = () => {
    setRows([...rows, { title: "", date: "", type: "" }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return; // safety
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    for (let row of rows) {
      if (!row.title || !row.date || !row.type) {
        alert("Бүх мөрийн талбарыг бөглөнө үү");
        return;
      }
    }

    setLoading(true);

    const { error } = await supabase.from("calendar").insert(rows);

    if (error) {
      alert(error.message);
    } else {
      alert("Календарь амжилттай нэмэгдлээ");
      navigate("/admin/calendar");
    }

    setLoading(false);
  };

  return (
    <div className="table-form">
      <h2>Календарь нэмэх</h2>

      <table className="one-row-table">
        <thead>
          <tr>
            <th>Гарчиг</th>
            <th>Огноо</th>
            <th>Төрөл</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  placeholder="Гарчиг"
                  value={row.title}
                  onChange={(e) =>
                    handleChange(index, "title", e.target.value)
                  }
                />
              </td>

              <td>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) =>
                    handleChange(index, "date", e.target.value)
                  }
                />
              </td>

              <td>
                <select
                  value={row.type}
                  onChange={(e) =>
                    handleChange(index, "type", e.target.value)
                  }
                >
                  <option value="">-- Сонгох --</option>
                  <option value="БСА-ны ажил">Бакалаврын сургалтын алба</option>
                  <option value="Хөтөлбөр хэрэгжүүлэгч нэгж">Хөтөлбөр хэрэгжүүлэгч нэгж</option>
                  <option value="Оюутны хөгжлийн төвийн ажил">Оюутны хөгжлийн төв</option>
                  <option value="Олон улсын хамтарсан хөтөлбөр">Олон улсын хөтөлбөр</option>
                  <option value="Оюутны холбоо, Оюутны клуб">Оюутны холбоо, клуб</option>
                  <option value="Тэмдэглэлт өдөр">Тэмдэглэлт өдөр</option>
                </select>
              </td>

              {/* DELETE BUTTON */}
              <td>
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="delete-row-btn"
                    onClick={() => removeRow(index)}
                    title="Мөр устгах"
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}

          {/* ACTION BUTTONS */}
          <tr className="button-row">
            <td colSpan={4}>
              <div className="button-group">
                <button
                  type="button"
                  onClick={addMoreRow}
                  className="secondary-btn"
                >
                  + Нэмэх
                </button>

                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Хадгалж байна..." : "Хадгалах"}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
