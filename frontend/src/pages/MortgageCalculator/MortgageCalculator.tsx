// MortgageCalculator.tsx

import React, { useMemo } from "react";
import "./MortgageCalculator.css";

import { FormSection } from "./components/FormSection/FormSection";

import { useMortgageCalculator } from "../../hooks/ui/useMortgageCalculator";
import EmptyResults from "./components/EmptyResults/EmptyResults";
import { OfferBankSection } from "./components/OfferBankSection/OfferBankSection";
import { ResultsCalcSection } from "./components/ResultsCalcSection/ResultsCalcSection";

export const MortgageCalculator: React.FC = () => {
  const {
    formData,
    results,
    isCalculating,
    error,
    handleInputChange,
    handleSelectOffer,
    formatMoney,
    formChanged,
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

  // ============================================================
  // 🔥 ПАРАМЕТРЫ ДЛЯ ПРОВЕРКИ ДОСТУПНОСТИ ОФФЕРОВ
  // ============================================================
  // Срок ипотеки в месяцах
  const loanTermMonths = useMemo(
    () => (formData.loanTerm || 30) * 12,
    [formData.loanTerm],
  );

  // 🔥 Определяем, можно ли показывать результаты
  const hasValidData = Boolean(
    formData.complex && formData.apartmentType && formData.area > 0,
  );

  const hasResults =
    results && results.bankResults && results.bankResults.length > 0;

  // 🔥 Создаем пустой объект для отображения прочерков
  const emptyObjectResult = {
    objectCost: 0,
    downPayment: 0,
    remainingAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    overpayment: 0,
    pricePerSquareMeter: 0,
    area: 0,
  };

  return (
    <div className="mortgage-calculator-page">
      <div className="calculator">
        {/* Левая колонка — только форма */}
        <div className="calculator-form-wrapper">
          <FormSection
            formData={formData}
            onInputChange={handleInputChange}
            onCalculate={handleCalculate}
            isCalculating={isCalculating}
          />
        </div>

        {/* Правая колонка — результаты + офферы */}
        <div className="calculator-results">
          {/* 🔥 Секция результатов над офферами */}
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
              />
            ) : (
              <ResultsCalcSection
                objectResult={emptyObjectResult}
                formatMoney={formatMoney}
              />
            )}
          </div>

          {!isCalculating && hasResults ? (
            <OfferBankSection
              bankResults={results.bankResults}
              onSelectOffer={handleSelectOffer}
              formatMoney={formatMoney}
              mortgageWithoutDownPayment={formData.mortgageWithoutDownPayment}
              mortgagePartialDownPayment={formData.mortgagePartialDownPayment}
              loanTermYears={formData.loanTerm || 30}
              // 🔥 НОВОЕ — прокидываем параметры для проверки доступности
              loanTermMonths={loanTermMonths}
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
            <EmptyResults
              hasValidData={hasValidData}
              formChanged={formChanged}
              formData={formData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
