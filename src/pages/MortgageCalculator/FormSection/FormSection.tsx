import React from "react";
import type { ChangeEvent } from "react";
import type { CalculatorFormData } from "../../../utils/types";
import { housingPrices } from "../../../data/calculatorData";
import "./FormSection.css";

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
  // Список ЖК для выбора (уникальные значения из housingPrices)
  const complexes = Array.from(
    new Set(housingPrices.map((item) => item.complexName)),
  );

  // Функция для получения типов квартир из данных
  const getApartmentTypes = (complex: string): string[] => {
    return housingPrices
      .filter((item) => item.complexName === complex)
      .map((item) => item.apartmentType);
  };

  // Получаем доступные типы для выбранного ЖК
  const availableTypes = getApartmentTypes(formData.complex);

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
                  // Автоматически выбираем первый доступный тип квартиры
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
                min={20}
                max={150}
                step={1}
                value={formData.area || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange(
                    "area",
                    e.target.value ? Number(e.target.value) : 20,
                  )
                }
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
                min={5}
                max={90}
                step={0.1}
                value={formData.downPaymentPercent || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange(
                    "downPaymentPercent",
                    e.target.value ? Number(e.target.value) : 5,
                  )
                }
              />
            </div>

            <div className="field">
              <label>Ручной ввод ПВ (₽)</label>
              <input
                type="number"
                value={formData.manualDownPayment || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange(
                    "manualDownPayment",
                    e.target.value ? Number(e.target.value) : 0,
                  )
                }
              />
            </div>

            <div className="field">
              <label>Срок ипотеки (лет)</label>
              <input
                type="number"
                min={1}
                max={30}
                step={1}
                value={formData.loanTerm || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange(
                    "loanTerm",
                    e.target.value ? Number(e.target.value) : 30,
                  )
                }
                placeholder="30"
              />
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
                id="applyMinDownPayment"
                checked={formData.applyMinDownPayment}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onInputChange("applyMinDownPayment", e.target.checked)
                }
              />
              <label htmlFor="applyMinDownPayment">
                Применить минимальный ПВ
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
