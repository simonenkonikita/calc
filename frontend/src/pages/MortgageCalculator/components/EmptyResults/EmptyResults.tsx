// EmptyResults.tsx
import React from "react";
import "./EmptyResults.css";

export interface EmptyResultsProps {
  hasValidData: boolean;
  formData: {
    complex?: string;
    apartmentType?: string;
    area?: number;
  };
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({
  hasValidData,
  formData,
}) => {
  return (
    <div className="empty-results">
      <div className="empty-results-content">
        <div className="empty-results-badge">
          <span className="badge-dot"></span>
          {!hasValidData ? "Начните с выбора объекта" : "Почти готово!"}
        </div>

        <h2 className="empty-results-title">
          {!hasValidData ? (
            <>
              Выберите параметры <br />
              <span className="empty-results-gradient">для расчета</span>
            </>
          ) : (
            <>
              Нажмите «Рассчитать» <br />
              <span className="empty-results-gradient">
                и получите предложения
              </span>
            </>
          )}
        </h2>

        <p className="empty-results-description">
          {!hasValidData ? (
            <>
              Укажите жилой комплекс, тип квартиры и площадь, <br />
              чтобы получить точный расчет стоимости
            </>
          ) : (
            <>
              Мы сравним предложения всех банков и подберем <br />
              оптимальную ипотечную программу для вашего клиента
            </>
          )}
        </p>

        <div className="empty-results-steps">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <span className="step-label">Выберите ЖК</span>
              <span className="step-status">
                {formData.complex ? "✅" : "⬜"}
              </span>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <span className="step-label">Тип квартиры</span>
              <span className="step-status">
                {formData.apartmentType ? "✅" : "⬜"}
              </span>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <span className="step-label">Укажите площадь</span>
              <span className="step-status">
                {formData.area && formData.area > 0 ? "✅" : "⬜"}
              </span>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <span className="step-label">Нажмите «Рассчитать»</span>
              <span className="step-status">{hasValidData ? "⏳" : "⏸️"}</span>
            </div>
          </div>
        </div>

        {!hasValidData && (
          <div className="empty-results-tip">
            <span className="tip-icon">💡</span>
            <span className="tip-text">
              Заполните все поля в левой панели, чтобы начать расчет
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyResults;
