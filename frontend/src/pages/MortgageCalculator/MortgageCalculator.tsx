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

  // 🔥 Создаем пустой объект для отображения прочерков
  const emptyObjectResult = {
    objectCost: 0,
    downPayment: 0,
    remainingAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    overpayment: 0,
    pricePerSquareMeter: 0,
  };

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
                // 🔥 Показываем те же поля, но с прочерками
                <ResultsCalcSection
                  objectResult={emptyObjectResult}
                  formatMoney={formatMoney}
                  area={formData.area || 0}
                />
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
            // 🔥 Блок в стиле лендинга без частиц
            <div className="empty-results">
              <div className="empty-results-content">
                <div className="empty-results-badge">
                  <span className="badge-dot"></span>
                  {!hasValidData ? "Начните с выбора объекта" : "Почти готово!"}
                </div>

                <h2 className="empty-results-title">
                  {!hasValidData ? (
                    <>
                      Выберите параметры <br />
                      <span className="empty-results-gradient">
                        для расчета
                      </span>
                    </>
                  ) : (
                    <>
                      Нажмите «Рассчитать» <br />
                      <span className="empty-results-gradient">
                        и получите предложения
                      </span>
                    </>
                  )}
                </h2>

                <p className="empty-results-description">
                  {!hasValidData ? (
                    <>
                      Укажите жилой комплекс, тип квартиры и площадь, <br />
                      чтобы получить точный расчет стоимости
                    </>
                  ) : (
                    <>
                      Мы сравним предложения всех банков и подберем <br />
                      оптимальную ипотечную программу для вашего клиента
                    </>
                  )}
                </p>

                <div className="empty-results-steps">
                  <div className="step-item">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <span className="step-label">Выберите ЖК</span>
                      <span className="step-status">
                        {formData.complex ? "✅" : "⬜"}
                      </span>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <span className="step-label">Тип квартиры</span>
                      <span className="step-status">
                        {formData.apartmentType ? "✅" : "⬜"}
                      </span>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <span className="step-label">Укажите площадь</span>
                      <span className="step-status">
                        {formData.area > 0 ? "✅" : "⬜"}
                      </span>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <span className="step-label">Нажмите «Рассчитать»</span>
                      <span className="step-status">
                        {hasValidData ? "⏳" : "⏸️"}
                      </span>
                    </div>
                  </div>
                </div>

                {!hasValidData && (
                  <div className="empty-results-tip">
                    <span className="tip-icon">💡</span>
                    <span className="tip-text">
                      Заполните все поля в левой панели, чтобы начать расчет
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
