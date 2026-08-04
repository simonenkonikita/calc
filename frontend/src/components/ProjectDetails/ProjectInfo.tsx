// src/pages/ProjectsPage/components/ProjectDetails/ProjectInfo.tsx
import React from "react";
import "./ProjectInfo.css";
import { ProjectInfo } from "../../utils/types";

interface ProjectInfoProps {
  project: ProjectInfo;
}

export const ProjectInfoSection: React.FC<ProjectInfoProps> = ({ project }) => {
  const getPriceInfo = () => {
    if (!project.apartmentTypes || project.apartmentTypes.length === 0) {
      return "—";
    }

    return (
      <div className="price-types-list">
        {project.apartmentTypes.map((apt, index) => {
          const basePrice = apt.pricePerSquareMeter;
          const withoutPV = apt.surcharges?.withoutDownPayment || 0;
          const partialPV = apt.surcharges?.partialDownPayment || 0;

          return (
            <div key={index} className="price-type-item">
              <div className="price-type-name">{apt.type}</div>
              <div className="price-type-values">
                <span className="price-base">
                  💰 {basePrice.toLocaleString()} ₽/м²
                </span>
                {withoutPV > 0 && (
                  <span className="price-without-pv">
                    🔥 Без ПВ: {(basePrice + withoutPV).toLocaleString()} ₽/м²
                  </span>
                )}
                {partialPV > 0 && (
                  <span className="price-partial-pv">
                    🔥 Частичный ПВ: {(basePrice + partialPV).toLocaleString()}{" "}
                    ₽/м²
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Акции */}
      {project.promotions && project.promotions.length > 0 && (
        <div className="details-section highlight">
          <div className="section-label">🔥 Акции и предложения</div>
          <ul className="info-list promotions">
            {project.promotions.map((promo, index) => (
              <li key={index}>{promo}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Цены и условия */}
      <div className="details-row">
        <div className="details-section half">
          <div className="section-label">💰 Цены</div>
          <div className="section-value price">{getPriceInfo()}</div>
        </div>

        <div className="details-section half">
          <div className="section-label">💳 Условия оплаты</div>
          <ul className="info-list">
            {project.paymentTerms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Банки */}
      <div className="details-section">
        <div className="section-label">🏦 Банки-партнеры</div>
        <div className="banks-tags">
          {project.banks && project.banks.length > 0 ? (
            project.banks.map((bank) => (
              <span key={bank} className="bank-tag">
                {bank}
              </span>
            ))
          ) : (
            <span className="bank-tag-empty">Нет доступных банков</span>
          )}
        </div>
      </div>

      {/* Спецпредложения */}
      {project.specialOffers && project.specialOffers.length > 0 && (
        <div className="details-section special">
          <div className="section-label">⭐ Спецпредложения</div>
          <ul className="info-list special">
            {project.specialOffers.map((offer, index) => (
              <li key={index}>{offer}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
