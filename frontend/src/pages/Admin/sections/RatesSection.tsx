// frontend/src/pages/Admin/sections/RatesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminRate } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";

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
      setRates(data);
    } catch (error) {
      console.error("Error loading rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newRate = await adminApi.createRate({
        bankId: "",
        programType: "base",
        conditionType: "pv",
        condition: "gte",
        value: 0,
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
    setFormData(rate);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
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
              <th>Банк</th>
              <th>Тип программы</th>
              <th>Условие</th>
              <th>Значение</th>
              <th>Ставка</th>
              <th>Приоритет</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id}>
                <td>
                  {editingId === rate.id ? (
                    <input
                      value={formData.bankId || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bankId: e.target.value })
                      }
                    />
                  ) : (
                    rate.bankId || "-"
                  )}
                </td>
                <td>
                  {editingId === rate.id ? (
                    <select
                      value={formData.programType || "base"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          programType: e.target.value,
                        })
                      }
                    >
                      <option value="base">Базовая</option>
                      <option value="full">На весь срок</option>
                      <option value="short">Короткая</option>
                      <option value="family">Семейная</option>
                      <option value="it">ИТ</option>
                      <option value="tranche">Траншевая</option>
                    </select>
                  ) : (
                    rate.programType
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
                    <input
                      type="number"
                      value={formData.value ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    rate.value
                  )}
                </td>
                <td>
                  {editingId === rate.id ? (
                    <input
                      type="number"
                      step="0.1"
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
                    rate.description
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
                      <button onClick={cancelEdit} className="admin-btn-danger">
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
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
