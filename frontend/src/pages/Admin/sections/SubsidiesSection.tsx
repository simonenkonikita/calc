// frontend/src/pages/Admin/sections/SubsidiesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminLayout } from "../AdminLayout";
import AdminToolbar from "../AdminToolbar";
import "./SubsidiesSection.css";
import ActionButtons from "./ActionButtons";
import StatusBadge from "./StatusBadge";

interface DynamicSubsidy {
  id: string;
  offerId: string;
  minPVPercent: number | null;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  roundingStrategy: string | null;
  conditionMetadata: any;
  isActive: boolean;
  offer?: {
    id: string;
    program: string;
    bank?: { name: string };
  };
}

interface SubsidyFormRow {
  id: string;
  minPVPercent: number | null;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  roundingStrategy: string | null;
}

export const SubsidiesSection: React.FC = () => {
  const [subsidies, setSubsidies] = useState<DynamicSubsidy[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DynamicSubsidy>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [rows, setRows] = useState<SubsidyFormRow[]>([
    {
      id: `row-${Date.now()}`,
      minPVPercent: null,
      maxPVPercent: null,
      minAmount: null,
      maxAmount: null,
      minTerm: null,
      maxTerm: null,
      subsidyPercent: 0,
      priority: 0,
      description: "",
      roundingStrategy: null,
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsidiesData, offersData] = await Promise.all([
        adminApi.getDynamicSubsidies(),
        adminApi.getOffers(),
      ]);
      setSubsidies(Array.isArray(subsidiesData) ? subsidiesData : []);
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    const newRow: SubsidyFormRow = {
      id: `row-${Date.now()}-${Math.random()}`,
      minPVPercent: null,
      maxPVPercent: null,
      minAmount: null,
      maxAmount: null,
      minTerm: null,
      maxTerm: null,
      subsidyPercent: 0,
      priority: rows.length,
      description: "",
      roundingStrategy: null,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
  };

  const updateRow = (id: string, field: keyof SubsidyFormRow, value: any) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      }),
    );
  };

  const handleCreateMultiple = async () => {
    try {
      if (!selectedOfferId) {
        alert("Выберите оффер");
        return;
      }

      const createdSubsidies = [];
      for (const row of rows) {
        const newSubsidy = await adminApi.createDynamicSubsidy(
          selectedOfferId,
          {
            minPVPercent: row.minPVPercent,
            maxPVPercent: row.maxPVPercent,
            minAmount: row.minAmount,
            maxAmount: row.maxAmount,
            minTerm: row.minTerm,
            maxTerm: row.maxTerm,
            subsidyPercent: row.subsidyPercent,
            priority: row.priority || 0,
            description: row.description || "",
            roundingStrategy: row.roundingStrategy || null,
            isActive: true,
          },
        );
        createdSubsidies.push(newSubsidy);
      }

      setSubsidies([...subsidies, ...createdSubsidies]);
      setIsCreating(false);
      setSelectedOfferId("");
      setRows([
        {
          id: `row-${Date.now()}`,
          minPVPercent: null,
          maxPVPercent: null,
          minAmount: null,
          maxAmount: null,
          minTerm: null,
          maxTerm: null,
          subsidyPercent: 0,
          priority: 0,
          description: "",
          roundingStrategy: null,
        },
      ]);
      alert(`✅ Создано ${createdSubsidies.length} субсидий!`);
    } catch (error) {
      console.error("Error creating subsidies:", error);
      alert("❌ Ошибка при создании субсидий");
    }
  };

  const startEdit = (subsidy: DynamicSubsidy) => {
    setEditingId(subsidy.id);
    setFormData({
      minPVPercent: subsidy.minPVPercent,
      maxPVPercent: subsidy.maxPVPercent,
      minAmount: subsidy.minAmount,
      maxAmount: subsidy.maxAmount,
      minTerm: subsidy.minTerm,
      maxTerm: subsidy.maxTerm,
      subsidyPercent: subsidy.subsidyPercent,
      priority: subsidy.priority,
      description: subsidy.description,
      roundingStrategy: subsidy.roundingStrategy,
      conditionMetadata: subsidy.conditionMetadata,
      isActive: subsidy.isActive,
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateDynamicSubsidy(id, formData);
      setSubsidies(subsidies.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      setFormData({});
      alert("✅ Субсидия успешно обновлена!");
    } catch (error) {
      console.error("Error updating subsidy:", error);
      alert("❌ Ошибка при обновлении субсидии");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить субсидию?")) return;
    try {
      await adminApi.deleteDynamicSubsidy(id);
      setSubsidies(subsidies.filter((s) => s.id !== id));
      alert("✅ Субсидия удалена!");
    } catch (error) {
      console.error("Error deleting subsidy:", error);
      alert("❌ Ошибка при удалении субсидии");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setSelectedOfferId("");
    setRows([
      {
        id: `row-${Date.now()}`,
        minPVPercent: null,
        maxPVPercent: null,
        minAmount: null,
        maxAmount: null,
        minTerm: null,
        maxTerm: null,
        subsidyPercent: 0,
        priority: 0,
        description: "",
        roundingStrategy: null,
      },
    ]);
  };

  const getOfferLabel = (offer: any) => {
    if (!offer) return "Неизвестный оффер";
    const bankName = offer.bank?.name || "Без банка";
    return `${bankName} - ${offer.program}`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("ru-RU").format(value);
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="subsidies-section">
      <AdminLayout title="💰 Динамические субсидии">
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить субсидии",
              onClick: () => setIsCreating(true),
              variant: "primary",
            },
            { label: "🔄 Обновить", onClick: loadData, variant: "secondary" },
          ]}
          totalCount={subsidies.length}
        />

        {isCreating && (
          <div className="admin-section create-form-section">
            <div className="admin-section-header">
              <h3>📝 Создание субсидий</h3>
              <div className="form-actions">
                <select
                  value={selectedOfferId}
                  onChange={(e) => setSelectedOfferId(e.target.value)}
                  className="admin-select admin-select-sm"
                >
                  <option value="">Выберите оффер</option>
                  {offers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {getOfferLabel(offer)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addRow}
                  className="admin-btn admin-btn-secondary"
                >
                  + Добавить строку
                </button>
                <button
                  onClick={handleCreateMultiple}
                  className="admin-btn admin-btn-success"
                >
                  💾 Сохранить все
                </button>
                <button
                  onClick={cancelCreate}
                  className="admin-btn admin-btn-danger"
                >
                  ✕ Отмена
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="col-number">#</th>
                    <th>ПВ от</th>
                    <th>ПВ до</th>
                    <th>Сумма от</th>
                    <th>Сумма до</th>
                    <th>Срок от</th>
                    <th>Срок до</th>
                    <th>Субсидия %</th>
                    <th>Приоритет</th>
                    <th>Описание</th>
                    <th className="col-actions">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="от"
                          value={row.minPVPercent ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "minPVPercent",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-pv"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="до"
                          value={row.maxPVPercent ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "maxPVPercent",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-pv"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="от"
                          value={row.minAmount ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "minAmount",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-amount"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="до"
                          value={row.maxAmount ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "maxAmount",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-amount"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="от"
                          value={row.minTerm ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "minTerm",
                              e.target.value ? parseInt(e.target.value) : null,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-term"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="до"
                          value={row.maxTerm ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "maxTerm",
                              e.target.value ? parseInt(e.target.value) : null,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-term"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="%"
                          value={row.subsidyPercent ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "subsidyPercent",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-subsidy"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Приор"
                          value={row.priority ?? ""}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "priority",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="admin-input admin-input-sm admin-input-priority"
                        />
                      </td>
                      <td>
                        <input
                          placeholder="Описание"
                          value={row.description || ""}
                          onChange={(e) =>
                            updateRow(row.id, "description", e.target.value)
                          }
                          className="admin-input admin-input-sm admin-input-description"
                        />
                      </td>
                      <td>
                        <ActionButtons
                          buttons={[
                            {
                              icon: "✕",
                              onClick: () => removeRow(row.id),
                              variant: "danger",
                              title: "Удалить строку",
                            },
                          ]}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Оффер</th>
                <th>ПВ от</th>
                <th>ПВ до</th>
                <th>Сумма от</th>
                <th>Сумма до</th>
                <th>Срок от</th>
                <th>Срок до</th>
                <th>Субсидия</th>
                <th>Приоритет</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {subsidies.map((subsidy) => (
                <tr key={subsidy.id}>
                  {editingId === subsidy.id ? (
                    <>
                      <td>{getOfferLabel(subsidy.offer)}</td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.minPVPercent ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minPVPercent: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-pv"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.maxPVPercent ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxPVPercent: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-pv"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.minAmount ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minAmount: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-amount"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.maxAmount ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxAmount: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-amount"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.minTerm ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minTerm: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-term"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.maxTerm ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxTerm: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-term"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.subsidyPercent ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subsidyPercent: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-subsidy"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.priority ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value) || 0,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-priority"
                        />
                      </td>
                      <td>
                        <select
                          value={formData.isActive ? "active" : "inactive"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.value === "active",
                            })
                          }
                          className="admin-select admin-select-sm"
                        >
                          <option value="active">✅ Активен</option>
                          <option value="inactive">❌ Неактивен</option>
                        </select>
                      </td>
                      <td>
                        <ActionButtons
                          buttons={[
                            {
                              icon: "💾",
                              onClick: () => handleUpdate(subsidy.id),
                              variant: "success",
                              title: "Сохранить",
                            },
                            {
                              icon: "✕",
                              onClick: cancelEdit,
                              variant: "danger",
                              title: "Отмена",
                            },
                          ]}
                          size="sm"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{getOfferLabel(subsidy.offer)}</td>
                      <td>{subsidy.minPVPercent ?? "—"}</td>
                      <td>{subsidy.maxPVPercent ?? "∞"}</td>
                      <td>{formatNumber(subsidy.minAmount)}</td>
                      <td>{formatNumber(subsidy.maxAmount)}</td>
                      <td>{subsidy.minTerm ?? "—"}</td>
                      <td>{subsidy.maxTerm ?? "∞"}</td>
                      <td className="subsidy-percent">
                        {subsidy.subsidyPercent}%
                      </td>
                      <td>{subsidy.priority}</td>
                      <td>
                        <StatusBadge isActive={subsidy.isActive} />
                      </td>
                      <td>
                        <ActionButtons
                          buttons={[
                            {
                              icon: "✏️",
                              onClick: () => startEdit(subsidy),
                              variant: "primary",
                              title: "Редактировать",
                            },
                            {
                              icon: "🗑️",
                              onClick: () => handleDelete(subsidy.id),
                              variant: "danger",
                              title: "Удалить",
                            },
                          ]}
                          size="sm"
                        />
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {subsidies.length === 0 && !isCreating && (
                <tr>
                  <td colSpan={11} className="empty-state">
                    Нет динамических субсидий. Нажмите "Добавить субсидии" чтобы
                    создать.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </div>
  );
};

export default SubsidiesSection;
