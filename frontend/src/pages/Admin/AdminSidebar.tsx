// frontend/src/pages/Admin/AdminSidebar.tsx

import React from "react";

interface AdminSidebarProps {
  active: string;
  onSelect: (section: any) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  active,
  onSelect,
}) => {
  const menuItems = [
    { id: "banks", label: "🏦 Банки", icon: "🏦" },
    { id: "complexes", label: "🏗️ Жилые комплексы", icon: "🏗️" },
    { id: "programs", label: "📋 Программы", icon: "📋" },
    { id: "rates", label: "📊 Ставки", icon: "📊" },
    { id: "subsidies", label: "💰 Субсидии", icon: "💰" },
    { id: "config", label: "⚙️ Конфигурация", icon: "⚙️" },
  ];

  return (
    <div className="admin-sidebar">
      <h2>⚡ Админ-панель</h2>
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "active" : ""}
            onClick={() => onSelect(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
