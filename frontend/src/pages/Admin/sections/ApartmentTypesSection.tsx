// frontend/src/pages/Admin/sections/ApartmentTypesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminApartmentType } from "../types/admin.types";
import "./ApartmentTypesSection.css";

interface ApartmentTypesSectionProps {
  complexId: string;
  complexName: string;
}

export const ApartmentTypesSection: React.FC<ApartmentTypesSectionProps> = ({
  complexId,
  complexName,
}) => {
  const [types, setTypes] = useState<AdminApartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminApartmentType>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTypes();
  }, [complexId]);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getApartmentTypes(complexId);
      setTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading apartment types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const newType = await adminApi.createApartmentType(complexId, {
        type: formData.type || "Новый тип",
        pricePerSquareMeter: formData.pricePerSquareMeter || 0,
        surcharges: formData.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        },
        isActive: true,
      });
      setTypes([...types, newType]);
      setIsCreating(false);
      setFormData({});
    } catch (error) {
      console.error("Error creating apartment type:", error);
      alert("Ошибка при создании типа квартиры");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateApartmentType(id, formData);
      setTypes(types.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating apartment type:", error);
      alert("Ошибка при обновлении типа квартиры");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить тип квартиры?")) return;
    try {
      await adminApi.deleteApartmentType(id);
      setTypes(types.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting apartment type:", error);
      alert("Ошибка при удалении типа квартиры");
    }
  };

  const startEdit = (type: AdminApartmentType) => {
    setEditingId(type.id);
    setFormData({
      type: type.type,
      pricePerSquareMeter: type.pricePerSquareMeter,
      surcharges: type.surcharges,
      isActive: type.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setIsCreating(false);
  };

  if (loading)
    return <div className="admin-loading">Загрузка типов квартир...</div>;

  return (
    <div className="apartment-types-section">
      <div className="admin-section" style={{ marginTop: "1rem" }}>
        <div className="admin-section-header">
          <h4>🏠 Типы квартир в {complexName}</h4>
          <button
            onClick={() => setIsCreating(true)}
            className="admin-btn-primary"
            disabled={isCreating}
          >
            + Добавить тип
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Цена за м² (₽)</th>
                <th>Надбавка без ПВ</th>
                <th>Надбавка с ПВ</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0 && !isCreating ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "1.5rem",
                    }}
                  >
                    Нет типов квартир. Нажмите "Добавить тип" чтобы создать
                    первый.
                  </td>
                </tr>
              ) : (
                <>
                  {types.map((type) => (
                    <tr key={type.id}>
                      <td>
                        {editingId === type.id ? (
                          <input
                            value={formData.type || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, type: e.target.value })
                            }
                          />
                        ) : (
                          type.type
                        )}
                      </td>
                      <td>
                        {editingId === type.id ? (
                          <input
                            type="number"
                            step="1000"
                            value={formData.pricePerSquareMeter ?? ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pricePerSquareMeter:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        ) : (
                          type.pricePerSquareMeter.toLocaleString()
                        )}
                      </td>
                      <td>
                        {editingId === type.id ? (
                          <input
                            type="number"
                            step="1000"
                            value={
                              formData.surcharges?.withoutDownPayment ?? ""
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                surcharges: {
                                  ...formData.surcharges,
                                  withoutDownPayment:
                                    parseInt(e.target.value) || 0,
                                  partialDownPayment:
                                    formData.surcharges?.partialDownPayment ||
                                    0,
                                },
                              })
                            }
                          />
                        ) : (
                          type.surcharges?.withoutDownPayment?.toLocaleString() ||
                          "0"
                        )}
                      </td>
                      <td>
                        {editingId === type.id ? (
                          <input
                            type="number"
                            step="1000"
                            value={
                              formData.surcharges?.partialDownPayment ?? ""
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                surcharges: {
                                  ...formData.surcharges,
                                  withoutDownPayment:
                                    formData.surcharges?.withoutDownPayment ||
                                    0,
                                  partialDownPayment:
                                    parseInt(e.target.value) || 0,
                                },
                              })
                            }
                          />
                        ) : (
                          type.surcharges?.partialDownPayment?.toLocaleString() ||
                          "0"
                        )}
                      </td>
                      <td>
                        {editingId === type.id ? (
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
                        ) : type.isActive ? (
                          "✅ Активен"
                        ) : (
                          "❌ Неактивен"
                        )}
                      </td>
                      <td>
                        {editingId === type.id ? (
                          <div className="admin-actions">
                            <button
                              onClick={() => handleUpdate(type.id)}
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
                              onClick={() => startEdit(type)}
                              className="admin-btn-primary"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
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
                          placeholder="Название типа"
                          value={formData.type || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Цена за м²"
                          value={formData.pricePerSquareMeter ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricePerSquareMeter:
                                parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Надбавка без ПВ"
                          value={formData.surcharges?.withoutDownPayment ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surcharges: {
                                ...formData.surcharges,
                                withoutDownPayment:
                                  parseInt(e.target.value) || 0,
                                partialDownPayment:
                                  formData.surcharges?.partialDownPayment || 0,
                              },
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Надбавка с ПВ"
                          value={formData.surcharges?.partialDownPayment ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              surcharges: {
                                ...formData.surcharges,
                                withoutDownPayment:
                                  formData.surcharges?.withoutDownPayment || 0,
                                partialDownPayment:
                                  parseInt(e.target.value) || 0,
                              },
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
                          <button
                            onClick={cancelEdit}
                            className="admin-btn-danger"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
