// frontend/src/pages/Admin/sections/BanksSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminBank } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import { useMortgageData } from "../../../hooks/api/useMortgageData";
import "./BanksSection.css";

export const BanksSection: React.FC = () => {
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminBank>>({});
  const [isCreating, setIsCreating] = useState(false);

  // 🔥 Получаем функции очистки кэша
  const { clearCache, getCacheSize } = useMortgageData();
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    loadBanks();
    setCacheSize(getCacheSize());
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

      // 🔥 Очищаем кэш после создания
      clearCache();
      setCacheSize(0);

      alert("✅ Банк успешно создан! Кэш очищен.");
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

      // 🔥 Очищаем кэш после обновления
      clearCache();
      setCacheSize(0);

      alert("✅ Банк успешно обновлен! Кэш очищен.");
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

      // 🔥 Очищаем кэш после удаления
      clearCache();
      setCacheSize(0);

      alert("✅ Банк удален! Кэш очищен.");
    } catch (error) {
      console.error("Error deleting bank:", error);
      alert("❌ Ошибка при удалении банка");
    }
  };

  const handleClearCache = () => {
    clearCache();
    setCacheSize(0);
    alert("🗑️ Кэш успешно очищен!");
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
        <div className="admin-toolbar">
          <button onClick={startCreate} className="admin-btn-primary">
            + Добавить банк
          </button>
          <button onClick={loadBanks} className="admin-btn-secondary">
            🔄 Обновить
          </button>
          <button
            onClick={handleClearCache}
            className="admin-btn-warning"
            title="Очистить кэш расчетов"
          >
            🗑️ Очистить кэш {cacheSize > 0 && `(${cacheSize})`}
          </button>
          <span
            style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: "auto" }}
          >
            Всего: {banks.length}
          </span>
        </div>

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
              {isCreating && (
                <tr>
                  <td>
                    <input
                      placeholder="Название банка"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
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
                    >
                      <option value="active">✅ Активен</option>
                      <option value="inactive">❌ Неактивен</option>
                    </select>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={handleCreate}
                        className="admin-btn-success"
                      >
                        💾 Сохранить
                      </button>
                      <button onClick={cancelEdit} className="admin-btn-danger">
                        ✕
                      </button>
                    </div>
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
