// frontend/src/pages/Admin/sections/ProgramsSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminProgram } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";

export const ProgramsSection: React.FC = () => {
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProgram>>({});

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateProgram(id, formData);
      setPrograms(programs.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error("Error updating program:", error);
    }
  };

  const startEdit = (program: AdminProgram) => {
    setEditingId(program.id);
    setFormData(program);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <AdminLayout title="📋 Программы ипотеки">
      <div className="admin-toolbar">
        <button onClick={loadPrograms} className="admin-btn-secondary">
          🔄 Обновить
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Название</th>
              <th>Иконка</th>
              <th>Цвет</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id}>
                <td>
                  {editingId === program.id ? (
                    <input
                      value={formData.type || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    />
                  ) : (
                    program.type
                  )}
                </td>
                <td>
                  {editingId === program.id ? (
                    <input
                      value={formData.label || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                    />
                  ) : (
                    program.label
                  )}
                </td>
                <td>
                  {editingId === program.id ? (
                    <input
                      value={formData.icon || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                    />
                  ) : (
                    <span style={{ fontSize: "1.5rem" }}>{program.icon}</span>
                  )}
                </td>
                <td>
                  {editingId === program.id ? (
                    <input
                      type="color"
                      value={formData.color || "#000000"}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    />
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        width: "20px",
                        height: "20px",
                        background: program.color,
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    />
                  )}
                </td>
                <td>
                  {editingId === program.id ? (
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
                    <span title={program.description}>
                      {program.description?.length > 30
                        ? program.description.substring(0, 30) + "..."
                        : program.description}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === program.id ? (
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
                  ) : program.isActive ? (
                    "✅ Активен"
                  ) : (
                    "❌ Неактивен"
                  )}
                </td>
                <td>
                  {editingId === program.id ? (
                    <div className="admin-actions">
                      <button
                        onClick={() => handleUpdate(program.id)}
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
                        onClick={() => startEdit(program)}
                        className="admin-btn-primary"
                      >
                        ✏️
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
