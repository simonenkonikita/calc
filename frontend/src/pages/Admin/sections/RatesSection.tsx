// frontend/src/pages/Admin/sections/RatesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminRate } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import "./RatesSection.css";

export const RatesSection: React.FC = () => {
  const [rates, setRates] = useState<AdminRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminRate>>({});

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRates();
      console.log("Rates data:", data); // Для отладки

      // 🔥 Безопасная проверка: если data - объект с полем data, берем его
      let ratesData = data;
      if (data && typeof data === "object" && "data" in data) {
        ratesData = (data as any).data;
      }

      // Если ratesData не массив, устанавливаем пустой массив
      setRates(Array.isArray(ratesData) ? ratesData : []);
    } catch (error) {
      console.error("Error loading rates:", error);
      setRates([]); // В случае ошибки - пустой массив
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newRate = await adminApi.createRate({
        offerId: "",
        conditionType: "pv",
        condition: "gte",
        value: 0,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: 0,
        description: "",
        isActive: true,
      });
      setRates([...rates, newRate]);
    } catch (error) {
      console.error("Error creating rate:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateRate(id, formData);
      setRates(rates.map((r) => (r.id === id ? updated : r)));
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating rate:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить ставку?")) return;
    try {
      await adminApi.deleteRate(id);
      setRates(rates.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting rate:", error);
    }
  };

  const startEdit = (rate: AdminRate) => {
    setEditingId(rate.id);
    setFormData({
      offerId: rate.offerId,
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

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="rates-section">
      <AdminLayout title="📊 Динамические ставки">
        <div className="admin-toolbar">
          <button onClick={handleCreate} className="admin-btn-primary">
            + Добавить ставку
          </button>
          <button onClick={loadRates} className="admin-btn-secondary">
            🔄 Обновить
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Offer ID</th>
                <th>Тип условия</th>
                <th>Условие</th>
                <th>Значение</th>
                <th>Мин.</th>
                <th>Макс.</th>
                <th>Ставка</th>
                <th>Приоритет</th>
                <th>Описание</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "2rem",
                    }}
                  >
                    Нет динамических ставок
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id}>
                    <td>
                      {editingId === rate.id ? (
                        <input
                          value={formData.offerId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              offerId: e.target.value,
                            })
                          }
                        />
                      ) : (
                        rate.offerId?.substring(0, 8) || "-"
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <select
                          value={formData.conditionType || "pv"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditionType: e.target.value as any,
                            })
                          }
                        >
                          <option value="pv">ПВ</option>
                          <option value="amount">Сумма</option>
                          <option value="term">Срок</option>
                        </select>
                      ) : (
                        rate.conditionType
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <select
                          value={formData.condition || "gte"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              condition: e.target.value as any,
                            })
                          }
                        >
                          <option value="gte">≥</option>
                          <option value="lte">≤</option>
                          <option value="lt">&lt;</option>
                          <option value="gt">&gt;</option>
                          <option value="eq">=</option>
                          <option value="between">между</option>
                        </select>
                      ) : (
                        rate.condition
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
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
                        />
                      ) : (
                        (rate.value ?? "—")
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.minValue ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minValue: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                        />
                      ) : (
                        (rate.minValue ?? "—")
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.maxValue ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxValue: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            })
                          }
                        />
                      ) : (
                        (rate.maxValue ?? "—")
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={formData.rate ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rate: parseFloat(e.target.value),
                            })
                          }
                        />
                      ) : (
                        `${rate.rate}%`
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <input
                          type="number"
                          value={formData.priority ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value),
                            })
                          }
                        />
                      ) : (
                        rate.priority
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <input
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      ) : (
                        rate.description?.substring(0, 20) || "-"
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <select
                          value={formData.isActive ? "active" : "inactive"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.value === "active",
                            })
                          }
                        >
                          <option value="active">✅ Активен</option>
                          <option value="inactive">❌ Неактивен</option>
                        </select>
                      ) : rate.isActive ? (
                        "✅ Активен"
                      ) : (
                        "❌ Неактивен"
                      )}
                    </td>
                    <td>
                      {editingId === rate.id ? (
                        <div className="admin-actions">
                          <button
                            onClick={() => handleUpdate(rate.id)}
                            className="admin-btn-success"
                          >
                            💾
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="admin-btn-danger"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="admin-actions">
                          <button
                            onClick={() => startEdit(rate)}
                            className="admin-btn-primary"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id)}
                            className="admin-btn-danger"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </div>
  );
};
