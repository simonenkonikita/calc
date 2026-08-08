// frontend/src/pages/Admin/sections/SubsidiesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminSubsidy } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";

export const SubsidiesSection: React.FC = () => {
  const [subsidies, setSubsidies] = useState<AdminSubsidy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminSubsidy>>({});

  useEffect(() => {
    loadSubsidies();
  }, []);

  const loadSubsidies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSubsidies();
      setSubsidies(data);
    } catch (error) {
      console.error("Error loading subsidies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newSubsidy = await adminApi.createSubsidy({
        bankId: "",
        programType: "full",
        minPVPercent: 0,
        maxPVPercent: null,
        minAmount: null,
        maxAmount: null,
        minTerm: null,
        maxTerm: null,
        subsidyPercent: 0,
        priority: 0,
        description: "",
        isActive: true,
      });
      setSubsidies([...subsidies, newSubsidy]);
    } catch (error) {
      console.error("Error creating subsidy:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateSubsidy(id, formData);
      setSubsidies(subsidies.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating subsidy:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить субсидию?")) return;
    try {
      await adminApi.deleteSubsidy(id);
      setSubsidies(subsidies.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting subsidy:", error);
    }
  };

  const startEdit = (subsidy: AdminSubsidy) => {
    setEditingId(subsidy.id);
    setFormData(subsidy);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <AdminLayout title="💰 Субсидии">
      <div className="admin-toolbar">
        <button onClick={handleCreate} className="admin-btn-primary">
          + Добавить субсидию
        </button>
        <button onClick={loadSubsidies} className="admin-btn-secondary">
          🔄 Обновить
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Банк</th>
              <th>Программа</th>
              <th>ПВ от</th>
              <th>ПВ до</th>
              <th>Субсидия</th>
              <th>Приоритет</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {subsidies.map((subsidy) => (
              <tr key={subsidy.id}>
                <td>
                  {editingId === subsidy.id ? (
                    <input
                      value={formData.bankId || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bankId: e.target.value })
                      }
                    />
                  ) : (
                    subsidy.bankId || "-"
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
                    <select
                      value={formData.programType || "full"}
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
                    subsidy.programType
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minPVPercent ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPVPercent: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    subsidy.minPVPercent
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
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
                    />
                  ) : (
                    (subsidy.maxPVPercent ?? "∞")
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={formData.subsidyPercent ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subsidyPercent: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `${subsidy.subsidyPercent}%`
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
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
                    subsidy.priority
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
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
                    subsidy.description
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
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
                  ) : subsidy.isActive ? (
                    "✅ Активен"
                  ) : (
                    "❌ Неактивен"
                  )}
                </td>
                <td>
                  {editingId === subsidy.id ? (
                    <div className="admin-actions">
                      <button
                        onClick={() => handleUpdate(subsidy.id)}
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
                        onClick={() => startEdit(subsidy)}
                        className="admin-btn-primary"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(subsidy.id)}
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
