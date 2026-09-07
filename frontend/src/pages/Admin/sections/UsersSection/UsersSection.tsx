// frontend/src/pages/Admin/sections/UsersSection/UsersSection.tsx

import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout/AdminLayout";
import { UserRole, Company } from "../../../../types/auth.types";
import { AdminUser } from "../../types/admin.types";
import AdminToolbar from "../../components/AdminToolbar/AdminToolbar";
import "./UsersSection.css";
import { useAuthExtended } from "../../../../hooks/ui/useAuth";
import adminApi from "../../../../services/adminApi";
import AdminModal, {
  AdminModalField,
} from "../../components/AdminModal/AdminModal";
import ActionButtons from "../../components/ActionButtons/ActionButtons";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import Tabs from "../../components/Tabs/Tabs";

export const UsersSection: React.FC = () => {
  const { user, isAdmin, isDeveloperAdmin, isDeveloperManager } =
    useAuthExtended();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<
    Partial<AdminUser> & {
      newPassword?: string;
      confirmPassword?: string;
    }
  >({});
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string>("all");

  const hasAccess = isAdmin || isDeveloperAdmin || isDeveloperManager;

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  const loadData = async () => {
    try {
      setLoading(true);

      const usersData = await adminApi.getUsers();

      let companiesData: Company[] = [];
      if (isAdmin) {
        companiesData = await adminApi.getCompanies();
      } else if ((isDeveloperAdmin || isDeveloperManager) && user?.companyId) {
        companiesData = [
          {
            id: user.companyId,
            name: user.companyName || user.company || "Моя компания",
            slug: "",
            isActive: true,
            createdAt: "",
            updatedAt: "",
          },
        ];
      }

      setUsers(Array.isArray(usersData) ? usersData : []);
      setCompanies(companiesData);
    } catch (error) {
      console.error("❌ Error loading users:", error);
      setUsers([]);
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

    const password = formData.password || "";
    const confirmPassword = formData.confirmPassword || "";

    if (!password || password.length < 6) {
      alert("⚠️ Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      alert("⚠️ Пароли не совпадают");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isAdmin) {
        await adminApi.createUserByAdmin({
          email: formData.email,
          password: password,
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          phone: formData.phone || "",
          position: formData.position || "",
          companyId: formData.companyId || user?.companyId || "",
          role: formData.role || "developer_manager",
        });
      } else if (isDeveloperAdmin) {
        await adminApi.createCompanyManager({
          email: formData.email,
          password: password,
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          phone: formData.phone || "",
          position: formData.position || "",
          companyId: user?.companyId || "",
        });
      } else {
        alert("⚠️ У вас нет прав для создания пользователей");
        return;
      }

      setIsCreating(false);
      setFormData({});
      await loadData();
      alert(
        "✅ Пользователь создан! На email отправлено письмо с подтверждением.",
      );
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка создания пользователя"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ
  // ============================================================

  const handleUpdateUser = async () => {
    if (!editingId) return;

    const newPassword = formData.newPassword || "";
    const confirmPassword = formData.confirmPassword || "";

    if (newPassword || confirmPassword) {
      if (!newPassword || newPassword.length < 6) {
        alert("⚠️ Пароль должен быть не менее 6 символов");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("⚠️ Пароли не совпадают");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const updateData: any = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        phone: formData.phone || "",
        position: formData.position || "",
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      if (newPassword && newPassword.length >= 6) {
        updateData.password = newPassword;
      }

      if (isAdmin) {
        if (formData.role !== undefined) updateData.role = formData.role;
        if (formData.companyId !== undefined)
          updateData.companyId = formData.companyId;
      }

      await adminApi.updateUser(editingId, updateData);
      setEditingId(null);
      setFormData({});
      await loadData();
      alert("✅ Пользователь обновлен!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка обновления"}`);
    } finally {
      setIsSubmitting(false);
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
  // 🔥 ПОВТОРНАЯ ОТПРАВКА ПИСЬМА ПОДТВЕРЖДЕНИЯ EMAIL
  // ============================================================

  const handleResendVerification = async (
    userId: string,
    userEmail: string,
  ) => {
    if (
      !confirm(`Отправить повторное письмо с подтверждением на ${userEmail}?`)
    )
      return;
    try {
      await adminApi.resendVerificationByAdmin(userId);
      alert(`✅ Письмо с подтверждением отправлено повторно на ${userEmail}!`);
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка отправки письма"}`);
    }
  };

  // ============================================================
  // ОТПРАВКА ССЫЛКИ ДЛЯ СБРОСА ПАРОЛЯ
  // ============================================================

  const handleSendResetLink = async (userId: string, userEmail: string) => {
    if (!confirm(`Отправить ссылку для сброса пароля на ${userEmail}?`)) return;
    try {
      const result = await adminApi.sendPasswordResetLink(userId);
      alert(`✅ ${result.message || "Ссылка для сброса пароля отправлена!"}`);
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка отправки ссылки"}`);
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
  // ФИЛЬТРАЦИЯ ПОЛЬЗОВАТЕЛЕЙ
  // ============================================================

  const getFilteredUsers = () => {
    if (selectedTabId === "all") {
      return users;
    }
    if (selectedTabId === "admins") {
      return users.filter((u) => u.role === "admin");
    }
    if (selectedTabId === "agents") {
      return users.filter((u) => u.role === "agent");
    }
    return users.filter((u) => u.companyId === selectedTabId);
  };

  const getTabs = () => {
    const tabs: Array<{
      id: string;
      label: string;
      icon: string;
      count: number;
      isActive: boolean;
    }> = [];

    if (isAdmin) {
      tabs.push(
        {
          id: "all",
          label: "Все пользователи",
          icon: "👥",
          count: users.length,
          isActive: true,
        },
        {
          id: "admins",
          label: "Администраторы",
          icon: "👑",
          count: users.filter((u) => u.role === "admin").length,
          isActive: true,
        },
        {
          id: "agents",
          label: "Агенты",
          icon: "🤝",
          count: users.filter((u) => u.role === "agent").length,
          isActive: true,
        },
      );
    }

    if (isAdmin || isDeveloperAdmin || isDeveloperManager) {
      for (const company of companies) {
        const count = users.filter((u) => u.companyId === company.id).length;
        tabs.push({
          id: company.id,
          label: company.name,
          icon: "🏢",
          count: count,
          isActive: company.isActive,
        });
      }
    }

    if (tabs.length === 0) {
      tabs.push({
        id: "all",
        label: "Все пользователи",
        icon: "👥",
        count: users.length,
        isActive: true,
      });
    }

    return tabs;
  };

  // ============================================================
  // ПОЛЯ ДЛЯ СОЗДАНИЯ
  // ============================================================

  const getCreateFields = (): AdminModalField[] => {
    const fields: AdminModalField[] = [
      {
        name: "lastName",
        label: "Фамилия",
        type: "text",
        placeholder: "Петров",
        value: formData.lastName || "",
        onChange: (value) => setFormData({ ...formData, lastName: value }),
      },
      {
        name: "firstName",
        label: "Имя",
        type: "text",
        placeholder: "Иван",
        value: formData.firstName || "",
        onChange: (value) => setFormData({ ...formData, firstName: value }),
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Введите email",
        required: true,
        value: formData.email || "",
        onChange: (value) => setFormData({ ...formData, email: value }),
        fullWidth: true,
      },
      {
        name: "password",
        label: "Пароль",
        type: "password",
        placeholder: "Минимум 6 символов",
        required: true,
        value: formData.password || "",
        onChange: (value) => setFormData({ ...formData, password: value }),
        hint: "Пароль должен содержать не менее 6 символов",
        fullWidth: true,
      },
      {
        name: "confirmPassword",
        label: "Подтвердите пароль",
        type: "password",
        placeholder: "Повторите пароль",
        required: true,
        value: formData.confirmPassword || "",
        onChange: (value) =>
          setFormData({ ...formData, confirmPassword: value }),
        hint: "Пароли должны совпадать",
        fullWidth: true,
      },
    ];

    if (isAdmin) {
      fields.push({
        name: "role",
        label: "Роль",
        type: "select",
        options: [
          { value: "developer_manager", label: "📋 Менеджер компании" },
          { value: "admin", label: "👑 Администратор проекта" },
          { value: "developer_admin", label: "🏢 Администратор компании" },
          { value: "agent", label: "🤝 Агент" },
        ],
        required: true,
        value: formData.role || "developer_manager",
        onChange: (value) =>
          setFormData({ ...formData, role: value as UserRole }),
      });
    } else if (isDeveloperAdmin) {
      fields.push({
        name: "role",
        label: "Роль",
        type: "select",
        options: [
          { value: "developer_manager", label: "📋 Менеджер компании" },
        ],
        required: true,
        value: "developer_manager",
        onChange: () => {},
        disabled: true,
      });
    }

    if (isAdmin) {
      fields.push({
        name: "companyId",
        label: "Компания",
        type: "select",
        options: [
          { value: "", label: "Без компании" },
          ...companies.map((c) => ({ value: c.id, label: c.name })),
        ],
        value: formData.companyId || "",
        onChange: (value) => setFormData({ ...formData, companyId: value }),
      });
    } else if (isDeveloperAdmin && user?.companyId) {
      fields.push({
        name: "companyId",
        label: "Компания",
        type: "select",
        options: [
          { value: user.companyId, label: user.companyName || "Моя компания" },
        ],
        value: user.companyId,
        onChange: () => {},
        disabled: true,
      });
    }

    fields.push(
      {
        name: "phone",
        label: "Телефон",
        type: "text",
        placeholder: "+7 (999) 123-45-67",
        value: formData.phone || "",
        onChange: (value) => setFormData({ ...formData, phone: value }),
      },
      {
        name: "position",
        label: "Должность",
        type: "text",
        placeholder: "Старший менеджер",
        value: formData.position || "",
        onChange: (value) => setFormData({ ...formData, position: value }),
        fullWidth: true,
      },
    );

    return fields;
  };

  // ============================================================
  // ПОЛЯ ДЛЯ РЕДАКТИРОВАНИЯ
  // ============================================================

  const getEditFields = (selectedUser: AdminUser): AdminModalField[] => {
    const fields: AdminModalField[] = [
      {
        name: "firstName",
        label: "Имя",
        type: "text",
        placeholder: "Иван",
        value: (formData.firstName ?? selectedUser.firstName) || "",
        onChange: (value) => setFormData({ ...formData, firstName: value }),
      },
      {
        name: "lastName",
        label: "Фамилия",
        type: "text",
        placeholder: "Петров",
        value: (formData.lastName ?? selectedUser.lastName) || "",
        onChange: (value) => setFormData({ ...formData, lastName: value }),
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "user@example.com",
        value: selectedUser.email || "",
        onChange: () => {},
        fullWidth: true,
        disabled: true,
      },
      {
        name: "newPassword",
        label: "Новый пароль",
        type: "password",
        placeholder: "Введите новый пароль (мин. 6 символов)",
        value: formData.newPassword || "",
        onChange: (value) => setFormData({ ...formData, newPassword: value }),
        hint: "Оставьте пустым, чтобы не менять пароль",
        fullWidth: true,
      },
      {
        name: "confirmPassword",
        label: "Подтвердите пароль",
        type: "password",
        placeholder: "Повторите новый пароль",
        value: formData.confirmPassword || "",
        onChange: (value) =>
          setFormData({ ...formData, confirmPassword: value }),
        hint: "Пароли должны совпадать",
        fullWidth: true,
      },
    ];

    if (isAdmin) {
      fields.push({
        name: "role",
        label: "Роль",
        type: "select",
        options: [
          { value: "developer_manager", label: "📋 Менеджер компании" },
          { value: "admin", label: "👑 Администратор проекта" },
          { value: "developer_admin", label: "🏢 Администратор компании" },
          { value: "agent", label: "🤝 Агент" },
        ],
        value: formData.role ?? selectedUser.role,
        onChange: (value) =>
          setFormData({ ...formData, role: value as UserRole }),
      });
    } else if (isDeveloperAdmin) {
      fields.push({
        name: "role",
        label: "Роль",
        type: "select",
        options: [
          { value: "developer_manager", label: "📋 Менеджер компании" },
        ],
        value: "developer_manager",
        onChange: () => {},
        disabled: true,
      });
    }

    if (isAdmin) {
      fields.push({
        name: "companyId",
        label: "Компания",
        type: "select",
        options: [
          { value: "", label: "Без компании" },
          ...companies.map((c) => ({ value: c.id, label: c.name })),
        ],
        value: (formData.companyId ?? selectedUser.companyId) || "",
        onChange: (value) => setFormData({ ...formData, companyId: value }),
      });
    } else if (isDeveloperAdmin && user?.companyId) {
      fields.push({
        name: "companyId",
        label: "Компания",
        type: "select",
        options: [
          { value: user.companyId, label: user.companyName || "Моя компания" },
        ],
        value: user.companyId,
        onChange: () => {},
        disabled: true,
      });
    }

    fields.push(
      {
        name: "isActive",
        label: "Активен",
        type: "select",
        options: [
          { value: "true", label: "✅ Активен" },
          { value: "false", label: "❌ Неактивен" },
        ],
        value:
          formData.isActive !== undefined
            ? String(formData.isActive)
            : String(selectedUser.isActive),
        onChange: (value) =>
          setFormData({ ...formData, isActive: value === "true" }),
      },
      {
        name: "phone",
        label: "Телефон",
        type: "text",
        placeholder: "+7 (999) 123-45-67",
        value: (formData.phone ?? selectedUser.phone) || "",
        onChange: (value) => setFormData({ ...formData, phone: value }),
      },
      {
        name: "position",
        label: "Должность",
        type: "text",
        placeholder: "Старший менеджер",
        value: (formData.position ?? selectedUser.position) || "",
        onChange: (value) => setFormData({ ...formData, position: value }),
        fullWidth: true,
      },
    );

    return fields;
  };

  const filteredUsers = getFilteredUsers();
  const selectedUser = editingId ? users.find((u) => u.id === editingId) : null;

  // ============================================================
  // РЕНДЕР
  // ============================================================

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  if (!hasAccess) {
    return (
      <AdminLayout title="👥 Пользователи">
        <div className="admin-access-denied">
          <p>⛔ У вас нет доступа к этому разделу</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="users-section">
      <AdminLayout title="👥 Пользователи">
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить пользователя",
              onClick: () => {
                setIsCreating(true);
                setFormData({
                  role: "developer_manager",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  firstName: "",
                  lastName: "",
                  phone: "",
                  position: "",
                  companyId: "",
                });
              },
              variant: "primary",
            },
            { label: "🔄 Обновить", onClick: loadData, variant: "secondary" },
          ]}
          totalCount={filteredUsers.length}
        />

        <Tabs
          tabs={getTabs()}
          selectedId={selectedTabId}
          onSelect={setSelectedTabId}
          emptyMessage="😕 Нет активных компаний"
          emptyHint="Создайте компанию в разделе 'Компании'"
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
                <th>📧 Подтвержден</th> {/* 🔥 НОВАЯ КОЛОНКА */}
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{`${user.firstName || ""} ${user.lastName || ""}`}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{getCompanyName(user.companyId)}</td>
                  <td>{user.phone || "-"}</td>
                  <td>{user.position || "-"}</td>
                  <td>
                    <StatusBadge isActive={user.isActive} />
                  </td>
                  <td>
                    {/* 🔥 БЭЙДЖ ПОДТВЕРЖДЕНИЯ EMAIL */}
                    <span
                      className={`email-verified-badge ${user.isEmailVerified ? "verified" : "unverified"}`}
                    >
                      {user.isEmailVerified ? "✅ Да" : "❌ Нет"}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      buttons={[
                        {
                          icon: "✏️",
                          onClick: () => {
                            setEditingId(user.id);
                            setFormData({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              phone: user.phone,
                              position: user.position,
                              role: user.role,
                              companyId: user.companyId,
                              isActive: user.isActive,
                              newPassword: "",
                              confirmPassword: "",
                            });
                          },
                          variant: "primary",
                          title: "Редактировать пользователя",
                        },
                        // 🔥 КНОПКА - повторная отправка подтверждения email
                        {
                          icon: "📧",
                          onClick: () =>
                            handleResendVerification(user.id, user.email),
                          variant: "info",
                          title:
                            "Отправить повторно письмо с подтверждением email",
                        },
                        {
                          icon: "🔑",
                          onClick: () =>
                            handleSendResetLink(user.id, user.email),
                          variant: "warning",
                          title: "Отправить ссылку для сброса пароля",
                        },
                        {
                          icon: "🗑️",
                          onClick: () => handleDeleteUser(user.id),
                          variant: "danger",
                          title: "Удалить пользователя",
                        },
                      ]}
                      size="sm"
                      gap="sm"
                    />
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && !isCreating && (
                <tr>
                  <td
                    colSpan={9} // ← измените с 8 на 9
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    Нет пользователей в этой категории.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Модальные окна остаются без изменений */}
        <AdminModal
          isOpen={isCreating}
          onClose={() => {
            setIsCreating(false);
            setFormData({});
          }}
          onSave={handleCreateUser}
          title="👤 Создание пользователя"
          fields={getCreateFields()}
          isSubmitting={isSubmitting}
          saveLabel="Создать пользователя"
          size="md"
        />

        <AdminModal
          isOpen={editingId !== null && !!selectedUser}
          onClose={() => {
            setEditingId(null);
            setFormData({});
          }}
          onSave={handleUpdateUser}
          title="✏️ Редактирование пользователя"
          fields={selectedUser ? getEditFields(selectedUser) : []}
          isSubmitting={isSubmitting}
          saveLabel="Сохранить изменения"
          size="md"
        />
      </AdminLayout>
    </div>
  );
};
