import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function News() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [filterType]);

  const fetchNews = async () => {
    setLoading(true);

    let query = supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterType) {
      query = query.eq("type", filterType);
    }

    const { data, error } = await query;

    if (!error) {
      setNews(data || []);
    }

    setLoading(false);
  };

  const filteredNews = news.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  const filters = [
    { label: "Бүгд", value: "" },
    { label: "Мэдээ", value: "Мэдээ" },
    { label: "Зар", value: "Зар" },
    { label: "БСА Зар", value: "БСА Зар" },
    { label: "Амжилтын зар", value: "Амжилтын зар" },
    { label: "Хурлын зар", value: "Хурлын зар" },
    { label: "Ажлын байрны зар", value: "Ажлын байрны зар" },
    { label: "Видео контент", value: "Видео контент" },
    { label: "Пин постер", value: "Пин постер" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div className="news-header">
        <h2>Бүх мэдээ</h2>
        <button
          className="news-add-btn"
          onClick={() => navigate("/admin/add-post")}
        >
          Мэдээ нэмэх
        </button>
      </div>

      {/* Filter + Search */}
      <div
        style={{
          margin: "20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterType(item.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border:
                  filterType === item.value ? "none" : "1px solid #ccc",
                background:
                  filterType === item.value ? "#2563eb" : "#f5f5f5",
                color: filterType === item.value ? "white" : "black",
                cursor: "pointer",
                fontSize: "15px",
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
            fontSize: "15px",
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
            <th>Нийтлэлийн гарчиг</th>
            <th>Товч мэдээ</th>
            <th>Төрөл</th>
            <th>Огноо</th>
            <th>Үйлдэл</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          )}

          {!loading && filteredNews.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No news found
              </td>
            </tr>
          )}

          {!loading &&
            filteredNews.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.title}</td>
                <td className="truncate">
                  {(() => {
                  const div = document.createElement("div");
                  div.innerHTML = item.description || "";
                  const text = div.textContent || div.innerText || "";
                  return text.slice(0, 80) + "...";
                  })()}
                </td>
                <td>{item.type}</td>
                <td>
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() =>
                      navigate(`/admin/edit-post/${item.id}`)
                    }
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