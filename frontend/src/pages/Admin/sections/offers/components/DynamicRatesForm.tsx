// frontend/src/pages/Admin/sections/offers/components/DynamicRatesForm.tsx

import React from "react";
import { DynamicRate } from "../types";
import "./DynamicRatesForm.css";

interface DynamicRatesFormProps {
  rates: DynamicRate[];
  onRatesChange: (rates: DynamicRate[]) => void;
  onRateDelete?: (rate: DynamicRate) => void;
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
        conditionMetadata: {
          amountMin: null,
          amountMax: null,
          pvMin: null,
          pvMax: null,
          termMin: null,
          termMax: null,
        },
        rate: 0,
        priority: rates.length,
        description: "",
        isActive: true,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (rates.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }

    const removedRate = rates[index];
    if (removedRate.id && onRateDelete) {
      onRateDelete(removedRate);
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
    value: any,
  ) => {
    const updated = [...rates];
    updated[index].conditionMetadata = {
      ...updated[index].conditionMetadata,
      [field]: value !== "" ? Number(value) : null,
    };
    onRatesChange(updated);
  };

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>📊 Динамические ставки</h4>
        <button onClick={addRow} className="admin-btn-secondary admin-btn-sm">
          + Добавить условие
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Сумма от</th>
              <th>Сумма до</th>
              <th>ПВ от (%)</th>
              <th>ПВ до (%)</th>
              <th>Срок от</th>
              <th>Срок до</th>
              <th>Ставка (%)</th>
              <th>Приор</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={rate.conditionMetadata.amountMin ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "amountMin", e.target.value)
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="до"
                    value={rate.conditionMetadata.amountMax ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "amountMax", e.target.value)
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="от"
                    value={rate.conditionMetadata.pvMin ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "pvMin", e.target.value)
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="до"
                    value={rate.conditionMetadata.pvMax ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "pvMax", e.target.value)
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={rate.conditionMetadata.termMin ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "termMin", e.target.value)
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="до"
                    value={rate.conditionMetadata.termMax ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "termMax", e.target.value)
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={rate.rate ?? ""}
                    onChange={(e) =>
                      updateRow(index, "rate", parseFloat(e.target.value) || 0)
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Приор"
                    value={rate.priority ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
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
                      updateRow(index, "description", e.target.value)
                    }
                    style={{ width: "100px" }}
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

      {rates.length === 0 && (
        <div className="empty-state">
          <p>Нет динамических ставок. Нажмите "Добавить условие".</p>
        </div>
      )}
    </div>
  );
};
