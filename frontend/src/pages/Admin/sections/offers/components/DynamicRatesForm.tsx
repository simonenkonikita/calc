// frontend/src/pages/Admin/sections/offers/components/DynamicRatesForm.tsx

import React, { useState } from "react";
import { DynamicRate } from "../types";
import "./DynamicRatesForm.css";

interface DynamicRatesFormProps {
  rates: DynamicRate[];
  onRatesChange: (rates: DynamicRate[]) => void;
  onRateDelete?: (rate: DynamicRate) => void;
  isEditMode?: boolean;
  onEditModeToggle?: () => void;
}

export const DynamicRatesForm: React.FC<DynamicRatesFormProps> = ({
  rates,
  onRatesChange,
  onRateDelete,
  isEditMode = false,
  onEditModeToggle,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // 🔥 Добавление строки
  const addRow = () => {
    const newPriority = rates.length + 1;
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
        priority: newPriority,
        description: "",
        isActive: true,
      },
    ]);
  };

  // 🔥 Дублирование строки
  const duplicateRow = (index: number) => {
    const originalRate = rates[index];
    const newPriority = rates.length + 1;

    const duplicatedRate = {
      ...originalRate,
      id: undefined,
      priority: newPriority,
      conditionMetadata: { ...originalRate.conditionMetadata },
    };

    onRatesChange([...rates, duplicatedRate]);
  };

  // 🔥 Удаление строки
  const removeRow = (index: number) => {
    if (rates.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }

    const removedRate = rates[index];
    if (removedRate.id && onRateDelete) {
      onRateDelete(removedRate);
    }

    const filteredRates = rates.filter((_, i) => i !== index);
    const renumberedRates = filteredRates.map((rate, idx) => ({
      ...rate,
      priority: idx + 1,
    }));
    onRatesChange(renumberedRates);
  };

  // 🔥 Перетаскивание строк
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setTimeout(() => {
      (e.target as HTMLElement).classList.add("dragging");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove("dragging");
    setDragIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    const dragIndexNum = parseInt(e.dataTransfer.getData("text/plain"));

    if (dragIndexNum === dropIndex) return;

    const newRates = [...rates];
    const [draggedItem] = newRates.splice(dragIndexNum, 1);
    newRates.splice(dropIndex, 0, draggedItem);

    const renumberedRates = newRates.map((rate, idx) => ({
      ...rate,
      priority: idx + 1,
    }));

    onRatesChange(renumberedRates);
    setDragIndex(null);
  };

  const updateRow = (index: number, field: keyof DynamicRate, value: any) => {
    if (!isEditMode) return;
    const updated = [...rates];
    updated[index] = { ...updated[index], [field]: value };
    onRatesChange(updated);
  };

  const updateMetadata = (
    index: number,
    field: keyof DynamicRate["conditionMetadata"],
    value: any,
  ) => {
    if (!isEditMode) return;
    const updated = [...rates];
    updated[index].conditionMetadata = {
      ...updated[index].conditionMetadata,
      [field]: value !== "" ? Number(value) : null,
    };
    onRatesChange(updated);
  };

  // 🔥 Рендер ячейки в режиме просмотра
  const renderViewValue = (value: any, placeholder: string = "-") => {
    if (value === null || value === undefined || value === "") {
      return <span className="view-empty">{placeholder}</span>;
    }
    return <span className="view-value">{value}</span>;
  };

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>📊 Динамические ставки</h4>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {!isEditMode && onEditModeToggle && (
            <button
              onClick={onEditModeToggle}
              className="admin-btn-edit admin-btn-sm"
            >
              ✏️ Редактировать
            </button>
          )}
          {isEditMode && (
            <>
              <button
                onClick={addRow}
                className="admin-btn-secondary admin-btn-sm"
              >
                + Добавить условие
              </button>
              {rates.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm("Очистить все строки?")) {
                      onRatesChange([
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
                          priority: 1,
                          description: "",
                          isActive: true,
                        },
                      ]);
                    }
                  }}
                  className="admin-btn-danger admin-btn-sm"
                >
                  🗑️ Очистить все
                </button>
              )}
              {onEditModeToggle && (
                <button
                  onClick={onEditModeToggle}
                  className="admin-btn-save admin-btn-sm"
                >
                  💾 Сохранить
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className={`admin-table ${!isEditMode ? "view-mode" : ""}`}>
          <thead>
            <tr>
              {isEditMode && <th style={{ width: "40px" }}>↕</th>}
              <th style={{ width: "50px" }}>№</th>
              <th style={{ minWidth: "120px" }}>Сумма от</th>
              <th style={{ minWidth: "120px" }}>Сумма до</th>
              <th style={{ minWidth: "110px" }}>ПВ от (%)</th>
              <th style={{ minWidth: "110px" }}>ПВ до (%)</th>
              <th style={{ minWidth: "100px" }}>Срок от</th>
              <th style={{ minWidth: "100px" }}>Срок до</th>
              <th style={{ minWidth: "120px" }}>Ставка (%)</th>
              <th style={{ minWidth: "100px" }}>Приоритет</th>
              <th style={{ minWidth: "150px" }}>Описание</th>
              {isEditMode && <th style={{ width: "100px" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {rates.map((rate, index) => (
              <tr
                key={index}
                draggable={isEditMode}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={dragIndex === index ? "drag-over" : ""}
                style={{ cursor: isEditMode ? "grab" : "default" }}
              >
                {isEditMode && (
                  <td
                    style={{
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "1.1rem",
                    }}
                  >
                    <span className="drag-handle">⠿</span>
                  </td>
                )}
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#6b7280",
                  }}
                >
                  {index + 1}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 1000000"
                      value={rate.conditionMetadata.amountMin ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "amountMin", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      rate.conditionMetadata.amountMin,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 8000000"
                      value={rate.conditionMetadata.amountMax ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "amountMax", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      rate.conditionMetadata.amountMax,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Например: 20.1"
                      value={rate.conditionMetadata.pvMin ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "pvMin", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.conditionMetadata.pvMin, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Например: 30.0"
                      value={rate.conditionMetadata.pvMax ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "pvMax", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.conditionMetadata.pvMax, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 1"
                      value={rate.conditionMetadata.termMin ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "termMin", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.conditionMetadata.termMin, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 30"
                      value={rate.conditionMetadata.termMax ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "termMax", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.conditionMetadata.termMax, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Например: 15.5"
                      value={rate.rate ?? ""}
                      onChange={(e) =>
                        updateRow(
                          index,
                          "rate",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.rate, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 1"
                      value={rate.priority ?? ""}
                      onChange={(e) =>
                        updateRow(
                          index,
                          "priority",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.priority, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      placeholder="Описание условия"
                      value={rate.description || ""}
                      onChange={(e) =>
                        updateRow(index, "description", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(rate.description, "Нет описания")
                  )}
                </td>
                {isEditMode && (
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.3rem",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => duplicateRow(index)}
                        className="admin-btn-duplicate admin-btn-xs"
                        title="Дублировать строку"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => removeRow(index)}
                        className="admin-btn-danger admin-btn-xs"
                        title="Удалить строку"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                )}
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
