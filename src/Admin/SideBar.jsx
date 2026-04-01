import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    onClose?.();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
    onClose?.();
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <h2>Admin Panel</h2>

      <ul>
        <li onClick={() => goTo("/admin/news")}>Зар, мэдээ</li>
        <li onClick={() => goTo("/admin/program")}>Хөтөлбөрийн танилцуулга</li>
        <li onClick={() => goTo("/admin/scholarship")}>Амжилт, тэтгэлгийн бүртгэл</li>
        <li onClick={() => goTo("/admin/calendar")}>Календарь</li>
        <li onClick={logout} style={{ color: "red" }}>Гарах</li>
      </ul>
    </div>
  );
}
