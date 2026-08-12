// frontend/src/pages/Admin/sections/offers/components/DynamicRatesForm.tsx

import React from "react";
import { DynamicRate } from "../types";
import "./DynamicRatesForm.css";

interface DynamicRatesFormProps {
  rates: DynamicRate[];
  onRatesChange: (rates: DynamicRate[]) => void;
}

export const DynamicRatesForm: React.FC<DynamicRatesFormProps> = ({
  rates,
  onRatesChange,
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

  const removeRow = (index: number) => {
    if (rates.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }
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
    value: any
  ) => {
    const updated = [...rates];
    if (!updated[index].conditionMetadata) {
      updated[index].conditionMetadata = {};
    }
    updated[index].conditionMetadata![field] = value !== "" ? value : null;
    onRatesChange(updated);
  };

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>📊 Динамические ставки</h4>
        <button onClick={addRow} className="admin-btn-secondary admin-btn-sm">
          + Добавить строку
        </button>
      </div>
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
              <th>Сложное</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={rate.conditionType}
                    onChange={(e) => updateRow(index, "conditionType", e.target.value)}
                  >
                    <option value="pv">ПВ</option>
                    <option value="amount">Сумма</option>
                    <option value="term">Срок</option>
                  </select>
                </td>
                <td>
                  <select
                    value={rate.condition}
                    onChange={(e) => updateRow(index, "condition", e.target.value)}
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
                        index,
                        "value",
                        e.target.value ? parseFloat(e.target.value) : null
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
                      updateRow(index, "rate", parseFloat(e.target.value) || 0)
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
                      updateRow(index, "priority", parseInt(e.target.value) || 0)
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Описание"
                    value={rate.description || ""}
                    onChange={(e) => updateRow(index, "description", e.target.value)}
                    style={{ width: "80px" }}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={rate.useComplexCondition || false}
                    onChange={(e) =>
                      updateRow(index, "useComplexCondition", e.target.checked)
                    }
                  />
                </td>
                <td>
                  <button
                    onClick={() => removeRow(index)}
                    className="admin-btn-danger admin-btn-xs"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rates.some(r => r.useComplexCondition) && (
        <div className="complex-params">
          <div style={{ fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            📋 Параметры сложных условий:
          </div>
          <div className="complex-params-grid">
            <div>ПВ от</div>
            <div>ПВ до</div>
            <div>Сумма от</div>
            <div>Сумма до</div>
            <div>Срок от</div>
            <div>Срок до</div>
          </div>
          {rates.map((rate, index) => (
            rate.useComplexCondition && (
              <div key={index} className="complex-params-row">
                <input
                  type="number"
                  step="0.1"
                  placeholder="от"
                  value={rate.conditionMetadata?.pvMin ?? ""}
                  onChange={(e) => updateMetadata(index, "pvMin", e.target.value)}
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="до"
                  value={rate.conditionMetadata?.pvMax ?? ""}
                  onChange={(e) => updateMetadata(index, "pvMax", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="от"
                  value={rate.conditionMetadata?.amountMin ?? ""}
                  onChange={(e) => updateMetadata(index, "amountMin", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="до"
                  value={rate.conditionMetadata?.amountMax ?? ""}
                  onChange={(e) => updateMetadata(index, "amountMax", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="от"
                  value={rate.conditionMetadata?.termMin ?? ""}
                  onChange={(e) => updateMetadata(index, "termMin", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="до"
                  value={rate.conditionMetadata?.termMax ?? ""}
                  onChange={(e) => updateMetadata(index, "termMax", e.target.value)}
                />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};