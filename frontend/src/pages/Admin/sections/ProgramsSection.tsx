// frontend/src/pages/Admin/sections/ProgramsSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { AdminProgram } from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import "./ProgramsSection.css";

export const ProgramsSection: React.FC = () => {
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProgram>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPrograms();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading programs:", error);
      alert("Ошибка при загрузке программ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.type) {
        alert("Введите тип программы");
        return;
      }
      if (!formData.label) {
        alert("Введите название программы");
        return;
      }

      const newProgram = await adminApi.createProgram({
        type: formData.type,
        label: formData.label,
        icon: formData.icon || "🏦",
        color: formData.color || "#6b7280",
        description: formData.description || "",
        displayOrder: formData.displayOrder || programs.length,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });

      setPrograms([...programs, newProgram]);
      setIsCreating(false);
      setFormData({});
      alert("✅ Программа успешно создана!");
    } catch (error: any) {
      console.error("Error creating program:", error);
      alert(`❌ ${error.message || "Ошибка при создании программы"}`);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateProgram(id, formData);
      setPrograms(programs.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
      setFormData({});
      alert("✅ Программа успешно обновлена!");
    } catch (error: any) {
      console.error("Error updating program:", error);
      alert(`❌ ${error.message || "Ошибка при обновлении программы"}`);
    }
  };

  // 🔥 Обновленная функция удаления с поддержкой каскадного удаления
  const handleDelete = async (id: string) => {
    const program = programs.find((p) => p.id === id);
    const programName = program?.label || program?.type || "Программа";

    try {
      // Пробуем удалить без каскада
      await adminApi.deleteProgram(id);
      setPrograms(programs.filter((p) => p.id !== id));
      alert(`✅ Программа "${programName}" удалена!`);
    } catch (error: any) {
      console.error("Error deleting program:", error);

      // Если это 409 Conflict - предлагаем каскадное удаление
      if (error.status === 409 && error.canCascade) {
        const confirmMessage =
          `⚠️ Программа "${programName}" имеет ${error.offersCount} связанных офферов!\n\n` +
          `Вы можете:\n` +
          `1. Нажать "Отмена" - ничего не удалять\n` +
          `2. Нажать "OK" - удалить программу со всеми офферами\n\n` +
          `❗ ВСЕ связанные офферы будут удалены БЕЗВОЗВРАТНО!\n\n` +
          `Удалить программу и все ${error.offersCount} офферов?`;

        if (confirm(confirmMessage)) {
          try {
            // Удаляем с каскадом
            const result = await adminApi.deleteProgram(id, true);
            setPrograms(programs.filter((p) => p.id !== id));
            alert(
              `✅ Программа "${programName}" удалена вместе с ${result.offersDeleted || error.offersCount} офферами!`,
            );
          } catch (cascadeError: any) {
            console.error("Error deleting program with cascade:", cascadeError);
            alert(
              `❌ ${cascadeError.message || "Ошибка при каскадном удалении программы"}`,
            );
          }
        }
        return;
      }

      // Другие ошибки
      alert(`❌ ${error.message || "Ошибка при удалении программы"}`);
    }
  };

  const startEdit = (program: AdminProgram) => {
    setEditingId(program.id);
    setFormData({
      type: program.type,
      label: program.label,
      icon: program.icon,
      color: program.color,
      description: program.description,
      displayOrder: program.displayOrder,
      isActive: program.isActive,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setFormData({
      type: "",
      label: "",
      icon: "🏦",
      color: "#6b7280",
      description: "",
      displayOrder: programs.length,
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
    <div className="programs-section">
      <AdminLayout title="📋 Программы ипотеки">
        <div className="admin-toolbar">
          <button onClick={startCreate} className="admin-btn-primary">
            + Добавить программу
          </button>
          <button onClick={loadPrograms} className="admin-btn-secondary">
            🔄 Обновить
          </button>
          <span
            style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: "auto" }}
          >
            Всего: {programs.length}
          </span>
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
                <th>Порядок</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {isCreating && (
                <tr>
                  <td>
                    <input
                      placeholder="Тип (например: base)"
                      value={formData.type || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Название"
                      value={formData.label || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Иконка"
                      value={formData.icon || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      style={{
                        textAlign: "center",
                        fontSize: "1.2rem",
                        width: "60px",
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="color"
                      value={formData.color || "#6b7280"}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      style={{
                        padding: "2px",
                        width: "40px",
                        height: "30px",
                        cursor: "pointer",
                      }}
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Описание"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
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
                      style={{ width: "60px" }}
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
                        className="admin-btn-success admin-btn-sm"
                      >
                        💾 Создать
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="admin-btn-danger admin-btn-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {programs.map((program) => (
                <tr key={program.id}>
                  {editingId === program.id ? (
                    <>
                      <td>
                        <input
                          value={formData.type || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={formData.label || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, label: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={formData.icon || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, icon: e.target.value })
                          }
                          style={{
                            textAlign: "center",
                            fontSize: "1.2rem",
                            width: "60px",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="color"
                          value={formData.color || "#6b7280"}
                          onChange={(e) =>
                            setFormData({ ...formData, color: e.target.value })
                          }
                          style={{
                            padding: "2px",
                            width: "40px",
                            height: "30px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.displayOrder ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              displayOrder: parseInt(e.target.value) || 0,
                            })
                          }
                          style={{ width: "60px" }}
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
                            onClick={() => handleUpdate(program.id)}
                            className="admin-btn-success admin-btn-sm"
                          >
                            💾
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="admin-btn-danger admin-btn-sm"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <code
                          style={{
                            fontSize: "0.8rem",
                            background: "#f3f4f6",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "0.25rem",
                            color: "#374151",
                          }}
                        >
                          {program.type}
                        </code>
                      </td>
                      <td>
                        <strong>{program.label}</strong>
                      </td>
                      <td style={{ fontSize: "1.5rem", textAlign: "center" }}>
                        {program.icon}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            width: "24px",
                            height: "24px",
                            background: program.color,
                            borderRadius: "4px",
                            border: "1px solid #e5e7eb",
                            verticalAlign: "middle",
                          }}
                        />
                      </td>
                      <td>
                        <span title={program.description}>
                          {program.description?.length > 30
                            ? program.description.substring(0, 30) + "..."
                            : program.description || "-"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {program.displayOrder}
                      </td>
                      <td>
                        {program.isActive ? (
                          <span className="status-badge active">
                            ✅ Активен
                          </span>
                        ) : (
                          <span className="status-badge inactive">
                            ❌ Неактивен
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            onClick={() => startEdit(program)}
                            className="admin-btn-primary admin-btn-sm"
                            title="Редактировать"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(program.id)}
                            className="admin-btn-danger admin-btn-sm"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {programs.length === 0 && !isCreating && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "2rem",
                    }}
                  >
                    Нет программ. Нажмите <strong>"Добавить программу"</strong>{" "}
                    чтобы создать первую.
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
