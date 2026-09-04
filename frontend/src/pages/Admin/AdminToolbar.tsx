// frontend/src/components/admin/AdminToolbar.tsx

import React from "react";
import "./AdminToolbar.css";

export interface ToolbarButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  icon?: string;
  disabled?: boolean;
  title?: string;
}

export interface AdminToolbarProps {
  /** Кнопки в тулбаре */
  buttons?: ToolbarButton[];
  /** Поиск */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  /** Отображать счетчик */
  totalCount?: number;
  /** Дополнительные элементы справа */
  rightContent?: React.ReactNode;
  /** Дополнительные классы */
  className?: string;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  buttons = [],
  search,
  totalCount,
  rightContent,
  className = "",
}) => {
  return (
    <div className={`admin-toolbar ${className}`}>
      {/* Левая часть — кнопки */}
      <div className="admin-toolbar-left">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            disabled={btn.disabled}
            title={btn.title}
            className={`admin-btn admin-btn-${btn.variant || "primary"}`}
          >
            {btn.icon && <span>{btn.icon}</span>}
            {btn.label}
          </button>
        ))}
      </div>

      {/* Центр — спейсер */}
      <div className="admin-toolbar-spacer" />

      {/* Правая часть — поиск + счетчик */}
      <div className="admin-toolbar-right">
        {search && (
          <div className="admin-toolbar-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={search.placeholder || "Поиск..."}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          </div>
        )}

        {rightContent && (
          <div className="admin-toolbar-right-content">{rightContent}</div>
        )}

        {totalCount !== undefined && (
          <span className="admin-toolbar-count">Всего: {totalCount}</span>
        )}
      </div>
    </div>
  );
};

export default AdminToolbar;
