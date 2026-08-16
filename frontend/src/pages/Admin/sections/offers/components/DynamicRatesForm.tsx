// frontend/src/pages/Admin/sections/offers/components/DynamicRatesForm.tsx

import React from "react";
import { DynamicRate } from "../types";
import "./DynamicRatesForm.css";

interface DynamicRatesFormProps {
  rates: DynamicRate[];
  onRatesChange: (rates: DynamicRate[]) => void;
  onRateDelete?: (rate: DynamicRate) => void; // 🔥 Добавляем callback для удаления
}

export const DynamicRatesForm: React.FC<DynamicRatesFormProps> = ({
  rates,
  onRatesChange,
  onRateDelete,
}) => {
  const addRow = () => {
    onRatesChange([
      ...rates,
      {
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: rates.length,
        description: "",
        isActive: true,
        useComplexCondition: false,
        conditionMetadata: {
          pvMin: null,
          pvMax: null,
          amountMin: null,
          amountMax: null,
          termMin: null,
          termMax: null,
        },
      },
    ]);
  };

  const addComplexRow = () => {
    onRatesChange([
      ...rates,
      {
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: rates.length,
        description: "",
        isActive: true,
        useComplexCondition: true,
        conditionMetadata: {
          pvMin: null,
          pvMax: null,
          amountMin: null,
          amountMax: null,
          termMin: null,
          termMax: null,
        },
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rates.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }

    const removedRate = rates[index];

    // 🔥 Если у удаляемой строки есть ID, вызываем колбэк для удаления из БД
    if (removedRate.id && onRateDelete) {
      onRateDelete(removedRate);
    }

    // Удаляем из UI
    onRatesChange(rates.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof DynamicRate, value: any) => {
    const updated = [...rates];
    updated[index] = { ...updated[index], [field]: value };
    onRatesChange(updated);
  };

  const updateMetadata = (
    index: number,
    field: keyof DynamicRate["conditionMetadata"],
    value: any,
  ) => {
    const updated = [...rates];
    if (!updated[index].conditionMetadata) {
      updated[index].conditionMetadata = {};
    }
    updated[index].conditionMetadata![field] = value !== "" ? value : null;
    onRatesChange(updated);
  };

  // 🔥 Разделяем на простые и сложные условия для отображения
  const simpleRates = rates.filter((r) => !r.useComplexCondition);
  const complexRates = rates.filter((r) => r.useComplexCondition);

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>📊 Динамические ставки</h4>
        <div className="dynamic-form-actions">
          <button onClick={addRow} className="admin-btn-secondary admin-btn-sm">
            + Добавить простое условие
          </button>
          <button
            onClick={addComplexRow}
            className="admin-btn-secondary admin-btn-sm"
          >
            + Добавить сложное условие
          </button>
        </div>
      </div>

      {/* ============================================================
          ПРОСТЫЕ УСЛОВИЯ
          ============================================================ */}
      {simpleRates.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Условие</th>
                <th>Значение</th>
                <th>Ставка</th>
                <th>Приор</th>
                <th>Описание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {simpleRates.map((rate, index) => {
                const originalIndex = rates.findIndex((r) => r === rate);
                return (
                  <tr key={originalIndex}>
                    <td>
                      <select
                        value={rate.conditionType}
                        onChange={(e) =>
                          updateRow(
                            originalIndex,
                            "conditionType",
                            e.target.value,
                          )
                        }
                      >
                        <option value="pv">ПВ</option>
                        <option value="amount">Сумма</option>
                        <option value="term">Срок</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={rate.condition}
                        onChange={(e) =>
                          updateRow(originalIndex, "condition", e.target.value)
                        }
                      >
                        <option value="gte">≥</option>
                        <option value="lte">≤</option>
                        <option value="lt">&lt;</option>
                        <option value="gt">&gt;</option>
                        <option value="eq">=</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Знач"
                        value={rate.value ?? ""}
                        onChange={(e) =>
                          updateRow(
                            originalIndex,
                            "value",
                            e.target.value ? parseFloat(e.target.value) : null,
                          )
                        }
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ставка"
                        value={rate.rate ?? ""}
                        onChange={(e) =>
                          updateRow(
                            originalIndex,
                            "rate",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder="Приор"
                        value={rate.priority ?? ""}
                        onChange={(e) =>
                          updateRow(
                            originalIndex,
                            "priority",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Описание"
                        value={rate.description || ""}
                        onChange={(e) =>
                          updateRow(
                            originalIndex,
                            "description",
                            e.target.value,
                          )
                        }
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => removeRow(originalIndex)}
                        className="admin-btn-danger admin-btn-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================
          СЛОЖНЫЕ УСЛОВИЯ
          ============================================================ */}
      {complexRates.length > 0 && (
        <div className="complex-section">
          <div className="complex-section-header">
            <h5>🔧 Сложные условия</h5>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table complex-table">
              <thead>
                <tr>
                  <th>ПВ от</th>
                  <th>ПВ до</th>
                  <th>Сумма от</th>
                  <th>Сумма до</th>
                  <th>Срок от</th>
                  <th>Срок до</th>
                  <th>Ставка</th>
                  <th>Приор</th>
                  <th>Описание</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {complexRates.map((rate, index) => {
                  const originalIndex = rates.findIndex((r) => r === rate);
                  return (
                    <tr key={originalIndex} className="complex-row">
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="от"
                          value={rate.conditionMetadata?.pvMin ?? ""}
                          onChange={(e) =>
                            updateMetadata(
                              originalIndex,
                              "pvMin",
                              e.target.value,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="до"
                          value={rate.conditionMetadata?.pvMax ?? ""}
                          onChange={(e) =>
                            updateMetadata(
                              originalIndex,
                              "pvMax",
                              e.target.value,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="от"
                          value={rate.conditionMetadata?.amountMin ?? ""}
                          onChange={(e) =>
                            updateMetadata(
                              originalIndex,
                              "amountMin",
                              e.target.value,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="до"
                          value={rate.conditionMetadata?.amountMax ?? ""}
                          onChange={(e) =>
                            updateMetadata(
                              originalIndex,
                              "amountMax",
                              e.target.value,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="от"
                          value={rate.conditionMetadata?.termMin ?? ""}
                          onChange={(e) =>
                            updateMetadata(
                              originalIndex,
                              "termMin",
                              e.target.value,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="до"
                          value={rate.conditionMetadata?.termMax ?? ""}
                          onChange={(e) =>
                            updateMetadata(
                              originalIndex,
                              "termMax",
                              e.target.value,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ставка"
                          value={rate.rate ?? ""}
                          onChange={(e) =>
                            updateRow(
                              originalIndex,
                              "rate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          style={{ width: "70px" }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Приор"
                          value={rate.priority ?? ""}
                          onChange={(e) =>
                            updateRow(
                              originalIndex,
                              "priority",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          style={{ width: "50px" }}
                        />
                      </td>
                      <td>
                        <input
                          placeholder="Описание"
                          value={rate.description || ""}
                          onChange={(e) =>
                            updateRow(
                              originalIndex,
                              "description",
                              e.target.value,
                            )
                          }
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => removeRow(originalIndex)}
                          className="admin-btn-danger admin-btn-xs"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔥 Если нет ни простых, ни сложных условий */}
      {rates.length === 0 && (
        <div className="empty-state">
          <p>
            Нет динамических ставок. Нажмите "Добавить простое условие" или
            "Добавить сложное условие".
          </p>
        </div>
      )}
    </div>
  );
};
