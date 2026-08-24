// frontend/src/pages/Admin/sections/offers/components/DynamicInfoPopup/DynamicInfoPopup.tsx

import React, { useState, useRef, useEffect } from "react";
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
}

export const DynamicInfoPopup: React.FC<DynamicInfoPopupProps> = ({
  type,
  display,
  details,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const label =
    type === "rate" ? "Динамические ставки" : "Динамические субсидии";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      // Рассчитываем позицию попапа
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const popupWidth = 400;
        const popupHeight = 300;

        let left = rect.left + rect.width / 2 - popupWidth / 2;
        let top = rect.bottom + 10;

        // Проверяем, не выходит ли за пределы экрана
        if (left + popupWidth > window.innerWidth) {
          left = window.innerWidth - popupWidth - 10;
        }
        if (left < 10) {
          left = 10;
        }

        // Если снизу не помещается - показываем сверху
        if (top + popupHeight > window.innerHeight) {
          top = rect.top - popupHeight - 10;
        }

        setPopupPosition({ top, left });
      }
    }
    setIsOpen(!isOpen);
  };

  // Закрываем при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dynamic-info-wrapper" ref={wrapperRef}>
      <span className="dynamic-info-display">
        {display}
        <span className="dynamic-info-icon" onClick={handleToggle}>
          ⓘ
        </span>
      </span>

      {isOpen && (
        <div
          className="dynamic-info-popup"
          ref={popupRef}
          style={{
            position: "fixed",
            top: popupPosition.top,
            left: popupPosition.left,
            zIndex: 99999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dynamic-info-popup-header">
            <span className="popup-title">{label}</span>
            <span className="popup-range">
              {details.min}% — {details.max}%
            </span>
          </div>
          <div className="dynamic-info-popup-body">
            {details.conditions.length > 0 ? (
              details.conditions.map((condition, index) => (
                <div key={index} className="dynamic-condition-item">
                  <span className="condition-value">
                    {condition.rate !== undefined
                      ? `${condition.rate}%`
                      : condition.subsidyPercent !== undefined
                        ? `${condition.subsidyPercent}%`
                        : "—"}
                  </span>
                  <span className="condition-description">
                    {condition.conditionDisplay || "Без условий"}
                  </span>
                </div>
              ))
            ) : (
              <div className="dynamic-condition-empty">
                Нет дополнительных условий
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
