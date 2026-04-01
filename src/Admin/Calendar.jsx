import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Calendar() {
  const navigate = useNavigate();
  const [calendar, setCalendar] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCalendar();
  }, [filterType]);

  const fetchCalendar = async () => {
    let query = supabase
      .from("calendar")
      .select("*")
      .order("date", { ascending: false });

    if (filterType) {
      query = query.eq("type", filterType);
    }

    const { data, error } = await query;

    if (!error) {
      setCalendar(data || []);
    }
  };

  const filteredCalendar = calendar.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(q);
  });

  const filters = [
    { label: "Бүгд", value: "" },
    { label: "Бакалаврын сургалтын алба", value: "БСА-ны ажил" },
    { label: "Хөтөлбөр хэрэгжүүлэгч нэгж", value: "Хөтөлбөр хэрэгжүүлэгч нэгж" },
    { label: "Оюутны хөгжлийн төв", value: "Оюутны хөгжлийн төвийн ажил" },
    { label: "Олон улсын хөтөлбөр", value: "Олон улсын хамтарсан хөтөлбөр" },
    { label: "Оюутны холбоо, клуб", value: "Оюутны холбоо, Оюутны клуб" },
    { label: "Тэмдэглэлт өдөр", value: "Тэмдэглэлт өдөр" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div className="news-header">
        <h2>Календарь</h2>
        <button
          className="news-add-btn"
          onClick={() => navigate("/admin/calendar/add")}
        >
          Календарь нэмэх
        </button>
      </div>

      {/* Filter + Search */}
      <div style={{ margin: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterType(item.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: filterType === item.value ? "none" : "1px solid #ccc",
                background: filterType === item.value ? "#2563eb" : "#f5f5f5",
                color: filterType === item.value ? "white" : "black",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Хайх..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            fontSize: "12px",
            width: "220px",
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <table className="news-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Гарчиг</th>
            <th>Огноо</th>
            <th>Төрөл</th>
            <th>Үйлдэл</th>
          </tr>
        </thead>

        <tbody>
          {filteredCalendar.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                Одоогоор бүртгэл алга байна
              </td>
            </tr>
          )}

          {filteredCalendar.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.title}</td>
              <td>
                {item.date ? new Date(item.date).toLocaleDateString() : "-"}
              </td>
              <td>{item.type}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/admin/calendar/edit/${item.id}`)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}