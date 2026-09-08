import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Program() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDegree, setFilterDegree] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, [filterDegree]);

  const fetchPrograms = async () => {
    setLoading(true);

    let query = supabase
      .from("programs")
      .select(`
        id,
        degree,
        major,
        university,
        country,
        city,
        duration,
        lang,
        tuition,
        description,
        img_url,
        pdf_url,
        pdf_url2,
        video_url,
        video_url2,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (filterDegree) {
      query = query.eq("degree", filterDegree);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error.message);
      setPrograms([]);
    } else {
      setPrograms(data || []);
    }

    setLoading(false);
  };

  const filteredPrograms = programs.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.major?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  const degreeFilters = [
    { label: "Бүгд", value: "" },
    { label: "Үндсэн", value: "Үндсэн" },
    { label: "Хамтарсан", value: "Хамтарсан" },
    { label: "Rotation", value: "Rotation" },
    { label: "BTEC", value: "BTEC" },
    { label: "Цагийн", value: "Цагийн" },
    { label: "ACCA, CGMA", value: "ACCA, CGMA" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div className="news-header">
        <h2>Хөтөлбөрийн танилцуулга</h2>
        <button
          className="news-add-btn"
          onClick={() => navigate("/admin/program/add")}
        >
          Хөтөлбөр нэмэх
        </button>
      </div>

      <div style={{ margin: "20px 0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {degreeFilters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterDegree(item.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "20px",
                border: filterDegree === item.value ? "none" : "1px solid #ccc",
                background: filterDegree === item.value ? "#2563eb" : "#f5f5f5",
                color: filterDegree === item.value ? "white" : "black",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Хайх..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            width: "220px",
          }}
        />
      </div>

      <table className="program-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Degree</th>
            <th>Major</th>
            <th>University</th>
            <th>Country</th>
            <th>City</th>
            <th>Duration</th>
            <th>Language</th>
            <th>Tuition</th>
            <th>Description</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={11} style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          )}

          {!loading && filteredPrograms.length === 0 && (
            <tr>
              <td colSpan={11} style={{ textAlign: "center" }}>
                No programs found
              </td>
            </tr>
          )}

          {!loading &&
            filteredPrograms.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.degree}</td>
                <td>{item.major}</td>
                <td>{item.university}</td>
                <td>{item.country}</td>
                <td>{item.city}</td>
                <td>{item.duration}</td>
                <td>{item.lang}</td>
                <td>{item.tuition}</td>
                <td className="truncate">{item.description}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/admin/program/edit/${item.id}`)}
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