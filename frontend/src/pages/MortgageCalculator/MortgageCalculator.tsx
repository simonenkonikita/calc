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
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
  };

  const handleProgramTypeFilterChange = (filter: string) => {
    _updateFilters?.({ selectedProgramTypeFilter: filter });
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
  };

  const handleToggleOverstatement = (value: boolean) => {
    _updateFilters?.({ showOverstatement: value });
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
    setTimeout(() => {
      clearCache();
      calculateResults();
    }, 100);
  };

  // 🔥 Определяем, можно ли показывать результаты
  const hasValidData =
    formData.complex && formData.apartmentType && formData.area > 0;
  const hasResults =
    results && results.bankResults && results.bankResults.length > 0;

  return (
    <div className="mortgage-calculator-page">
      <div className="calculator">
        {/* Левая колонка - закреплена */}
        <div className="calculator-form-wrapper">
          <div className="calculator-form-wrapper">
            {/* 🔥 ResultsCalcSection всегда показывается */}
            <div className="results-white-card">
              {isCalculating ? (
                <div className="loading-state">
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Расчёт ипотечных программ...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="error-state">
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
              ) : results ? (
                <ResultsCalcSection
                  objectResult={results.objectResult}
                  formatMoney={formatMoney}
                  area={formData.area}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🏠</div>
                  <p className="empty-title">Заполните параметры объекта</p>
                  <p className="empty-description">
                    Выберите ЖК, тип квартиры и укажите площадь для расчета
                    стоимости
                  </p>
                </div>
              )}
            </div>

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
          {/* 🔥 Всегда показываем либо результаты, либо пустое состояние */}
          {!isCalculating && hasResults ? (
            <OfferBankSection
              bankResults={results.bankResults}
              onSelectOffer={handleSelectOffer}
              formatMoney={formatMoney}
              mortgageWithoutDownPayment={formData.mortgageWithoutDownPayment}
              mortgagePartialDownPayment={formData.mortgagePartialDownPayment}
              loanTermYears={formData.loanTerm || 30}
              area={formData.area}
              complexName={formData.complex}
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
          ) : (
            <div className="empty-results">
              <div className="empty-results-icon">🏦</div>
              <p className="empty-results-title">
                {!hasValidData
                  ? "Заполните параметры объекта"
                  : "Нажмите «Рассчитать» для получения предложений"}
              </p>
              <p className="empty-results-description">
                {!hasValidData
                  ? "Выберите ЖК, тип квартиры и укажите площадь"
                  : "После расчета здесь появятся предложения банков"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
