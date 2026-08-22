// frontend/src/pages/Admin/sections/offers/components/OffersToolbar.tsx

import React from "react";
import "./OffersToolbar.css";

interface OffersToolbarProps {
  onAdd: () => void;
  onRefresh: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
}

export const OffersToolbar: React.FC<OffersToolbarProps> = ({
  onAdd,
  onRefresh,
  searchTerm,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="offers-toolbar">
      <button onClick={onAdd} className="admin-btn-primary">
        + Добавить оффер
      </button>
      <button onClick={onRefresh} className="admin-btn-secondary">
        🔄 Обновить
      </button>
      <div className="spacer" />
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <span className="total-count">Всего: {totalCount}</span>
    </div>
  );
};