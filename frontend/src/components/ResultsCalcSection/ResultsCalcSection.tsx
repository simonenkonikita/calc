// ResultsCalcSection.tsx

import React from "react";
import type { ObjectCalculationResult } from "../../utils/types";
import "./ResultsSection.css";
import { calculatePricePerM2 } from "../../utils/pricePerM2/pricePerM2";

interface ResultsCalcSectionProps {
  objectResult: ObjectCalculationResult;
  formatMoney: (amount: number) => string;
  isManualCost?: boolean;
}

export const ResultsCalcSection: React.FC<ResultsCalcSectionProps> = ({
  objectResult,
  formatMoney,
}) => {
  const area = objectResult.area;

  const calculatedPricePerM2 = calculatePricePerM2(
    objectResult.objectCost,
    area,
  );

  // Проверяем, есть ли реальные данные
  const hasData = objectResult.objectCost > 0;

  return (
    <div className="results-calc-section">
      <div className="results-calc-block">
        <div className="results-calc-header">
          <h3 className="results-calc-title"> Стоимость объекта:</h3>
          <div className="results-calc-value">
            {hasData ? formatMoney(objectResult.objectCost) : "—"}
          </div>
        </div>

        <div className="results-calc-details">
          <div className="results-calc-detail-item">
            <span className="detail-label">Первоначальный взнос:</span>
            <span className="detail-value">
              {hasData ? (
                <>
                  {formatMoney(objectResult.downPayment)}
                  <span className="detail-percent">
                    (
                    {(
                      (objectResult.downPayment / objectResult.objectCost) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
          <div className="results-calc-detail-item">
            <span className="detail-label">Сумма ипотеки:</span>
            <span className="detail-value">
              {hasData ? formatMoney(objectResult.remainingAmount) : "—"}
            </span>
          </div>
          <div className="results-calc-detail-item">
            <span className="detail-label">Цена за м²:</span>
            <span className="detail-value">
              {hasData &&
              calculatedPricePerM2 !== null &&
              calculatedPricePerM2 > 0
                ? formatMoney(calculatedPricePerM2)
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
