// frontend/src/pages/Admin/sections/RatesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../../services/adminApi";
import { AdminLayout } from "../../components/AdminLayout/AdminLayout";
import AdminToolbar from "../../components/AdminToolbar/AdminToolbar";
import "./RatesSection.css";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import ActionButtons from "../../components/ActionButtons/ActionButtons";

interface DynamicRate {
  id: string;
  offerId: string;
  conditionType: string;
  condition: string;
  value: number | null;
  minValue: number | null;
  maxValue: number | null;
  rate: number;
  priority: number;
  description: string;
  isActive: boolean;
  offer?: {
    id: string;
    program: string;
    bank?: { name: string };
  };
}

export const RatesSection: React.FC = () => {
  const [rates, setRates] = useState<DynamicRate[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DynamicRate>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ratesData, offersData] = await Promise.all([
        adminApi.getDynamicRates(),
        adminApi.getOffers(),
      ]);
      setRates(Array.isArray(ratesData) ? ratesData : []);
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!selectedOfferId) {
        alert("Выберите оффер");
        return;
      }
      if (!formData.rate && formData.rate !== 0) {
        alert("Введите ставку");
        return;
      }

      const newRate = await adminApi.createDynamicRate(selectedOfferId, {
        conditionType: formData.conditionType || "pv",
        condition: formData.condition || "gte",
        value: formData.value || null,
        minValue: formData.minValue || null,
        maxValue: formData.maxValue || null,
        rate: formData.rate || 0,
        priority: formData.priority || 0,
        description: formData.description || "",
        isActive: true,
      });

      setRates([...rates, newRate]);
      setIsCreating(false);
      setFormData({});
      setSelectedOfferId("");
      alert("✅ Ставка успешно создана!");
    } catch (error) {
      console.error("Error creating rate:", error);
      alert("❌ Ошибка при создании ставки");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateDynamicRate(id, formData);
      setRates(rates.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
      setFormData({});
      alert("✅ Ставка успешно обновлена!");
    } catch (error) {
      console.error("Error updating rate:", error);
      alert("❌ Ошибка при обновлении ставки");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить ставку?")) return;
    try {
      await adminApi.deleteDynamicRate(id);
      setRates(rates.filter((r) => r.id !== id));
      alert("✅ Ставка удалена!");
    } catch (error) {
      console.error("Error deleting rate:", error);
      alert("❌ Ошибка при удалении ставки");
    }
  };

  const startEdit = (rate: DynamicRate) => {
    setEditingId(rate.id);
    setFormData({
      conditionType: rate.conditionType,
      condition: rate.condition,
      value: rate.value,
      minValue: rate.minValue,
      maxValue: rate.maxValue,
      rate: rate.rate,
      priority: rate.priority,
      description: rate.description,
      isActive: rate.isActive,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setFormData({
      conditionType: "pv",
      condition: "gte",
      value: null,
      minValue: null,
      maxValue: null,
      rate: 0,
      priority: 0,
      description: "",
      isActive: true,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setIsCreating(false);
    setSelectedOfferId("");
  };

  const getOfferLabel = (offer: any) => {
    if (!offer) return "Неизвестный оффер";
    const bankName = offer.bank?.name || "Без банка";
    return `${bankName} - ${offer.program}`;
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="rates-section">
      <AdminLayout title="📊 Динамические ставки">
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить ставку",
              onClick: startCreate,
              variant: "primary",
            },
            { label: "🔄 Обновить", onClick: loadData, variant: "secondary" },
          ]}
          totalCount={rates.length}
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Оффер</th>
                <th>Тип</th>
                <th>Условие</th>
                <th>Значение</th>
                <th>Ставка</th>
                <th>Приоритет</th>
                <th>Описание</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {isCreating && (
                <tr>
                  <td>
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
                  </td>
                  <td>
                    <select
                      value={formData.conditionType || "pv"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conditionType: e.target.value,
                        })
                      }
                      className="admin-select admin-select-sm"
                    >
                      <option value="pv">ПВ</option>
                      <option value="amount">Сумма</option>
                      <option value="term">Срок</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={formData.condition || "gte"}
                      onChange={(e) =>
                        setFormData({ ...formData, condition: e.target.value })
                      }
                      className="admin-select admin-select-sm"
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
                      placeholder="Значение"
                      value={formData.value ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: e.target.value
                            ? parseFloat(e.target.value)
                            : null,
                        })
                      }
                      className="admin-input admin-input-sm admin-input-value"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ставка"
                      value={formData.rate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="admin-input admin-input-sm admin-input-rate"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Приоритет"
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
                    <input
                      placeholder="Описание"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <StatusBadge isActive={true} />
                  </td>
                  <td>
                    <ActionButtons
                      buttons={[
                        {
                          icon: "💾",
                          onClick: handleCreate,
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
                </tr>
              )}

              {rates.map((rate) => (
                <tr key={rate.id}>
                  {editingId === rate.id ? (
                    <>
                      <td>{getOfferLabel(rate.offer)}</td>
                      <td>
                        <select
                          value={formData.conditionType || "pv"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditionType: e.target.value,
                            })
                          }
                          className="admin-select admin-select-sm"
                        >
                          <option value="pv">ПВ</option>
                          <option value="amount">Сумма</option>
                          <option value="term">Срок</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={formData.condition || "gte"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              condition: e.target.value,
                            })
                          }
                          className="admin-select admin-select-sm"
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
                          value={formData.value ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              value: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-value"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rate ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="admin-input admin-input-sm admin-input-rate"
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
                        <input
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="admin-input admin-input-sm"
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
                              onClick: () => handleUpdate(rate.id),
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
                      <td>{getOfferLabel(rate.offer)}</td>
                      <td>
                        <span className="rate-condition-type">
                          {rate.conditionType}
                        </span>
                      </td>
                      <td>
                        <span className="rate-condition">{rate.condition}</span>
                      </td>
                      <td>{rate.value ?? "—"}</td>
                      <td className="rate-value">{rate.rate}%</td>
                      <td className="rate-priority">{rate.priority}</td>
                      <td title={rate.description}>
                        {rate.description?.substring(0, 30) || "-"}
                      </td>
                      <td>
                        <StatusBadge isActive={rate.isActive} />
                      </td>
                      <td>
                        <ActionButtons
                          buttons={[
                            {
                              icon: "✏️",
                              onClick: () => startEdit(rate),
                              variant: "primary",
                              title: "Редактировать",
                            },
                            {
                              icon: "🗑️",
                              onClick: () => handleDelete(rate.id),
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

              {rates.length === 0 && !isCreating && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    Нет динамических ставок. Нажмите "Добавить ставку" чтобы
                    создать первую.
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
