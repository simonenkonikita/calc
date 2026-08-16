// src/pages/ProjectsPage/components/OfferRow/OfferRow.tsx
import React from "react";
import "./OfferRow.css";

interface OfferRowProps {
  offer: any;
}

export const OfferRow: React.FC<OfferRowProps> = ({ offer }) => {
  const getDisplaySubsidy = () => {
    const hasDynamicSubsidy =
      offer.dynamicSubsidies && offer.dynamicSubsidies.length > 0;

    if (hasDynamicSubsidy) {
      const subsidies = offer.dynamicSubsidies
        .map((rule: any) => rule.subsidyPercent)
        .filter((val: number) => val !== undefined && val !== null)
        .sort((a: number, b: number) => a - b);

      if (subsidies.length === 0) return "—";

      const minSubsidy = subsidies[0];
      const maxSubsidy = subsidies[subsidies.length - 1];

      if (minSubsidy === maxSubsidy) {
        return `${minSubsidy}%`;
      }

      return `${minSubsidy}% — ${maxSubsidy}%`;
    }

    if (offer.subsidyPercent > 0) {
      return `${offer.subsidyPercent}%`;
    }

    return "—";
  };

  const getDisplayRate = () => {
    return (
      <>
        {offer.shortRate && (
          <span className="offer-modern-rate-short">{offer.shortRate}% →</span>
        )}
        <span className="offer-modern-rate">{offer.rate}%</span>
        {offer.twoRate && (
          <span className="offer-modern-rate-two">{offer.twoRate}%</span>
        )}
      </>
    );
  };

  return (
    <div className="offer-modern-item">
      <div className="offer-modern-left">
        <span className="offer-modern-icon">🏦</span>
        <div className="offer-modern-info">
          <span className="offer-modern-name">{offer.bank}</span>
          <span className="offer-modern-desc">{offer.program}</span>
        </div>
      </div>

      <div className="offer-modern-rate-block">{getDisplayRate()}</div>

      <div className="offer-modern-subsidy">
        <span className="stat-value">{getDisplaySubsidy()}</span>
      </div>

      <div className="offer-modern-pv">
        <span className="stat-value">{offer.minPVPercent}%</span>
      </div>

      <div className="offer-modern-info-text">
        <span className="info-text">{offer.description || "—"}</span>
      </div>
    </div>
  );
};
