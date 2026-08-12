// frontend/src/pages/Admin/sections/offers/components/OfferCard/OfferCard.tsx

import React from "react";
import { OfferCardProps } from "../types";
import "./OfferCard.css";

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  programIsActive,
  bankIsActive,
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

  // 🔥 Логика: оффер активен ТОЛЬКО если активны ВСЕ три
  const isOfferEffectiveActive =
    programIsActive && bankIsActive && offer.isActive;

  // 🔥 Получаем причину неактивности
  const getInactiveReason = (): string => {
    if (!offer.isActive) return "Оффер деактивирован";
    if (!bankIsActive) return "Банк неактивен";
    if (!programIsActive) return "Программа неактивна";
    return "Неизвестная причина";
  };

  return (
    <div className="offer-card">
      <div className="offer-card-header">
        <div className="offer-card-title">
          <span className="offer-program-name">{offer.program}</span>
        </div>
        <div className="offer-card-actions">
          {isOfferEffectiveActive ? (
            <span className="status-badge active">✅ Активен</span>
          ) : (
            <span className="status-badge inactive" title={getInactiveReason()}>
              ❌ Неактивен
              <span className="status-reason"> ({getInactiveReason()})</span>
            </span>
          )}
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
          {/* 🔥 Используем isOfferEffectiveActive для отображения кнопок */}
          {!isOfferEffectiveActive ? (
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
          {!isOfferEffectiveActive && (
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
        {/* Верхняя часть - детали оффера */}
        <div className="offer-details-top">
          <div className="offer-detail-item">
            <span className="detail-label">Ставка:</span>
            <span className="detail-value rate-cell">
              {getDisplayRate(offer)}
            </span>
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
        </div>

        {/* Нижняя часть - ЖК в строку */}
        <div className="offer-complexes-row">
          <span className="detail-label">ЖК:</span>
          <div className="complexes-list">
            {renderComplexesList(offer.complexes)}
          </div>
        </div>

        {/* Описание (если есть) */}
        {offer.description && (
          <div className="offer-description">
            <span className="detail-label">Описание:</span>
            <span className="detail-value">{offer.description}</span>
          </div>
        )}
      </div>

      {dynamicData &&
        (dynamicData.rates.length > 0 || dynamicData.subsidies.length > 0) && (
          <div className="offer-card-footer">
            {dynamicData.rates.length > 0 && (
              <div className="dynamic-info">
                <span className="dynamic-label">📊 Ставки:</span>
                <span className="dynamic-value">
                  {dynamicData.rates.length} условий
                </span>
              </div>
            )}
            {dynamicData.subsidies.length > 0 && (
              <div className="dynamic-info">
                <span className="dynamic-label">💰 Субсидии:</span>
                <span className="dynamic-value">
                  {dynamicData.subsidies.length} условий
                </span>
              </div>
            )}
          </div>
        )}
    </div>
  );
};
