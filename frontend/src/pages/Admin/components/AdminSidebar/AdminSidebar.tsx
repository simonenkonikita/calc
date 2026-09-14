// frontend/src/pages/Admin/AdminSidebar.tsx

import React, { useState } from "react";

import "./AdminSidebar.css";
import { UserRole } from "../../../../types/auth.types";

interface AdminSidebarProps {
  active: string;
  onSelect: (section: any) => void;
  visibleSections?: string[]; // 🔥 ДОБАВЛЯЕМ
  userRole?: UserRole; // 🔥 ДОБАВЛЯЕМ
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  active,
  onSelect,
  visibleSections = [],
  userRole,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 🔥 ВСЕ пункты меню
  const allMenuItems = [
    { id: "dashboard", label: "Главная", icon: "📊" },
    { id: "users", label: "Пользователи", icon: "👥", adminOnly: true },
    { id: "companies", label: "Компании", icon: "🏢", adminOnly: true },
    { id: "complexes", label: "Жилые комплексы", icon: "🏗️" },
    { id: "banks", label: "Банки", icon: "🏦" },
    { id: "programs", label: "Программы", icon: "📋" },
    { id: "offers", label: "Офферы", icon: "📄" },
    { id: "config", label: "Конфигурация", icon: "⚙️", adminOnly: true },
  ];

  // 🔥 Фильтруем пункты меню
  const menuItems = allMenuItems.filter((item) => {
    // Если переданы visibleSections, используем их
    if (visibleSections.length > 0) {
      return visibleSections.includes(item.id);
    }
    // Иначе показываем все (для обратной совместимости)
    return true;
  });

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
          <span className="status-text">
            {userRole === "admin" ? "👑 Администратор" : "🏢 Застройщик"}
          </span>
        </div>
      </div>
    </div>
  );
};
