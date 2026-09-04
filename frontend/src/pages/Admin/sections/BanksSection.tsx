// frontend/src/pages/Admin/sections/BanksSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminBank } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import AdminToolbar from "../AdminToolbar";

import "./BanksSection.css";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

export const BanksSection: React.FC = () => {
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminBank>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBanks();
      setBanks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading banks:", error);
      alert("Ошибка при загрузке банков");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newBank = await adminApi.createBank({
        name: formData.name || "Новый банк",
        baseRate: formData.baseRate || 0,
        minPVPercent: formData.minPVPercent || 20.1,
        displayOrder: banks.length,
        isActive: true,
      });
      setBanks([...banks, newBank]);
      setIsCreating(false);
      setFormData({});
      alert("✅ Банк успешно создан!");
    } catch (error) {
      console.error("Error creating bank:", error);
      alert("❌ Ошибка при создании банка");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updateData = {
        name: formData.name,
        baseRate: formData.baseRate,
        minPVPercent: formData.minPVPercent,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };
      const updated = await adminApi.updateBank(id, updateData);
      setBanks(banks.map((b) => (b.id === id ? updated : b)));
      setEditingId(null);
      setFormData({});
      alert("✅ Банк успешно обновлен!");
    } catch (error) {
      console.error("Error updating bank:", error);
      alert("❌ Ошибка при обновлении банка");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить банк?")) return;
    try {
      await adminApi.deleteBank(id);
      setBanks(banks.filter((b) => b.id !== id));
      alert("✅ Банк удален!");
    } catch (error) {
      console.error("Error deleting bank:", error);
      alert("❌ Ошибка при удалении банка");
    }
  };

  const startEdit = (bank: AdminBank) => {
    setEditingId(bank.id);
    setFormData({
      name: bank.name,
      baseRate: bank.baseRate,
      displayOrder: bank.displayOrder,
      isActive: bank.isActive,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      baseRate: 0,
      minPVPercent: 20.1,
      displayOrder: banks.length,
      isActive: true,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setIsCreating(false);
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="banks-section">
      <AdminLayout title="🏦 Банки-партнеры">
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить банк",
              onClick: startCreate,
              variant: "primary",
            },
            { label: "🔄 Обновить", onClick: loadBanks, variant: "secondary" },
          ]}
          totalCount={banks.length}
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Slug</th>
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
                        className="admin-input admin-input-sm"
                      />
                    ) : (
                      bank.name
                    )}
                  </td>
                  <td>{bank.slug || "-"}</td>
                  <td>
                    {editingId === bank.id ? (
                      <input
                        type="number"
                        step="0.1"
                        value={formData.baseRate ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baseRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="admin-input admin-input-sm admin-input-number"
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
                        value={formData.displayOrder ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: parseInt(e.target.value) || 0,
                          })
                        }
                        className="admin-input admin-input-sm admin-input-number"
                      />
                    ) : (
                      bank.displayOrder
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
                        className="admin-select admin-select-sm"
                      >
                        <option value="active">✅ Активен</option>
                        <option value="inactive">❌ Неактивен</option>
                      </select>
                    ) : (
                      <StatusBadge isActive={bank.isActive} />
                    )}
                  </td>
                  <td>
                    {editingId === bank.id ? (
                      <ActionButtons
                        buttons={[
                          {
                            icon: "💾",
                            onClick: () => handleUpdate(bank.id),
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
                    ) : (
                      <ActionButtons
                        buttons={[
                          {
                            icon: "✏️",
                            onClick: () => startEdit(bank),
                            variant: "primary",
                            title: "Редактировать",
                          },
                          {
                            icon: "🗑️",
                            onClick: () => handleDelete(bank.id),
                            variant: "danger",
                            title: "Удалить",
                          },
                        ]}
                        size="sm"
                      />
                    )}
                  </td>
                </tr>
              ))}
              {isCreating && (
                <tr>
                  <td>
                    <input
                      placeholder="Название банка"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>-</td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ставка"
                      value={formData.baseRate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="admin-input admin-input-sm admin-input-number"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Мин. ПВ"
                      value={formData.minPVPercent ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPVPercent: parseFloat(e.target.value) || 20.1,
                        })
                      }
                      className="admin-input admin-input-sm admin-input-number"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Порядок"
                      value={formData.displayOrder ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      className="admin-input admin-input-sm admin-input-number"
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
                          icon: "💾 Сохранить",
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
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </div>
  );
};
