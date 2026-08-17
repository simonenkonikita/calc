// frontend/src/pages/Admin/sections/offers/components/DynamicSubsidiesForm.tsx

import React from "react";
import { DynamicSubsidy } from "../types";
import "./DynamicSubsidiesForm.css";

interface DynamicSubsidiesFormProps {
  subsidies: DynamicSubsidy[];
  onSubsidiesChange: (subsidies: DynamicSubsidy[]) => void;
  onSubsidyDelete?: (subsidy: DynamicSubsidy) => void;
}

export const DynamicSubsidiesForm: React.FC<DynamicSubsidiesFormProps> = ({
  subsidies,
  onSubsidiesChange,
  onSubsidyDelete,
}) => {
  const addRow = () => {
    onSubsidiesChange([
      ...subsidies,
      {
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0, // ← теперь rate вместо subsidyPercent
        priority: subsidies.length,
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
    onSubsidiesChange([
      ...subsidies,
      {
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: subsidies.length,
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
    if (subsidies.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }

    const removedSubsidy = subsidies[index];
    if (removedSubsidy.id && onSubsidyDelete) {
      onSubsidyDelete(removedSubsidy);
    }

    onSubsidiesChange(subsidies.filter((_, i) => i !== index));
  };

  const updateRow = (
    index: number,
    field: keyof DynamicSubsidy,
    value: any,
  ) => {
    const updated = [...subsidies];
    updated[index] = { ...updated[index], [field]: value };
    onSubsidiesChange(updated);
  };

  const updateMetadata = (
    index: number,
    field: keyof DynamicSubsidy["conditionMetadata"],
    value: any,
  ) => {
    const updated = [...subsidies];
    if (!updated[index].conditionMetadata) {
      updated[index].conditionMetadata = {};
    }
    updated[index].conditionMetadata![field] = value !== "" ? value : null;
    onSubsidiesChange(updated);
  };

  const simpleSubsidies = subsidies.filter((s) => !s.useComplexCondition);
  const complexSubsidies = subsidies.filter((s) => s.useComplexCondition);

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>💰 Динамические субсидии</h4>
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
          ПРОСТЫЕ УСЛОВИЯ (КАК У СТАВОК!)
          ============================================================ */}
      {simpleSubsidies.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Условие</th>
                <th>Значение</th>
                <th>Субсидия</th>
                <th>Приор</th>
                <th>Описание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {simpleSubsidies.map((subsidy, index) => {
                const originalIndex = subsidies.findIndex((s) => s === subsidy);
                return (
                  <tr key={originalIndex}>
                    <td>
                      <select
                        value={subsidy.conditionType}
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
                        value={subsidy.condition}
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
                        value={subsidy.value ?? ""}
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
                        placeholder="Субсидия"
                        value={subsidy.rate ?? ""}
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
                        value={subsidy.priority ?? ""}
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
                        value={subsidy.description || ""}
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
          СЛОЖНЫЕ УСЛОВИЯ (КАК У СТАВОК!)
          ============================================================ */}
      {complexSubsidies.length > 0 && (
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
                  <th>Субсидия</th>
                  <th>Приор</th>
                  <th>Описание</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {complexSubsidies.map((subsidy, index) => {
                  const originalIndex = subsidies.findIndex(
                    (s) => s === subsidy,
                  );
                  return (
                    <tr key={originalIndex} className="complex-row">
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="от"
                          value={subsidy.conditionMetadata?.pvMin ?? ""}
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
                          value={subsidy.conditionMetadata?.pvMax ?? ""}
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
                          value={subsidy.conditionMetadata?.amountMin ?? ""}
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
                          value={subsidy.conditionMetadata?.amountMax ?? ""}
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
                          value={subsidy.conditionMetadata?.termMin ?? ""}
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
                          value={subsidy.conditionMetadata?.termMax ?? ""}
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
                          placeholder="Субсидия"
                          value={subsidy.rate ?? ""}
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
                          value={subsidy.priority ?? ""}
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
                          value={subsidy.description || ""}
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

      {subsidies.length === 0 && (
        <div className="empty-state">
          <p>
            Нет динамических субсидий. Нажмите "Добавить простое условие" или
            "Добавить сложное условие".
          </p>
        </div>
      )}
    </div>
  );
};
