import React, { useMemo } from "react";
import type { ChangeEvent } from "react";
import type { CalculatorFormData } from "../../../utils/types";
import { housingPrices } from "../../../data/calculatorData";
import "./FormSection.css";
import {
  MAX_AREA,
  MAX_DOWN_PAYMENT_PERCENT,
  MAX_LOAN_TERM,
  MIN_AREA,
  MIN_DOWN_PAYMENT_PERCENT,
  MIN_LOAN_TERM,
  PROJECT_FINANCING_BANKS,
  PRICE_PER_SQUARE_METER_DEFAULT,
} from "../../../utils/constants";

interface FormSectionProps {
  formData: CalculatorFormData;
  onInputChange: <K extends keyof CalculatorFormData>(
    field: K,
    value: CalculatorFormData[K],
  ) => void;
}

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  onInputChange,
}) => {
  const complexes = Array.from(
    new Set(housingPrices.map((item) => item.complexName)),
  );

  const getApartmentTypes = (complex: string): string[] => {
    return housingPrices
      .filter((item) => item.complexName === complex)
      .map((item) => item.apartmentType);
  };

  const availableTypes = getApartmentTypes(formData.complex);

  // ============================================================
  // РАСЧЕТ СТОИМОСТИ ОБЪЕКТА (для валидации ПВ)
  // ============================================================
  const calculateObjectCost = useMemo(() => {
    if (formData.manualObjectCost && formData.manualObjectCost > 0) {
      return formData.manualObjectCost;
    }

    const pricePerM2 =
      housingPrices.find(
        (item) =>
          item.complexName === formData.complex &&
          item.apartmentType === formData.apartmentType,
      )?.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT;

    return formData.area * pricePerM2;
  }, [
    formData.manualObjectCost,
    formData.complex,
    formData.apartmentType,
    formData.area,
  ]);

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

  const isDownPaymentDisabled = isAnyMortgageTypeEnabled;

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

    if (numValue > objectCost) {
      onInputChange("manualDownPayment", objectCost);
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

    if (numValue > objectCost) {
      onInputChange("manualDownPayment", objectCost);
      return;
    }

    onInputChange("manualDownPayment", numValue);
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

  return (
    <div className="form-section">
      <div className="form-grid">
        {/* Блок: Параметры объекта */}
        <div className="form-block">
          <h2>Параметры объекта</h2>
          <div className="form-fields">
            <div className="field">
              <label>Жилой комплекс</label>
              <select
                value={formData.complex}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const newComplex = e.target.value;
                  const types = getApartmentTypes(newComplex);
                  onInputChange("complex", newComplex);
                  if (types.length > 0) {
                    onInputChange("apartmentType", types[0]);
                  }
                }}
              >
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
              >
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
              />
            </div>

            <div className="field">
              <label>Ручной ввод стоимости объекта (₽)</label>
              <input
                type="number"
                value={formData.manualObjectCost || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange(
                    "manualObjectCost",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
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
              />
            </div>

            <div className="field">
              <label>Ручной ввод ПВ (₽)</label>
              <input
                type="number"
                value={formData.manualDownPayment || ""}
                onChange={handleManualDownPaymentChange}
                onBlur={handleManualDownPaymentBlur}
              />
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
                placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Блок: Другие параметры */}
        <div className="form-block form-block-checkboxes">
          <h2>Другие параметры</h2>
          <div className="form-fields">
            <div className="field">
              <label>Проектное финансирование</label>
              <select
                value={formData.projectFinancingBank || "Сбербанк"}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  onInputChange("projectFinancingBank", e.target.value)
                }
              >
                {PROJECT_FINANCING_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div className="checkbox-field">
              <input
                type="checkbox"
                id="considerDeposit"
                checked={formData.considerDepositInCost}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange("considerDepositInCost", e.target.checked)
                }
              />
              <label htmlFor="considerDeposit">
                Учитывать бронь в стоимости
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
              />
              <label htmlFor="mortgageWithoutDownPayment">
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
                disabled={formData.mortgageWithoutDownPayment}
              />
              <label
                htmlFor="mortgagePartialDownPayment"
                style={{
                  opacity: formData.mortgageWithoutDownPayment ? 0.5 : 1,
                  cursor: formData.mortgageWithoutDownPayment
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
    </div>
  );
};
