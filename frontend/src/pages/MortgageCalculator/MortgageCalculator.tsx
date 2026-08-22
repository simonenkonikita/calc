// MortgageCalculator.tsx

import React, { useEffect } from "react";
import "./MortgageCalculator.css";
import { ResultsCalcSection } from "../../components/ResultsCalcSection/ResultsCalcSection";
import { OfferBankSection } from "../../components/OfferBankSection/OfferBankSection";
import { FormSection } from "../../components/FormSection/FormSection";
import { useMortgageCalculator } from "../../hooks/ui/useMortgageCalculator";

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
    clearCache,
    _filtersRef,
    _updateFilters,
    _getFilters,
  } = useMortgageCalculator();

  const handleCalculate = () => {
    clearCache();
    calculateResults();
  };

  // 🔥 Получаем текущие фильтры
  const currentFilters = _getFilters?.() || {
    selectedBankFilter: "all",
    selectedProgramTypeFilter: "all",
    selectedCards: new Set<number>(),
    showOverstatement: false,
  };

  // 🔥 Функции обновления фильтров с автоматическим перерасчетом
  const handleBankFilterChange = (filter: string) => {
    _updateFilters?.({ selectedBankFilter: filter });
    // 🔥 Автоматический перерасчет после изменения фильтра
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
  };

  const handleProgramTypeFilterChange = (filter: string) => {
    _updateFilters?.({ selectedProgramTypeFilter: filter });
    // 🔥 Автоматический перерасчет после изменения фильтра
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
  };

  const handleToggleOverstatement = (value: boolean) => {
    _updateFilters?.({ showOverstatement: value });
    // 🔥 Автоматический перерасчет после изменения фильтра
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
  };

  const handleResetFilters = () => {
    _updateFilters?.({
      selectedBankFilter: "all",
      selectedProgramTypeFilter: "all",
      selectedCards: new Set<number>(),
      showOverstatement: false,
    });
    // 🔥 Автоматический перерасчет после сброса фильтров
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
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
                    onClick={calculateResults}
                  >
                    Повторить
                  </button>
                </div>
              </div>
            )}

            <FormSection
              formData={formData}
              onInputChange={handleInputChange}
              onCalculate={handleCalculate}
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
              // 🔥 Передаем фильтры и колбэки
              selectedBankFilter={currentFilters.selectedBankFilter}
              selectedProgramTypeFilter={
                currentFilters.selectedProgramTypeFilter
              }
              showOverstatement={currentFilters.showOverstatement}
              onBankFilterChange={handleBankFilterChange}
              onProgramTypeFilterChange={handleProgramTypeFilterChange}
              onToggleOverstatement={handleToggleOverstatement}
              onResetFilters={handleResetFilters}
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
