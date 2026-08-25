// frontend/src/pages/Admin/sections/offers/components/DynamicInfoPopup/DynamicInfoPopup.tsx

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./DynamicInfoPopup.css";

interface DynamicCondition {
  rate?: number;
  subsidyPercent?: number;
  conditionDisplay: string;
}

interface DynamicInfoPopupProps {
  type: "rate" | "subsidy";
  display: string;
  details: {
    min: number;
    max: number;
    conditions: DynamicCondition[];
  };
  label?: string;
  icon?: string;
  bankName?: string;
  programName?: string;
}

export const DynamicInfoPopup: React.FC<DynamicInfoPopupProps> = ({
  type,
  display,
  details,
  label: customLabel,
  icon: customIcon,
  bankName,
  programName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultLabel =
    type === "rate" ? "Динамические ставки" : "Динамические субсидии";
  const defaultIcon = type === "rate" ? "📊" : "💰";

  const label = customLabel || defaultLabel;
  const icon = customIcon || defaultIcon;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
  };

  // Закрываем по Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Рендерим модальное окно через портал
  const renderModal = () => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div className="dynamic-modal-overlay" onClick={handleClose}>
        <div className="dynamic-modal" onClick={(e) => e.stopPropagation()}>
          {/* Заголовок с информацией о банке и программе */}
          <div className="dynamic-modal-header">
            <div className="dynamic-modal-title-wrapper">
              <span className="dynamic-modal-title">
                <span className="modal-title-icon">{icon}</span>
                {label}
              </span>
              {(bankName || programName) && (
                <div className="dynamic-modal-subtitle">
                  {bankName && (
                    <span className="modal-bank">🏦 {bankName}</span>
                  )}
                  {bankName && programName && (
                    <span className="modal-divider">•</span>
                  )}
                  {programName && (
                    <span className="modal-program">📋 {programName}</span>
                  )}
                </div>
              )}
            </div>
            <button className="dynamic-modal-close" onClick={handleClose}>
              ✕
            </button>
          </div>

          <div className="dynamic-modal-range">
            {details.min}% — {details.max}%
          </div>

          <div className="dynamic-modal-body">
            {details.conditions.length > 0 ? (
              details.conditions.map((condition, index) => (
                <div key={index} className="dynamic-modal-item">
                  <span className="modal-item-value">
                    {condition.rate !== undefined
                      ? `${condition.rate}%`
                      : condition.subsidyPercent !== undefined
                        ? `${condition.subsidyPercent}%`
                        : "—"}
                  </span>
                  <span className="modal-item-description">
                    {condition.conditionDisplay || "Без условий"}
                  </span>
                </div>
              ))
            ) : (
              <div className="dynamic-modal-empty">
                Нет дополнительных условий
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <>
      <span className="dynamic-info-display" onClick={handleOpen}>
        {display}
        <span className="dynamic-info-icon">ⓘ</span>
      </span>
      {renderModal()}
    </>
  );
};
