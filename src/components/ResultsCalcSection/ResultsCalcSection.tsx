import React from "react";
import type { ObjectCalculationResult } from "../../utils/types";
import "./ResultsSection.css";

interface ResultsCalcSectionProps {
  objectResult: ObjectCalculationResult;
  formatMoney: (amount: number) => string;
  isManualCost?: boolean;
  area: number;
}

export const ResultsCalcSection: React.FC<ResultsCalcSectionProps> = ({
  objectResult,
  formatMoney,
  area = 0,
}) => {
  const calculatedPricePerM2 = area > 0 ? objectResult.objectCost / area : null;

  return (
    <div className="results-calc-section">
      <div className="results-calc-block">
        <div className="results-calc-header">
          <h3 className="results-calc-title"> Стоимость объекта:</h3>
          <div className="results-calc-value">
            {formatMoney(objectResult.objectCost)}
          </div>
        </div>

        <div className="results-calc-details">
          <div className="results-calc-detail-item">
            <span className="detail-label">Первоначальный взнос:</span>
            <span className="detail-value">
              {formatMoney(objectResult.downPayment)}
              <span className="detail-percent">
                (
                {(
                  (objectResult.downPayment / objectResult.objectCost) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </span>
          </div>
          <div className="results-calc-detail-item">
            <span className="detail-label">Сумма ипотеки:</span>
            <span className="detail-value">
              {formatMoney(objectResult.remainingAmount)}
            </span>
          </div>
          <div className="results-calc-detail-item">
            <span className="detail-label">Цена за м²:</span>
            <span className="detail-value">
              {calculatedPricePerM2 !== null && calculatedPricePerM2 > 0
                ? formatMoney(calculatedPricePerM2)
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
