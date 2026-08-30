// FormSection.tsx - исправленная версия

import { useMemo, ChangeEvent, useEffect } from "react";
import { CalculatorFormData } from "../../utils/types";
import "./FormSection.css";
import { useConfig } from "../../hooks/api/useConfig";
import { useComplexData } from "../../hooks/api/useComplexData";
import { usePriceData } from "../../hooks/api/usePriceData";

interface FormSectionProps {
  formData: CalculatorFormData;
  onInputChange: <K extends keyof CalculatorFormData>(
    field: K,
    value: CalculatorFormData[K],
  ) => void;
  onCalculate?: () => void;
  isCalculating?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  onInputChange,
  onCalculate,
  isCalculating = false,
}) => {
  const { config, loading: configLoading } = useConfig();
  const DEPOSIT_AMOUNT = config?.deposit ?? 0;
  const MIN_DOWN_PAYMENT_PERCENT = config?.minDownPaymentPercent ?? 20.1;
  const MAX_DOWN_PAYMENT_PERCENT = config?.maxDownPaymentPercent ?? 99.9;
  const MIN_AREA = config?.minArea ?? 1;
  const MAX_AREA = config?.maxArea ?? 150;
  const MIN_LOAN_TERM = config?.minLoanTerm ?? 1;
  const MAX_LOAN_TERM = config?.maxLoanTerm ?? 30;

  // Загружаем данные о ЖК и типах квартир из API
  const {
    complexes,
    apartmentTypes,
    loading: complexesLoading,
    error: complexesError,
    loadApartmentTypes,
  } = useComplexData();

  // Загружаем цену для выбранного ЖК и типа квартиры
  const { priceData, loading: priceLoading, fetchPrice } = usePriceData();

  // Загружаем типы квартир при изменении ЖК
  useEffect(() => {
    if (formData.complex) {
      loadApartmentTypes(formData.complex);
    }
  }, [formData.complex, loadApartmentTypes]);

  // Загружаем цену при изменении ЖК и типа квартиры
  useEffect(() => {
    if (formData.complex && formData.apartmentType) {
      fetchPrice(formData.complex, formData.apartmentType);
    }
  }, [formData.complex, formData.apartmentType, fetchPrice]);

  // Получаем доступные типы квартир из API данных
  const availableTypes = useMemo(() => {
    return apartmentTypes.map((item) => item.type);
  }, [apartmentTypes]);

  // Получаем цену за м² из API
  const pricePerSquareMeter = useMemo(() => {
    if (priceData) {
      // Если включена ипотека без ПВ или с частичным ПВ, добавляем наценку
      if (formData.mortgageWithoutDownPayment) {
        return (
          priceData.pricePerSquareMeter +
          (priceData.surcharges?.withoutDownPayment || 0)
        );
      }
      if (formData.mortgagePartialDownPayment) {
        return (
          priceData.pricePerSquareMeter +
          (priceData.surcharges?.partialDownPayment || 0)
        );
      }
      return priceData.pricePerSquareMeter;
    }
    return 0; // Возвращаем 0, если данных нет
  }, [
    priceData,
    formData.mortgageWithoutDownPayment,
    formData.mortgagePartialDownPayment,
  ]);

  // ============================================================
  // РАСЧЕТ БАЗОВОЙ СТОИМОСТИ ОБЪЕКТА (без учета брони)
  // ============================================================
  const baseObjectCost = useMemo(() => {
    if (formData.manualObjectCost && formData.manualObjectCost > 0) {
      return formData.manualObjectCost;
    }

    return formData.area * pricePerSquareMeter;
  }, [formData.manualObjectCost, formData.area, pricePerSquareMeter]);

  // ============================================================
  // РАСЧЕТ ФИНАЛЬНОЙ СТОИМОСТИ ОБЪЕКТА (с учетом брони)
  // ============================================================
  const calculateObjectCost = useMemo(() => {
    if (formData.considerDepositInCost) {
      return Math.max(0, baseObjectCost - DEPOSIT_AMOUNT);
    }
    return baseObjectCost;
  }, [baseObjectCost, formData.considerDepositInCost, DEPOSIT_AMOUNT]);

  // ============================================================
  // ПРОВЕРКА: достаточно ли ПВ для полной оплаты
  // ============================================================
  const isFullPayment = useMemo(() => {
    return (
      calculateObjectCost > 0 &&
      formData.manualDownPayment >= calculateObjectCost
    );
  }, [formData.manualDownPayment, calculateObjectCost]);

  // ============================================================
  // ПРОВЕРКА: включена ли ипотека без ПВ или частичный ПВ
  // ============================================================
  const isAnyMortgageTypeEnabled = useMemo(() => {
    return (
      formData.mortgageWithoutDownPayment || formData.mortgagePartialDownPayment
    );
  }, [
    formData.mortgageWithoutDownPayment,
    formData.mortgagePartialDownPayment,
  ]);

  const isDownPaymentDisabled = isAnyMortgageTypeEnabled || isFullPayment;

  // ============================================================
  // ОБРАБОТЧИКИ ДЛЯ ПОЛЯ "ПЕРВОНАЧАЛЬНЫЙ ВЗНОС"
  // ============================================================
  const handleDownPaymentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("downPaymentPercent", value as any);
      return;
    }

    const numValue = Number(value);

    if (numValue > MAX_DOWN_PAYMENT_PERCENT) {
      onInputChange("downPaymentPercent", MAX_DOWN_PAYMENT_PERCENT);
      return;
    }

    onInputChange("downPaymentPercent", numValue);
  };

  const handleDownPaymentBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || Number(value) < MIN_DOWN_PAYMENT_PERCENT) {
      onInputChange("downPaymentPercent", MIN_DOWN_PAYMENT_PERCENT);
    } else if (Number(value) > MAX_DOWN_PAYMENT_PERCENT) {
      onInputChange("downPaymentPercent", MAX_DOWN_PAYMENT_PERCENT);
    }
  };

  // ============================================================
  // ОБРАБОТЧИКИ ДЛЯ ПОЛЯ "РУЧНОЙ ВВОД ПВ"
  // ============================================================
  const handleManualDownPaymentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("manualDownPayment", 0);
      return;
    }

    const numValue = Number(value);

    if (numValue < 0) {
      onInputChange("manualDownPayment", 0);
      return;
    }

    if (isNaN(numValue)) {
      return;
    }

    const objectCost = calculateObjectCost;

    if (numValue >= objectCost) {
      onInputChange("manualDownPayment", objectCost);
      onInputChange("mortgageWithoutDownPayment", false);
      onInputChange("mortgagePartialDownPayment", false);
      return;
    }

    onInputChange("manualDownPayment", numValue);
  };

  const handleManualDownPaymentBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("manualDownPayment", 0);
      return;
    }

    const numValue = Number(value);

    if (numValue < 0) {
      onInputChange("manualDownPayment", 0);
      return;
    }

    if (isNaN(numValue)) {
      onInputChange("manualDownPayment", 0);
      return;
    }

    const objectCost = calculateObjectCost;

    if (numValue >= objectCost) {
      onInputChange("manualDownPayment", objectCost);
      onInputChange("mortgageWithoutDownPayment", false);
      onInputChange("mortgagePartialDownPayment", false);
      return;
    }

    onInputChange("manualDownPayment", numValue);
  };

  // ============================================================
  // ОБРАБОТЧИК ДЛЯ ЧЕКБОКСА "УЧИТЫВАТЬ БРОНЬ"
  // ============================================================
  const handleConsiderDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const objectCost = checked
      ? baseObjectCost - DEPOSIT_AMOUNT
      : baseObjectCost;

    if (formData.manualDownPayment > objectCost) {
      onInputChange("manualDownPayment", objectCost);
      onInputChange("mortgageWithoutDownPayment", false);
      onInputChange("mortgagePartialDownPayment", false);
    }

    onInputChange("considerDepositInCost", checked);
  };

  // ============================================================
  // ОБРАБОТЧИКИ ДЛЯ ПОЛЯ "ПЛОЩАДЬ"
  // ============================================================
  const handleAreaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("area", value as any);
      return;
    }

    const numValue = Number(value);

    if (numValue > MAX_AREA) {
      onInputChange("area", MAX_AREA);
      return;
    }

    onInputChange("area", numValue);
  };

  const handleAreaBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("area", MIN_AREA);
      return;
    }

    const numValue = Number(value);

    if (numValue < MIN_AREA) {
      onInputChange("area", MIN_AREA);
    } else if (numValue > MAX_AREA) {
      onInputChange("area", MAX_AREA);
    }
  };

  // ============================================================
  // ОБРАБОТЧИКИ ДЛЯ ПОЛЯ "СРОК ИПОТЕКИ"
  // ============================================================
  const handleLoanTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("loanTerm", value as any);
      return;
    }

    const numValue = Number(value);

    if (numValue > MAX_LOAN_TERM) {
      onInputChange("loanTerm", MAX_LOAN_TERM);
      return;
    }

    onInputChange("loanTerm", numValue);
  };

  const handleLoanTermBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      onInputChange("loanTerm", MIN_LOAN_TERM);
      return;
    }

    const numValue = Number(value);

    if (numValue < MIN_LOAN_TERM) {
      onInputChange("loanTerm", MIN_LOAN_TERM);
    } else if (numValue > MAX_LOAN_TERM) {
      onInputChange("loanTerm", MAX_LOAN_TERM);
    }
  };

  // ============================================================
  // ОБРАБОТЧИК ДЛЯ ИЗМЕНЕНИЯ ЖК (сброс типа квартиры)
  // ============================================================
  const handleComplexChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newComplex = e.target.value;
    onInputChange("complex", newComplex);
    // Сбрасываем тип квартиры при смене ЖК
    onInputChange("apartmentType", "");
  };

  // Если конфиг загружается или данные комплексов загружаются, показываем индикатор
  if (configLoading || complexesLoading) {
    return (
      <div className="form-section">
        <div className="loading-config">Загрузка конфигурации...</div>
      </div>
    );
  }

  if (complexesError) {
    return (
      <div className="form-section">
        <div className="error-message">
          Ошибка загрузки данных: {complexesError}
        </div>
      </div>
    );
  }

  return (
    <div className="form-section">
      <div className="form-grid">
        {/* Блок: Параметры объекта */}
        <div className="form-block">
          <h2>Параметры объекта</h2>
          <div className="form-fields">
            <div className="field">
              <label>Жилой комплекс</label>
              <select value={formData.complex} onChange={handleComplexChange}>
                <option value="">Выберите ЖК</option>
                {complexes.map((complex) => (
                  <option key={complex} value={complex}>
                    {complex}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Тип квартиры</label>
              <select
                value={formData.apartmentType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  onInputChange("apartmentType", e.target.value)
                }
                disabled={!formData.complex || availableTypes.length === 0}
              >
                <option value="">Выберите тип</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {priceLoading && (
                <span className="loading-price">Загрузка цены...</span>
              )}
            </div>

            <div className="field">
              <label>Площадь (м²)</label>
              <input
                type="number"
                min={MIN_AREA}
                max={MAX_AREA}
                step={1}
                value={formData.area || ""}
                onChange={handleAreaChange}
                onBlur={handleAreaBlur}
                placeholder={`${MIN_AREA} - ${MAX_AREA}`}
              />
            </div>

            <div className="field">
              <label>Ручной ввод стоимости объекта (₽)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={formData.manualObjectCost || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange(
                    "manualObjectCost",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                placeholder="Введите стоимость"
              />
            </div>
          </div>
        </div>

        {/* Блок: Параметры ипотеки */}
        <div className="form-block">
          <h2>Параметры ипотеки</h2>
          <div className="form-fields">
            <div className="field">
              <label>Первоначальный взнос (%)</label>
              <input
                type="number"
                min={MIN_DOWN_PAYMENT_PERCENT}
                max={MAX_DOWN_PAYMENT_PERCENT}
                step={0.1}
                value={formData.downPaymentPercent || ""}
                onChange={handleDownPaymentChange}
                onBlur={handleDownPaymentBlur}
                disabled={isDownPaymentDisabled}
                style={{
                  opacity: isDownPaymentDisabled ? 0.6 : 1,
                  cursor: isDownPaymentDisabled ? "not-allowed" : "text",
                }}
                placeholder={`${MIN_DOWN_PAYMENT_PERCENT} - ${MAX_DOWN_PAYMENT_PERCENT}`}
              />
            </div>

            <div className="field">
              <label>Ручной ввод ПВ (₽)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={formData.manualDownPayment || ""}
                onChange={handleManualDownPaymentChange}
                onBlur={handleManualDownPaymentBlur}
                style={{
                  borderColor: isFullPayment ? "#22c55e" : undefined,
                }}
                placeholder="Введите сумму ПВ"
              />
              {isFullPayment && (
                <div className="full-payment-message">
                  ✅ Ипотека не требуется. Вы покрываете полную стоимость
                  объекта.
                </div>
              )}
            </div>

            <div className="field">
              <label>Срок ипотеки (лет)</label>
              <input
                type="number"
                min={MIN_LOAN_TERM}
                max={MAX_LOAN_TERM}
                step={1}
                value={formData.loanTerm || ""}
                onChange={handleLoanTermChange}
                onBlur={handleLoanTermBlur}
                placeholder={`${MIN_LOAN_TERM} - ${MAX_LOAN_TERM}`}
              />
            </div>
          </div>
        </div>

        {/* Блок: Другие параметры */}
        <div className="form-block form-block-checkboxes">
          <h2>Другие параметры</h2>
          <div className="form-fields">
            <div className="checkbox-field">
              <input
                type="checkbox"
                id="considerDeposit"
                checked={formData.considerDepositInCost}
                onChange={handleConsiderDepositChange}
              />
              <label htmlFor="considerDeposit">
                Учитывать бронь в стоимости (-{DEPOSIT_AMOUNT.toLocaleString()}{" "}
                ₽)
              </label>
            </div>

            <div className="checkbox-field">
              <input
                type="checkbox"
                id="noSubsidyInflate"
                checked={formData.noSubsidyInflate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange("noSubsidyInflate", e.target.checked)
                }
              />
              <label htmlFor="noSubsidyInflate">Не завышать на субсидию</label>
            </div>

            <div className="checkbox-field">
              <input
                type="checkbox"
                id="mortgageWithoutDownPayment"
                checked={formData.mortgageWithoutDownPayment}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange("mortgageWithoutDownPayment", e.target.checked)
                }
                disabled={isFullPayment}
              />
              <label
                htmlFor="mortgageWithoutDownPayment"
                style={{
                  opacity: isFullPayment ? 0.5 : 1,
                  cursor: isFullPayment ? "not-allowed" : "pointer",
                }}
              >
                Ипотека без первоначального взноса
              </label>
            </div>

            <div className="checkbox-field">
              <input
                type="checkbox"
                id="mortgagePartialDownPayment"
                checked={formData.mortgagePartialDownPayment}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange("mortgagePartialDownPayment", e.target.checked)
                }
                disabled={formData.mortgageWithoutDownPayment || isFullPayment}
              />
              <label
                htmlFor="mortgagePartialDownPayment"
                style={{
                  opacity:
                    formData.mortgageWithoutDownPayment || isFullPayment
                      ? 0.5
                      : 1,
                  cursor:
                    formData.mortgageWithoutDownPayment || isFullPayment
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Ипотека с частичным первоначальным взносом
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Кнопка "Рассчитать" */}
      {onCalculate && (
        <div className="form-actions">
          <button
            className="calculate-btn"
            onClick={onCalculate}
            disabled={
              isCalculating || !formData.complex || !formData.apartmentType
            }
          >
            {isCalculating ? "Расчёт..." : "🔄 Рассчитать"}
          </button>
        </div>
      )}
    </div>
  );
};
