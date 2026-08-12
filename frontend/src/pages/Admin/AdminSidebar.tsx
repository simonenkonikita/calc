// frontend/src/pages/Admin/AdminSidebar.tsx
import React, { useState } from "react";
import "./AdminSidebar.css";

interface AdminSidebarProps {
  active: string;
  onSelect: (section: any) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  active,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Главная", icon: "📊" },
    { id: "complexes", label: "Жилые комплексы", icon: "🏗️" },
    { id: "banks", label: "Банки", icon: "🏦" },
    { id: "programs", label: "Программы", icon: "📋" },
    { id: "offers", label: "Офферы", icon: "📄" },
    { id: "rates", label: "Ставки", icon: "📈" },
    { id: "subsidies", label: "Субсидии", icon: "💰" },
    { id: "config", label: "Конфигурация", icon: "⚙️" },
  ];

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">
            Admin<span>Panel</span>
          </span>
        </div>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
          <span className="toggle-line"></span>
        </button>
      </div>

      <nav className="admin-sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Меню</span>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => handleSelect(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label-text">{item.label}</span>
              {active === item.id && <span className="nav-indicator"></span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot"></span>
          <span className="status-text">Система работает</span>
        </div>
        <div className="sidebar-version">v2.0.0</div>
      </div>
    </div>
  );
};
