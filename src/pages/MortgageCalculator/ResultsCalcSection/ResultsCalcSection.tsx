import React from "react";
import type { ObjectCalculationResult } from "../../../utils/types";
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
    <div className="results-section">
      <div className="object-cost-block">
        <h3>Стоимость объекта</h3>
        <div className="object-cost-value">
          {formatMoney(objectResult.objectCost)}
        </div>
        <div className="object-cost-details">
          <div>
            <strong>ПВ:</strong> {formatMoney(objectResult.downPayment)} (
            {(
              (objectResult.downPayment / objectResult.objectCost) *
              100
            ).toFixed(1)}
            %)
          </div>
          <div>
            <strong>Ипотека:</strong>{" "}
            {formatMoney(objectResult.remainingAmount)}
          </div>
          <div>
            <strong>Цена за м²:</strong>{" "}
            {calculatedPricePerM2 !== null && calculatedPricePerM2 > 0
              ? formatMoney(calculatedPricePerM2)
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
};
