// frontend/src/pages/Admin/sections/BanksSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminBank } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";

export const BanksSection: React.FC = () => {
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminBank>>({});

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBanks();
      setBanks(data);
    } catch (error) {
      console.error("Error loading banks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newBank = await adminApi.createBank({
        name: "Новый банк",
        baseRate: 0,
        minPVPercent: 20.1,
        isActive: true,
        order: banks.length,
      });
      setBanks([...banks, newBank]);
    } catch (error) {
      console.error("Error creating bank:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateBank(id, formData);
      setBanks(banks.map((b) => (b.id === id ? updated : b)));
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating bank:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить банк?")) return;
    try {
      await adminApi.deleteBank(id);
      setBanks(banks.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  const startEdit = (bank: AdminBank) => {
    setEditingId(bank.id);
    setFormData(bank);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <AdminLayout title="🏦 Банки-партнеры">
      <div className="admin-toolbar">
        <button onClick={handleCreate} className="admin-btn-primary">
          + Добавить банк
        </button>
        <button onClick={loadBanks} className="admin-btn-secondary">
          🔄 Обновить
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Базовая ставка</th>
              <th>Мин. ПВ</th>
              <th>Порядок</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank.id}>
                <td>
                  {editingId === bank.id ? (
                    <input
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    bank.name
                  )}
                </td>
                <td>
                  {editingId === bank.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={formData.baseRate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseRate: parseFloat(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `${bank.baseRate}%`
                  )}
                </td>
                <td>{bank.minPVPercent}%</td>
                <td>
                  {editingId === bank.id ? (
                    <input
                      type="number"
                      value={formData.order ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value),
                        })
                      }
                    />
                  ) : (
                    bank.order
                  )}
                </td>
                <td>
                  {editingId === bank.id ? (
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
                  ) : bank.isActive ? (
                    "✅ Активен"
                  ) : (
                    "❌ Неактивен"
                  )}
                </td>
                <td>
                  {editingId === bank.id ? (
                    <div className="admin-actions">
                      <button
                        onClick={() => handleUpdate(bank.id)}
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
                        onClick={() => startEdit(bank)}
                        className="admin-btn-primary"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id)}
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
