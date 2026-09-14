// frontend/src/pages/Admin/sections/ProgramsSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../../services/adminApi";
import { AdminProgram } from "../../types/admin.types";
import { AdminLayout } from "../../components/AdminLayout/AdminLayout";
import AdminToolbar from "../../components/AdminToolbar/AdminToolbar";
import "./ProgramsSection.css";
import ActionButtons from "../../components/ActionButtons/ActionButtons";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

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

  const handleDelete = async (id: string) => {
    const program = programs.find((p) => p.id === id);
    const programName = program?.label || program?.type || "Программа";

    try {
      await adminApi.deleteProgram(id);
      setPrograms(programs.filter((p) => p.id !== id));
      alert(`✅ Программа "${programName}" удалена!`);
    } catch (error: any) {
      console.error("Error deleting program:", error);

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
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить программу",
              onClick: startCreate,
              variant: "primary",
            },
            {
              label: "🔄 Обновить",
              onClick: loadPrograms,
              variant: "secondary",
            },
          ]}
          totalCount={programs.length}
        />

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
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Название"
                      value={formData.label || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Иконка"
                      value={formData.icon || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="admin-input admin-input-sm admin-input-icon"
                    />
                  </td>
                  <td>
                    <input
                      type="color"
                      value={formData.color || "#6b7280"}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="admin-input admin-input-sm admin-input-color"
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
                      className="admin-input admin-input-sm"
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
                      className="admin-input admin-input-sm admin-input-number admin-input-order"
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
                          icon: "💾",
                          onClick: handleCreate,
                          variant: "success",
                          title: "Создать",
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
                          className="admin-input admin-input-sm"
                        />
                      </td>
                      <td>
                        <input
                          value={formData.label || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, label: e.target.value })
                          }
                          className="admin-input admin-input-sm"
                        />
                      </td>
                      <td>
                        <input
                          value={formData.icon || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, icon: e.target.value })
                          }
                          className="admin-input admin-input-sm admin-input-icon"
                        />
                      </td>
                      <td>
                        <input
                          type="color"
                          value={formData.color || "#6b7280"}
                          onChange={(e) =>
                            setFormData({ ...formData, color: e.target.value })
                          }
                          className="admin-input admin-input-sm admin-input-color"
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
                          className="admin-input admin-input-sm"
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
                          className="admin-input admin-input-sm admin-input-number admin-input-order"
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
                              icon: "💾",
                              onClick: () => handleUpdate(program.id),
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
                    </>
                  ) : (
                    <>
                      <td>
                        <code className="program-type-code">
                          {program.type}
                        </code>
                      </td>
                      <td>
                        <strong>{program.label}</strong>
                      </td>
                      <td className="program-icon">{program.icon}</td>
                      <td>
                        <span
                          className="program-color-preview"
                          style={{ background: program.color }}
                        />
                      </td>
                      <td>
                        <span
                          className="program-description"
                          title={program.description}
                        >
                          {program.description?.length > 30
                            ? program.description.substring(0, 30) + "..."
                            : program.description || "-"}
                        </span>
                      </td>
                      <td className="program-order">{program.displayOrder}</td>
                      <td>
                        <StatusBadge isActive={program.isActive} />
                      </td>
                      <td>
                        <ActionButtons
                          buttons={[
                            {
                              icon: "✏️",
                              onClick: () => startEdit(program),
                              variant: "primary",
                              title: "Редактировать",
                            },
                            {
                              icon: "🗑️",
                              onClick: () => handleDelete(program.id),
                              variant: "danger",
                              title: "Удалить",
                            },
                          ]}
                          size="sm"
                        />
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {programs.length === 0 && !isCreating && (
                <tr>
                  <td colSpan={8} className="empty-state">
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
