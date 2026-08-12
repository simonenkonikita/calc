// frontend/src/pages/Admin/sections/offers/components/OfferCard.tsx

import React from "react";
import { OfferCardProps } from "../types";
import "./OfferCard.css";

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  dynamicData,
  onEdit,
  onCopy,
  onDelete,
  onRestore,
  onHardDelete,
  getDisplayRate,
  getDisplaySubsidy,
  renderComplexesList,
}) => {
  const subsidy = getDisplaySubsidy(offer);

  return (
    <div className="offer-card">
      <div className="offer-card-header">
        <div className="offer-card-title">
          <span className="offer-program-name">{offer.program}</span>
          {offer.isActive ? (
            <span className="status-badge active">✅ Активен</span>
          ) : (
            <span className="status-badge inactive">❌ Неактивен</span>
          )}
        </div>
        <div className="offer-card-actions">
          <button
            onClick={() => onEdit(offer)}
            className="admin-btn-primary admin-btn-sm"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={() => onCopy(offer.id)}
            className="admin-btn-warning admin-btn-sm"
            title="Копировать"
          >
            📋
          </button>
          {!offer.isActive ? (
            <button
              onClick={() => onRestore(offer.id)}
              className="admin-btn-success admin-btn-sm"
              title="Восстановить"
            >
              ↩️
            </button>
          ) : (
            <button
              onClick={() => onDelete(offer.id)}
              className="admin-btn-danger admin-btn-sm"
              title="Удалить"
            >
              🗑️
            </button>
          )}
          {!offer.isActive && (
            <button
              onClick={() => onHardDelete(offer.id)}
              className="admin-btn-danger admin-btn-sm"
              title="Полностью удалить"
            >
              💀
            </button>
          )}
        </div>
      </div>

      <div className="offer-card-body">
        <div className="offer-details">
          <div className="offer-detail-item">
            <span className="detail-label">Ставка:</span>
            <span className="detail-value rate-cell">{getDisplayRate(offer)}</span>
          </div>
          <div className="offer-detail-item">
            <span className="detail-label">Субсидия:</span>
            <span className="detail-value subsidy-cell">
              <span
                className={`subsidy-badge subsidy-${subsidy.type}`}
                title={
                  subsidy.type === "dynamic"
                    ? "Динамическая субсидия"
                    : subsidy.type === "fixed"
                    ? "Фиксированная субсидия"
                    : "Нет субсидии"
                }
              >
                {subsidy.display}
                {subsidy.type === "dynamic" && (
                  <span className="subsidy-dynamic-icon">📊</span>
                )}
              </span>
            </span>
          </div>
          <div className="offer-detail-item">
            <span className="detail-label">Мин. ПВ:</span>
            <span className="detail-value">{offer.minPVPercent}%</span>
          </div>
          <div className="offer-detail-item">
            <span className="detail-label">ЖК:</span>
            <span className="detail-value complex-list">
              {renderComplexesList(offer.complexes)}
            </span>
          </div>
          {offer.shortRate && (
            <div className="offer-detail-item">
              <span className="detail-label">Short Rate:</span>
              <span className="detail-value">{offer.shortRate}%</span>
            </div>
          )}
          {offer.twoRate && (
            <div className="offer-detail-item">
              <span className="detail-label">Two Rate:</span>
              <span className="detail-value">{offer.twoRate}%</span>
            </div>
          )}
          {offer.isTranche && (
            <div className="offer-detail-item">
              <span className="detail-label">Траншевая:</span>
              <span className="detail-value">✅</span>
            </div>
          )}
          {offer.isTwoContracts && (
            <div className="offer-detail-item">
              <span className="detail-label">2 договора:</span>
              <span className="detail-value">✅</span>
            </div>
          )}
          {offer.excessLimit && (
            <div className="offer-detail-item">
              <span className="detail-label">Сверхлимит:</span>
              <span className="detail-value">✅</span>
            </div>
          )}
          {offer.description && (
            <div className="offer-detail-item full-width">
              <span className="detail-label">Описание:</span>
              <span className="detail-value">{offer.description}</span>
            </div>
          )}
        </div>
      </div>

      {dynamicData && (dynamicData.rates.length > 0 || dynamicData.subsidies.length > 0) && (
        <div className="offer-card-footer">
          {dynamicData.rates.length > 0 && (
            <div className="dynamic-info">
              <span className="dynamic-label">📊 Ставки:</span>
              <span className="dynamic-value">{dynamicData.rates.length} условий</span>
            </div>
          )}
          {dynamicData.subsidies.length > 0 && (
            <div className="dynamic-info">
              <span className="dynamic-label">💰 Субсидии:</span>
              <span className="dynamic-value">{dynamicData.subsidies.length} условий</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};