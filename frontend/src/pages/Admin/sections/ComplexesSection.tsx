// frontend/src/pages/Admin/sections/ComplexesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminComplex } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";

export const ComplexesSection: React.FC = () => {
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminComplex>>({});

  useEffect(() => {
    loadComplexes();
  }, []);

  const loadComplexes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getComplexes();
      setComplexes(data);
    } catch (error) {
      console.error("Error loading complexes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newComplex = await adminApi.createComplex({
        name: "Новый ЖК",
        status: "строится",
        description: "",
        pricePerSquareMeter: 0,
        banks: [],
        surcharges: { withoutDownPayment: 0, partialDownPayment: 0 },
        paymentTerms: [],
        promotions: [],
        specialOffers: [],
        materialsLink: "",
        isActive: true,
      });
      setComplexes([...complexes, newComplex]);
    } catch (error) {
      console.error("Error creating complex:", error);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateComplex(id, formData);
      setComplexes(complexes.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating complex:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить ЖК?")) return;
    try {
      await adminApi.deleteComplex(id);
      setComplexes(complexes.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting complex:", error);
    }
  };

  const startEdit = (complex: AdminComplex) => {
    setEditingId(complex.id);
    setFormData(complex);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <AdminLayout title="🏗️ Жилые комплексы">
      <div className="admin-toolbar">
        <button onClick={handleCreate} className="admin-btn-primary">
          + Добавить ЖК
        </button>
        <button onClick={loadComplexes} className="admin-btn-secondary">
          🔄 Обновить
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Статус</th>
              <th>Цена за м²</th>
              <th>Банки</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {complexes.map((complex) => (
              <tr key={complex.id}>
                <td>
                  {editingId === complex.id ? (
                    <input
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    complex.name
                  )}
                </td>
                <td>
                  {editingId === complex.id ? (
                    <select
                      value={formData.status || "строится"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                    >
                      <option value="строится">🏗️ Строится</option>
                      <option value="сдан">🏢 Сдан</option>
                      <option value="проект">🏠 Проект</option>
                    </select>
                  ) : complex.status === "строится" ? (
                    "🏗️ Строится"
                  ) : complex.status === "сдан" ? (
                    "🏢 Сдан"
                  ) : (
                    "🏠 Проект"
                  )}
                </td>
                <td>
                  {editingId === complex.id ? (
                    <input
                      type="number"
                      value={formData.pricePerSquareMeter ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerSquareMeter: parseInt(e.target.value),
                        })
                      }
                    />
                  ) : (
                    `${complex.pricePerSquareMeter.toLocaleString()} ₽`
                  )}
                </td>
                <td>
                  {editingId === complex.id ? (
                    <input
                      value={formData.banks?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          banks: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      placeholder="Банки через запятую"
                    />
                  ) : (
                    complex.banks?.join(", ") || "-"
                  )}
                </td>
                <td>
                  {editingId === complex.id ? (
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
                  ) : complex.isActive ? (
                    "✅ Активен"
                  ) : (
                    "❌ Неактивен"
                  )}
                </td>
                <td>
                  {editingId === complex.id ? (
                    <div className="admin-actions">
                      <button
                        onClick={() => handleUpdate(complex.id)}
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
                        onClick={() => startEdit(complex)}
                        className="admin-btn-primary"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(complex.id)}
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
