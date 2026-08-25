// frontend/src/pages/Admin/sections/offers/components/DynamicSubsidiesForm.tsx

import React, { useState } from "react";
import { DynamicSubsidy } from "../types";
import "./DynamicSubsidiesForm.css";

interface DynamicSubsidiesFormProps {
  subsidies: DynamicSubsidy[];
  onSubsidiesChange: (subsidies: DynamicSubsidy[]) => void;
  onSubsidyDelete?: (subsidy: DynamicSubsidy) => void;
  isEditMode?: boolean;
  onEditModeToggle?: () => void;
}

export const DynamicSubsidiesForm: React.FC<DynamicSubsidiesFormProps> = ({
  subsidies,
  onSubsidiesChange,
  onSubsidyDelete,
  isEditMode = false,
  onEditModeToggle,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // 🔥 Локальное состояние для хранения временных значений полей
  const [tempValues, setTempValues] = useState<Record<number, string>>({});

  // 🔥 Добавление строки с правильным priority (начинается с 1)
  const addRow = () => {
    const newPriority = subsidies.length + 1;
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
        priority: newPriority,
        description: "",
        isActive: true,
      },
    ]);
  };

  // 🔥 Дублирование строки
  const duplicateRow = (index: number) => {
    const originalSubsidy = subsidies[index];
    const newPriority = subsidies.length + 1;

    const duplicatedSubsidy = {
      ...originalSubsidy,
      id: undefined,
      priority: newPriority,
      conditionMetadata: { ...originalSubsidy.conditionMetadata },
    };

    onSubsidiesChange([...subsidies, duplicatedSubsidy]);
  };

  // 🔥 Удаление строки с перенумерацией оставшихся
  const removeRow = (index: number) => {
    if (subsidies.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }

    const removedSubsidy = subsidies[index];
    if (removedSubsidy.id && onSubsidyDelete) {
      onSubsidyDelete(removedSubsidy);
    }

    const filteredSubsidies = subsidies.filter((_, i) => i !== index);
    const renumberedSubsidies = filteredSubsidies.map((subsidy, idx) => ({
      ...subsidy,
      priority: idx + 1,
    }));
    onSubsidiesChange(renumberedSubsidies);
  };

  // 🔥 Перетаскивание строк - ТОЛЬКО через drag handle
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

    const newSubsidies = [...subsidies];
    const [draggedItem] = newSubsidies.splice(dragIndexNum, 1);
    newSubsidies.splice(dropIndex, 0, draggedItem);

    const renumberedSubsidies = newSubsidies.map((subsidy, idx) => ({
      ...subsidy,
      priority: idx + 1,
    }));

    onSubsidiesChange(renumberedSubsidies);
    setDragIndex(null);
  };

  const updateRow = (
    index: number,
    field: keyof DynamicSubsidy,
    value: any,
  ) => {
    if (!isEditMode) return;
    const updated = [...subsidies];
    updated[index] = { ...updated[index], [field]: value };
    onSubsidiesChange(updated);
  };

  const updateMetadata = (
    index: number,
    field: keyof DynamicSubsidy["conditionMetadata"],
    value: any,
  ) => {
    if (!isEditMode) return;
    const updated = [...subsidies];
    updated[index].conditionMetadata = {
      ...updated[index].conditionMetadata,
      [field]: value !== "" ? Number(value) : null,
    };
    onSubsidiesChange(updated);
  };

  // 🔥 Рендер ячейки в режиме просмотра
  const renderViewValue = (value: any, placeholder: string = "-") => {
    if (value === null || value === undefined || value === "") {
      return <span className="view-empty">{placeholder}</span>;
    }
    return <span className="view-value">{value}</span>;
  };

  // 🔥 Сортируем subsidies по priority перед отображением
  const sortedSubsidies = [...subsidies].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0),
  );

  // 🔥 Получить значение для поля ввода
  const getInputValue = (subsidy: DynamicSubsidy, index: number) => {
    // Если есть временное значение - используем его
    if (tempValues[index] !== undefined) {
      return tempValues[index];
    }
    // Иначе берем из данных
    return subsidy.subsidyPercent ?? "";
  };

  // 🔥 Обработчик изменения поля
  const handleSubsidyChange = (index: number, value: string) => {
    // Сохраняем временное значение
    setTempValues((prev) => ({ ...prev, [index]: value }));
    // Если поле пустое - записываем 0
    updateRow(
      index,
      "subsidyPercent",
      value === "" ? 0 : parseFloat(value) || 0,
    );
  };

  return (
    <div className="dynamic-form">
      <div className="dynamic-form-header">
        <h4>💰 Динамические субсидии</h4>
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
              {subsidies.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm("Очистить все строки?")) {
                      setTempValues({});
                      onSubsidiesChange([
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
              <th style={{ minWidth: "120px" }}>Субсидия (%)</th>
              <th style={{ minWidth: "100px" }}>Приоритет</th>
              <th style={{ minWidth: "150px" }}>Описание</th>
              {isEditMode && <th style={{ width: "100px" }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {sortedSubsidies.map((subsidy, index) => (
              <tr
                key={index}
                className={dragIndex === index ? "drag-over" : ""}
                style={{ cursor: "default" }}
              >
                {isEditMode && (
                  <td
                    style={{
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "1.1rem",
                    }}
                  >
                    <span
                      className="drag-handle"
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      ⠿
                    </span>
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
                      value={subsidy.conditionMetadata.amountMin ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "amountMin", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      subsidy.conditionMetadata.amountMin,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 8000000"
                      value={subsidy.conditionMetadata.amountMax ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "amountMax", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      subsidy.conditionMetadata.amountMax,
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
                      value={subsidy.conditionMetadata.pvMin ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "pvMin", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      subsidy.conditionMetadata.pvMin,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Например: 30.0"
                      value={subsidy.conditionMetadata.pvMax ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "pvMax", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      subsidy.conditionMetadata.pvMax,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 1"
                      value={subsidy.conditionMetadata.termMin ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "termMin", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      subsidy.conditionMetadata.termMin,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 30"
                      value={subsidy.conditionMetadata.termMax ?? ""}
                      onChange={(e) =>
                        updateMetadata(index, "termMax", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(
                      subsidy.conditionMetadata.termMax,
                      "Не указан",
                    )
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Например: 15.0"
                      value={getInputValue(subsidy, index)}
                      onChange={(e) =>
                        handleSubsidyChange(index, e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                      onBlur={() => {
                        // При потере фокуса очищаем временное значение, если оно есть
                        if (tempValues[index] !== undefined) {
                          setTempValues((prev) => {
                            const newValues = { ...prev };
                            delete newValues[index];
                            return newValues;
                          });
                        }
                      }}
                    />
                  ) : (
                    renderViewValue(subsidy.subsidyPercent, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      type="number"
                      placeholder="Например: 1"
                      value={subsidy.priority ?? ""}
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
                    renderViewValue(subsidy.priority, "Не указан")
                  )}
                </td>
                <td>
                  {isEditMode ? (
                    <input
                      placeholder="Описание условия"
                      value={subsidy.description || ""}
                      onChange={(e) =>
                        updateRow(index, "description", e.target.value)
                      }
                      className="form-input form-input-lg"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    renderViewValue(subsidy.description, "Нет описания")
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

      {subsidies.length === 0 && (
        <div className="empty-state">
          <p>Нет динамических субсидий. Нажмите "Добавить условие".</p>
        </div>
      )}
    </div>
  );
};
