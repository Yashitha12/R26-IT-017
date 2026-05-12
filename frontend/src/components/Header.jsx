// --Header.jsx--
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="logo-container">
        <img 
          src="/assets/smartgrama.png" 
          alt="SmartGrama" 
          className="logo-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/140x42/1e40af/ffffff?text=SmartGrama";
          }}
        />
      </div>

      <button 
        className="admin-btn"
        onClick={() => navigate("/admin-review")}
      >
        Admin Dashboard
      </button>
    </div>
  );
}