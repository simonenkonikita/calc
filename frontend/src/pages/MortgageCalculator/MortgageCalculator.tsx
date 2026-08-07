import React from "react";
import { useMortgageCalculator } from "../../hooks/useMortgageCalculations";

import "./MortgageCalculator.css";
import { ResultsCalcSection } from "../../components/ResultsCalcSection/ResultsCalcSection";
import { OfferBankSection } from "../../components/OfferBankSection/OfferBankSection";
import { FormSection } from "../../components/FormSection/FormSection";

export const MortgageCalculator: React.FC = () => {
  const {
    formData,
    results,
    isCalculating,
    error,
    handleInputChange,
    handleSelectOffer,
    formatMoney,
    calculateResults,
    _filtersRef,
  } = useMortgageCalculator();

  const handleCalculate = () => {
    calculateResults();
  };

  return (
    <div className="mortgage-calculator-page">
      <div className="calculator">
        {/* Левая колонка - закреплена */}
        <div className="calculator-form-wrapper">
          <div className="calculator-form-wrapper">
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
                    onClick={calculateResults} // ✅ используем calculateResults
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )}

            <FormSection
              formData={formData}
              onInputChange={handleInputChange}
              onCalculate={handleCalculate} // ✅ передаём кнопку расчёта
              isCalculating={isCalculating}
            />
          </div>
        </div>

        {/* Правая колонка - скроллится */}
        <div className="calculator-results">
          {!isCalculating && results && results.bankResults.length > 0 && (
            <OfferBankSection
              bankResults={results.bankResults}
              onSelectOffer={handleSelectOffer}
              formatMoney={formatMoney}
              mortgageWithoutDownPayment={formData.mortgageWithoutDownPayment}
              mortgagePartialDownPayment={formData.mortgagePartialDownPayment}
              loanTermYears={formData.loanTerm || 30}
              area={formData.area}
              complexName={formData.complex}
              filtersRef={_filtersRef}
            />
          )}

          {!isCalculating && (!results || results.bankResults.length === 0) && (
            <div className="empty-results">
              <p>Заполните параметры и нажмите «Рассчитать»</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
