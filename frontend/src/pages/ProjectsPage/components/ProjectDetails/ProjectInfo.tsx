// src/pages/ProjectsPage/components/ProjectDetails/ProjectInfo.tsx

import React from "react";
import "./ProjectInfo.css";
import { ProjectInfo } from "../../../../utils/types";

interface ProjectInfoProps {
  project: ProjectInfo;
  programs?: any[];
  loading?: boolean;
}

export const ProjectInfoSection: React.FC<ProjectInfoProps> = ({
  project,
  programs = [],
  loading = false,
}) => {
  // 🔥 Извлекаем уникальные банки из программ
  const banks = React.useMemo(() => {
    const bankSet = new Set<string>();
    programs.forEach((program) => {
      if (program.offers && program.offers.length > 0) {
        program.offers.forEach((offer: any) => {
          if (offer.bank) {
            bankSet.add(offer.bank);
          }
        });
      }
    });
    return Array.from(bankSet);
  }, [programs]);

  const getPriceInfo = () => {
    if (!project.apartmentTypes || project.apartmentTypes.length === 0) {
      return "—";
    }

    return (
      <div className="price-types-list">
        {project.apartmentTypes.map((apt, index) => {
          const basePrice = Number(apt.pricePerSquareMeter) || 0;
          const withoutPV = Number(apt.surcharges?.withoutDownPayment) || 0;
          const partialPV = Number(apt.surcharges?.partialDownPayment) || 0;

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
      {/* 🔥 Акции и спецпредложения - ВСЕГДА отображаются */}
      <div className="details-row">
        {/* Акции */}
        <div className="details-section half highlight">
          <div className="section-label">🔥 Акции и предложения</div>
          {project.promotions && project.promotions.length > 0 ? (
            <ul className="info-list promotions">
              {project.promotions.map((promo, index) => (
                <li key={index}>{promo}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-message">Нет активных акций</div>
          )}
        </div>

        {/* Спецпредложения */}
        <div className="details-section half special">
          <div className="section-label">⭐ Спецпредложения</div>
          {project.specialOffers && project.specialOffers.length > 0 ? (
            <ul className="info-list special">
              {project.specialOffers.map((offer, index) => (
                <li key={index}>{offer}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-message">Нет спецпредложений</div>
          )}
        </div>
      </div>

      {/* Цены и условия оплаты */}
      <div className="details-row">
        <div className="details-section half">
          <div className="section-label">💰 Цены</div>
          <div className="section-value price">{getPriceInfo()}</div>
        </div>

        <div className="details-section half">
          <div className="section-label">💳 Условия оплаты</div>
          {project.paymentTerms && project.paymentTerms.length > 0 ? (
            <ul className="info-list">
              {project.paymentTerms.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ul>
          ) : (
            <div className="empty-message">Нет условий оплаты</div>
          )}
        </div>
      </div>

      {/* Банки */}
      <div className="details-section">
        <div className="section-label">🏦 Банки-партнеры</div>
        <div className="banks-tags">
          {loading ? (
            <span className="bank-tag-empty">Загрузка банков...</span>
          ) : banks && banks.length > 0 ? (
            banks.map((bank) => (
              <span key={bank} className="bank-tag">
                {bank}
              </span>
            ))
          ) : (
            <span className="bank-tag-empty">Нет доступных банков</span>
          )}
        </div>
      </div>
    </>
  );
};
