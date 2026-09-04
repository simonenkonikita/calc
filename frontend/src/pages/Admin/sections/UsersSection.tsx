// frontend/src/pages/Admin/sections/UsersSection.tsx

import React, { useState, useEffect } from "react";
import { AdminLayout } from "../AdminLayout";
import { UserRole, Company } from "../../../types/auth.types";
import { AdminUser } from "../types/admin.types";
import AdminToolbar from "../AdminToolbar";
import "./UsersSection.css";
import { useAuthExtended } from "../../../hooks/ui/useAuth";
import adminApi from "../../../services/adminApi";
import ActionButtons from "./ActionButtons";
import StatusBadge from "./StatusBadge";

export const UsersSection: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminUser>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAdmin } = useAuthExtended();

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, companiesData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getCompanies(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  const handleCreateUser = async () => {
    if (!formData.email) {
      alert("⚠️ Введите email");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      alert("⚠️ Пароль должен быть не менее 6 символов");
      return;
    }

    try {
      setIsSubmitting(true);

      await adminApi.createUserByAdmin({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        position: formData.position,
        companyId: formData.companyId,
        role: formData.role || "developer_manager",
      });

      setIsCreating(false);
      setFormData({});
      await loadData();
      alert("✅ Пользователь создан!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка создания пользователя"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  const handleUpdateUser = async (id: string) => {
    try {
      await adminApi.updateUser(id, formData);
      setEditingId(null);
      setFormData({});
      await loadData();
      alert("✅ Пользователь обновлен!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка обновления"}`);
    }
  };

  // ============================================================
  // УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Удалить пользователя?")) return;
    try {
      await adminApi.deleteUser(id);
      await loadData();
      alert("✅ Пользователь удален!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка удаления"}`);
    }
  };

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ
  // ============================================================

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      admin: "👑 Администратор проекта",
      developer_admin: "🏢 Администратор компании",
      developer_manager: "📋 Менеджер компании",
      agent: "🤝 Агент",
    };
    return labels[role] || role;
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return "-";
    const company = companies.find((c) => c.id === companyId);
    return company?.name || "-";
  };

  // ============================================================
  // РЕНДЕР
  // ============================================================

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="users-section">
      <AdminLayout title="👥 Пользователи">
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить пользователя",
              onClick: () => {
                setIsCreating(true);
                setFormData({ role: "developer_manager" });
              },
              variant: "primary",
            },
            { label: "🔄 Обновить", onClick: loadData, variant: "secondary" },
          ]}
          totalCount={users.length}
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Роль</th>
                <th>Компания</th>
                <th>Телефон</th>
                <th>Должность</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {/* Форма создания пользователя */}
              {isCreating && (
                <tr>
                  <td>
                    <input
                      placeholder="Email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Имя"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <select
                      value={formData.role || "developer_manager"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as UserRole,
                        })
                      }
                      className="admin-select admin-select-sm"
                    >
                      <option value="developer_manager">
                        Менеджер компании
                      </option>
                      <option value="admin">Администратор проекта</option>
                      <option value="developer_admin">
                        Администратор компании
                      </option>
                      <option value="agent">Агент</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={formData.companyId || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, companyId: e.target.value })
                      }
                      className="admin-select admin-select-sm"
                    >
                      <option value="">Без компании</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      placeholder="Телефон"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Должность"
                      value={formData.position || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className="admin-input admin-input-sm"
                    />
                  </td>
                  <td>
                    <StatusBadge isActive={true} />
                  </td>
                  <td>
                    <ActionButtons
                      buttons={[
                        {
                          icon: "💾",
                          onClick: handleCreateUser,
                          variant: "success",
                          title: "Сохранить",
                          disabled: isSubmitting,
                        },
                        {
                          icon: "✕",
                          onClick: () => {
                            setIsCreating(false);
                            setFormData({});
                          },
                          variant: "danger",
                          title: "Отмена",
                        },
                      ]}
                      size="sm"
                    />
                  </td>
                </tr>
              )}

              {/* Список пользователей */}
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {editingId === user.id ? (
                      <input
                        value={formData.email || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="admin-input admin-input-sm"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        value={formData.firstName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="admin-input admin-input-sm"
                      />
                    ) : (
                      `${user.firstName || ""} ${user.lastName || ""}`
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <select
                        value={formData.role || user.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="admin-select admin-select-sm"
                      >
                        <option value="admin">Администратор проекта</option>
                        <option value="developer_admin">
                          Администратор компании
                        </option>
                        <option value="developer_manager">
                          Менеджер компании
                        </option>
                        <option value="agent">Агент</option>
                      </select>
                    ) : (
                      <span className="role-badge">
                        {getRoleLabel(user.role)}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <select
                        value={formData.companyId || user.companyId || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyId: e.target.value,
                          })
                        }
                        className="admin-select admin-select-sm"
                      >
                        <option value="">Без компании</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getCompanyName(user.companyId)
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        value={formData.phone || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="admin-input admin-input-sm"
                      />
                    ) : (
                      user.phone || "-"
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <input
                        value={formData.position || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        className="admin-input admin-input-sm"
                      />
                    ) : (
                      user.position || "-"
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
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
                      <StatusBadge isActive={user.isActive} />
                    )}
                  </td>
                  <td>
                    {editingId === user.id ? (
                      <ActionButtons
                        buttons={[
                          {
                            icon: "💾",
                            onClick: () => handleUpdateUser(user.id),
                            variant: "success",
                            title: "Сохранить",
                          },
                          {
                            icon: "✕",
                            onClick: () => {
                              setEditingId(null);
                              setFormData({});
                            },
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
                            onClick: () => {
                              setEditingId(user.id);
                              setFormData(user);
                            },
                            variant: "primary",
                            title: "Редактировать",
                          },
                          {
                            icon: "🗑️",
                            onClick: () => handleDeleteUser(user.id),
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

              {users.length === 0 && !isCreating && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    Нет пользователей. Добавьте пользователя.
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
