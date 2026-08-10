// frontend/src/pages/Admin/sections/ComplexesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminComplex } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import { ApartmentTypesSection } from "./ApartmentTypesSection";
import "./ComplexesSection.css";

export const ComplexesSection: React.FC = () => {
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminComplex>>({});
  const [expandedComplex, setExpandedComplex] = useState<string | null>(null);

  useEffect(() => {
    loadComplexes();
  }, []);

  const loadComplexes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getComplexes();
      setComplexes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading complexes:", error);
    } finally {
      setLoading(false);
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
      alert("Ошибка при обновлении ЖК");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить ЖК? Это удалит все связанные типы квартир!")) return;
    try {
      await adminApi.deleteComplex(id);
      setComplexes(complexes.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting complex:", error);
      alert("Ошибка при удалении ЖК");
    }
  };

  const startEdit = (complex: AdminComplex) => {
    setEditingId(complex.id);
    setFormData({
      name: complex.name,
      status: complex.status,
      description: complex.description,
      banks: complex.banks,
      paymentTerms: complex.paymentTerms,
      promotions: complex.promotions,
      specialOffers: complex.specialOffers,
      materialsLink: complex.materialsLink,
      isActive: complex.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const toggleExpand = (id: string) => {
    setExpandedComplex(expandedComplex === id ? null : id);
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="complexes-section">
      <AdminLayout title="🏗️ Жилые комплексы">
        <div className="admin-toolbar">
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
                <th>Типы квартир</th>
                <th>Банки</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {complexes.map((complex) => (
                <React.Fragment key={complex.id}>
                  <tr>
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
                      ) : (
                        <span>
                          {complex.status === "строится" && "🏗️ Строится"}
                          {complex.status === "сдан" && "🏢 Сдан"}
                          {complex.status === "проект" && "🏠 Проект"}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="admin-btn-secondary"
                        onClick={() => toggleExpand(complex.id)}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {expandedComplex === complex.id
                          ? "📄 Скрыть"
                          : "📄 Показать"}{" "}
                        ({complex.apartmentTypes?.length || 0})
                      </button>
                    </td>
                    <td>
                      {editingId === complex.id ? (
                        <input
                          value={formData.banks?.join(", ") || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              banks: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
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
                  {expandedComplex === complex.id && (
                    <tr>
                      <td colSpan={6} style={{ padding: "0.5rem" }}>
                        <ApartmentTypesSection
                          complexId={complex.id}
                          complexName={complex.name}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </div>
  );
};
