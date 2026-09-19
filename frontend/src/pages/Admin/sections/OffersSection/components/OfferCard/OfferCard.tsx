// frontend/src/pages/Admin/sections/offers/components/OfferCard/OfferCard.tsx

import React from "react";
import { OfferCardProps } from "../../types";
import "./OfferCard.css";
import { DynamicInfoPopup } from "../../../../../../components/DynamicInfo/DynamicInfoPopup";

import ActionButtons, {
  ActionButton,
} from "../../../../components/ActionButtons/ActionButtons";
import StatusBadge from "../../../../components/StatusBadge/StatusBadge";

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
  // 🔥 Получаем данные с деталями
  const rateResult = getDisplayRate(offer, dynamicData);
  const subsidyResult = getDisplaySubsidy(offer, dynamicData);

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

  // 🔥 Рендер ставки
  const renderRateDisplay = () => {
    if (rateResult.type === "dynamic" && rateResult.details) {
      return (
        <DynamicInfoPopup
          type="rate"
          display={rateResult.display as string}
          details={rateResult.details}
        />
      );
    }
    return rateResult.display;
  };

  // 🔥 Рендер субсидии
  const renderSubsidyDisplay = () => {
    if (subsidyResult.type === "dynamic" && subsidyResult.details) {
      return (
        <DynamicInfoPopup
          type="subsidy"
          display={subsidyResult.display}
          details={subsidyResult.details}
        />
      );
    }

    const typeClass = subsidyResult.type === "fixed" ? "fixed" : "none";
    return (
      <span className={`subsidy-badge subsidy-${typeClass}`}>
        {subsidyResult.display}
      </span>
    );
  };

  // 🔥 Определяем кнопки для ActionButtons
  const getActionButtons = (): ActionButton[] => {
    const buttons: ActionButton[] = [
      // ← вот это ключевое!
      {
        icon: "✏️",
        onClick: () => onEdit(offer),
        variant: "primary",
        title: "Редактировать",
      },
      {
        icon: "📋",
        onClick: () => onCopy(offer.id),
        variant: "warning",
        title: "Копировать",
      },
    ];

    if (isOfferEffectiveActive) {
      buttons.push({
        icon: "🗑️",
        onClick: () => onDelete(offer.id),
        variant: "danger",
        title: "Удалить",
      });
    } else {
      buttons.push({
        icon: "↩️",
        onClick: () => onRestore(offer.id),
        variant: "success",
        title: "Восстановить",
      });
      buttons.push({
        icon: "💀",
        onClick: () => onHardDelete(offer.id),
        variant: "danger",
        title: "Полностью удалить",
      });
    }

    return buttons;
  };

  return (
    <div className="offer-card">
      <div className="offer-card-header">
        <div className="offer-card-title">
          <span className="offer-program-name">{offer.program}</span>
        </div>
        <div className="offer-card-actions">
          <StatusBadge
            isActive={isOfferEffectiveActive}
            inactiveText={getInactiveReason()}
          />
          <ActionButtons buttons={getActionButtons()} size="sm" />
        </div>
      </div>

      <div className="offer-card-body">
        <div className="offer-details-top">
          <div className="offer-detail-item">
            <span className="detail-label">Ставка:</span>
            <span className="detail-value rate-cell">
              {renderRateDisplay()}
            </span>
          </div>
          <div className="offer-detail-item">
            <span className="detail-label">Субсидия:</span>
            <span className="detail-value subsidy-cell">
              {renderSubsidyDisplay()}
            </span>
          </div>
          <div className="offer-detail-item">
            <span className="detail-label">Мин. ПВ:</span>
            <span className="detail-value">{offer.minPVPercent}%</span>
          </div>
        </div>

        <div className="offer-complexes-row">
          <span className="detail-label">ЖК:</span>
          <div className="complexes-list">
            {renderComplexesList(offer.complexes)}
          </div>
        </div>

        {offer.badges && offer.badges.length > 0 && (
          <div className="offer-badges-row">
            {offer.badges.map((badge, index) => (
              <span key={index} className="offer-badge">
                {badge}
              </span>
            ))}
          </div>
        )}

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
