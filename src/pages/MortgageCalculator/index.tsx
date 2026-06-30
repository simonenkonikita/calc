import React from "react";
import { useMortgageCalculator } from "../../hooks/useMortgageCalculations";
import { FormSection } from "./FormSection/FormSection";
import "./index.css";
import { ResultsCalcSection } from "./ResultsCalcSection/ResultsCalcSection";
import { OfferBankSection } from "./OfferBankSection/OfferBankSection";

export const MortgageCalculator: React.FC = () => {
  const {
    formData,
    results,
    isCalculating,
    error,
    handleInputChange,
    handleSelectOffer,
    formatMoney,
  } = useMortgageCalculator();

  return (
    <div className="mortgage-calculator-page">
      <h1>Ипотечный калькулятор</h1>

      <div className="calculator">
        <div className="calculator-form">
          <FormSection formData={formData} onInputChange={handleInputChange} />

          {!isCalculating && results && (
            <div className="results-white-card">
              <ResultsCalcSection
                objectResult={results.objectResult}
                formatMoney={formatMoney}
                area={formData.area}
              />
            </div>
          )}

          {isCalculating && (
            <div className="results-white-card loading-state">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Расчёт ипотечных программ...</p>
              </div>
            </div>
          )}

          {error && !isCalculating && (
            <div className="results-white-card error-state">
              <div className="error-content">
                <div className="error-icon">⚠️</div>
                <div className="error-text">
                  <strong>Ошибка расчёта</strong>
                  <p>{error}</p>
                </div>
                <button
                  className="error-retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Повторить
                </button>
              </div>
            </div>
          )}
        </div>

        {!isCalculating && results && results.bankResults.length > 0 && (
          <>
            <div className="section-divider" />
            <OfferBankSection
              bankResults={results.bankResults}
              onSelectOffer={handleSelectOffer}
              formatMoney={formatMoney}
              mortgageWithoutDownPayment={formData.mortgageWithoutDownPayment}
              mortgagePartialDownPayment={formData.mortgagePartialDownPayment}
              loanTermYears={formData.loanTerm || 30}
              area={formData.area}
              complexName={formData.complex}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MortgageCalculator;
