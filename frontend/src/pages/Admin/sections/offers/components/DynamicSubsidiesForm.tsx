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
        conditionMetadata: {
          amountMin: null,
          amountMax: null,
          pvMin: null,
          pvMax: null,
          termMin: null,
          termMax: null,
        },
        tolerance: 0.5,
        subsidyPercent: 0,
        priority: subsidies.length,
        description: "",
        isActive: true,
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
    updated[index].conditionMetadata = {
      ...updated[index].conditionMetadata,
      [field]: value !== "" ? Number(value) : null,
    };
    onSubsidiesChange(updated);
  };

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>💰 Динамические субсидии</h4>
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
              <th>Срок от </th>
              <th>Срок до</th>
              <th>Субсидия (%)</th>
              <th>Приор</th>
              <th>Описание</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {subsidies.map((subsidy, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={subsidy.conditionMetadata.amountMin ?? ""}
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
                    value={subsidy.conditionMetadata.amountMax ?? ""}
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
                    value={subsidy.conditionMetadata.pvMin ?? ""}
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
                    value={subsidy.conditionMetadata.pvMax ?? ""}
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
                    value={subsidy.conditionMetadata.termMin ?? ""}
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
                    value={subsidy.conditionMetadata.termMax ?? ""}
                    onChange={(e) =>
                      updateMetadata(index, "termMax", e.target.value)
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="%"
                    value={subsidy.subsidyPercent ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "subsidyPercent",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="Приор"
                    value={subsidy.priority ?? ""}
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
                    value={subsidy.description || ""}
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

      {subsidies.length === 0 && (
        <div className="empty-state">
          <p>Нет динамических субсидий. Нажмите "Добавить условие".</p>
        </div>
      )}
    </div>
  );
};
