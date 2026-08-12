// frontend/src/pages/Admin/sections/offers/components/DynamicSubsidiesForm.tsx

import React from "react";
import { DynamicSubsidy } from "../types";
import "./DynamicSubsidiesForm.css";

interface DynamicSubsidiesFormProps {
  subsidies: DynamicSubsidy[];
  onSubsidiesChange: (subsidies: DynamicSubsidy[]) => void;
}

export const DynamicSubsidiesForm: React.FC<DynamicSubsidiesFormProps> = ({
  subsidies,
  onSubsidiesChange,
}) => {
  const addRow = () => {
    onSubsidiesChange([
      ...subsidies,
      {
        minPVPercent: null,
        maxPVPercent: null,
        minAmount: null,
        maxAmount: null,
        minTerm: null,
        maxTerm: null,
        subsidyPercent: 0,
        priority: subsidies.length,
        description: "",
        roundingStrategy: null,
        isActive: true,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (subsidies.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }
    onSubsidiesChange(subsidies.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof DynamicSubsidy, value: any) => {
    const updated = [...subsidies];
    updated[index] = { ...updated[index], [field]: value };
    onSubsidiesChange(updated);
  };

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>💰 Динамические субсидии</h4>
        <button onClick={addRow} className="admin-btn-secondary admin-btn-sm">
          + Добавить строку
        </button>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
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
            {subsidies.map((subsidy, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="от"
                    value={subsidy.minPVPercent ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "minPVPercent",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="до"
                    value={subsidy.maxPVPercent ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "maxPVPercent",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    style={{ width: "60px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={subsidy.minAmount ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "minAmount",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="до"
                    value={subsidy.maxAmount ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "maxAmount",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    style={{ width: "80px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="от"
                    value={subsidy.minTerm ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "minTerm",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="до"
                    value={subsidy.maxTerm ?? ""}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "maxTerm",
                        e.target.value ? parseInt(e.target.value) : null
                      )
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
                        parseFloat(e.target.value) || 0
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
                      updateRow(index, "priority", parseInt(e.target.value) || 0)
                    }
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Описание"
                    value={subsidy.description || ""}
                    onChange={(e) => updateRow(index, "description", e.target.value)}
                    style={{ width: "80px" }}
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
    </div>
  );
};