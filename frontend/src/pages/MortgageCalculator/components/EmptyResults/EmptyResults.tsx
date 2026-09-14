// EmptyResults.tsx
import React from "react";
import "./EmptyResults.css";

export interface EmptyResultsProps {
  hasValidData: boolean;
  /** 🔥 Форма была изменена после расчёта */
  formChanged?: boolean;
  formData: {
    complex?: string;
    apartmentType?: string;
    area?: number;
  };
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({
  hasValidData,
  formChanged = false,
  formData,
}) => {
  // 🔥 Определяем контент в зависимости от состояния
  let icon = "📋";
  let title = "Заполните форму";
  let hint = "Заполните форму слева для подбора предложений";

  if (formChanged) {
    icon = "⚠️";
    title = "Форма изменена";
    hint = "Для подбора предложений нажмите «Рассчитать»";
  } else if (hasValidData) {
    icon = "🚀";
    title = "Готово к расчёту";
    hint = "Нажмите «Рассчитать», чтобы подобрать предложения банков";
  }

  return (
    <div className="empty-results">
      <div className="empty-results-content">
        <div className="empty-results-icon">{icon}</div>
        <h2 className="empty-results-title">{title}</h2>
        <p className="empty-results-hint">{hint}</p>
      </div>
    </div>
  );
};

export default EmptyResults;