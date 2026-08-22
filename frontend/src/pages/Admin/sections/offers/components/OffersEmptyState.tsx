// frontend/src/pages/Admin/sections/offers/components/OffersEmptyState.tsx

import React from "react";
import "./OffersEmptyState.css";


export const OffersEmptyState: React.FC = () => {
  return (
    <div className="offers-empty-state">
      <div className="empty-icon">📭</div>
      <div className="empty-title">Нет офферов в этом банке</div>
      <div className="empty-description">
        Нажмите "Добавить оффер" чтобы создать первый
      </div>
    </div>
  );
};