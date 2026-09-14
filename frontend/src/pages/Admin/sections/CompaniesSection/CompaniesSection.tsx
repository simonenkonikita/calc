// frontend/src/pages/Admin/sections/CompaniesSection.tsx

import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout/AdminLayout";
import { AdminCompany, AdminComplex } from "../../types/admin.types";
import "./CompaniesSection.css";
import { useAuthExtended } from "../../../../hooks/ui/useAuth";
import adminApi from "../../../../services/adminApi";
import AdminToolbar from "../../components/AdminToolbar/AdminToolbar";
import AdminModal, {
  AdminModalField,
} from "../../components/AdminModal/AdminModal";
import ActionButtons from "../../components/ActionButtons/ActionButtons";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

export const CompaniesSection: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для модальных окон
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AdminCompany | null>(
    null,
  );

  const [showComplexModal, setShowComplexModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [complexForm, setComplexForm] = useState({
    name: "",
    status: "строится",
    description: "",
    banks: [] as string[],
    paymentTerms: [] as string[],
    promotions: [] as string[],
    specialOffers: [] as string[],
    materialsLink: "",
    isActive: true,
  });
  const [editingComplexId, setEditingComplexId] = useState<string | null>(null);
  const [complexFormData, setComplexFormData] = useState<Partial<AdminComplex>>(
    {},
  );

  // Формы
  const [companyForm, setCompanyForm] = useState({
    name: "",
    phone: "",
    address: "",
    website: "",
    isActive: true,
  });

  const [editForm, setEditForm] = useState<Partial<AdminCompany>>({
    name: "",
    phone: "",
    address: "",
    website: "",
    isActive: true,
  });

  const { isAdmin } = useAuthExtended();

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, complexesData, usersData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getComplexes(),
        adminApi.getUsers(),
      ]);

      console.log("📊 Companies data:", companiesData);

      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setComplexes(Array.isArray(complexesData) ? complexesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // УПРАВЛЕНИЕ КОМПАНИЯМИ
  // ============================================================

  const openCreateModal = () => {
    setCompanyForm({
      name: "",
      phone: "",
      address: "",
      website: "",
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (company: AdminCompany) => {
    setEditingCompany(company);
    setEditForm({
      name: company.name || "",
      phone: company.phone || "",
      address: company.address || "",
      website: company.website || "",
      isActive: company.isActive !== undefined ? company.isActive : true,
    });
    setShowEditModal(true);
  };

  const handleCreateCompany = async () => {
    if (!companyForm.name.trim()) {
      alert("⚠️ Введите название компании");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await adminApi.createCompany({
        name: companyForm.name.trim(),
        phone: companyForm.phone?.trim() || "",
        address: companyForm.address?.trim() || "",
        website: companyForm.website?.trim() || "",
      });

      if (!result || !result.name) {
        console.error("❌ Invalid response structure:", result);
        alert("❌ Ошибка: сервер вернул некорректный ответ");
        return;
      }

      setShowCreateModal(false);
      setCompanyForm({
        name: "",
        phone: "",
        address: "",
        website: "",
        isActive: true,
      });

      await loadCompanies();
      alert(`✅ Компания "${result.name}" создана!`);
    } catch (error: any) {
      console.error("❌ Error creating company:", error);
      alert(`❌ ${error.message || "Ошибка создания компании"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;

    if (!editForm.name?.trim()) {
      alert("⚠️ Введите название компании");
      return;
    }

    try {
      setIsSubmitting(true);

      await adminApi.updateCompany(editingCompany.id, {
        name: editForm.name.trim(),
        phone: editForm.phone?.trim() || "",
        address: editForm.address?.trim() || "",
        website: editForm.website?.trim() || "",
        isActive: editForm.isActive,
      });

      setShowEditModal(false);
      setEditingCompany(null);
      setEditForm({});

      await loadCompanies();
      alert(`✅ Компания "${editForm.name}" обновлена!`);
    } catch (error: any) {
      console.error("❌ Error updating company:", error);
      alert(`❌ ${error.message || "Ошибка обновления компании"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`Удалить компанию "${name}" со всеми пользователями и ЖК?`))
      return;
    try {
      await adminApi.deleteCompany(id);
      await loadData();
      alert(`✅ Компания "${name}" удалена!`);
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка удаления компании"}`);
    }
  };

  // ============================================================
  // УПРАВЛЕНИЕ КОМПЛЕКСАМИ
  // ============================================================

  const handleCreateComplex = async () => {
    if (!complexForm.name.trim()) {
      alert("⚠️ Введите название ЖК");
      return;
    }

    try {
      setIsSubmitting(true);

      const newComplex = await adminApi.createComplex({
        name: complexForm.name.trim(),
        status: complexForm.status,
        description: complexForm.description,
        banks: complexForm.banks,
        paymentTerms: complexForm.paymentTerms,
        promotions: complexForm.promotions,
        specialOffers: complexForm.specialOffers,
        materialsLink: complexForm.materialsLink,
        isActive: complexForm.isActive,
        companyId: selectedCompanyId,
      });

      setShowComplexModal(false);
      setComplexForm({
        name: "",
        status: "строится",
        description: "",
        banks: [],
        paymentTerms: [],
        promotions: [],
        specialOffers: [],
        materialsLink: "",
        isActive: true,
      });
      setSelectedCompanyId("");

      await loadData();
      alert(`✅ ЖК "${newComplex.name}" создан!`);
    } catch (error: any) {
      console.error("❌ Error creating complex:", error);
      alert(`❌ ${error.message || "Ошибка создания ЖК"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComplex = async (id: string) => {
    try {
      await adminApi.updateComplex(id, complexFormData);
      setEditingComplexId(null);
      setComplexFormData({});
      await loadData();
      alert("✅ ЖК обновлен!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка обновления ЖК"}`);
    }
  };

  const handleDeleteComplex = async (id: string, name: string) => {
    if (!confirm(`Удалить ЖК "${name}" со всеми типами квартир?`)) return;
    try {
      await adminApi.deleteComplex(id);
      await loadData();
      alert(`✅ ЖК "${name}" удален!`);
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка удаления ЖК"}`);
    }
  };

  const getCompanyComplexes = (companyId: string): AdminComplex[] => {
    return complexes.filter((c) => c.companyId === companyId);
  };

  const getCompanyUsers = (companyId: string): any[] => {
    return users.filter((u) => u.companyId === companyId);
  };

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ
  // ============================================================

  const getAdminName = (admin?: any) => {
    if (!admin) return "-";
    return (
      `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || admin.email
    );
  };

  const getUsersCount = (users?: any[]) => {
    return users?.length || 0;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      строится: "🏗️ Строится",
      сдан: "🏢 Сдан",
      проект: "🏠 Проект",
    };
    return labels[status] || status;
  };

  const getUserRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Администратор",
      developer_admin: "Админ компании",
      developer_manager: "Менеджер",
      agent: "Агент",
    };
    return labels[role] || role;
  };

  // 🔥 Функция для получения стиля бейджа роли
  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      admin: "role-admin",
      developer_admin: "role-developer-admin",
      developer_manager: "role-developer-manager",
      agent: "role-agent",
    };
    return classes[role] || "role-default";
  };

  // ============================================================
  // ПОЛЯ ДЛЯ МОДАЛЬНЫХ ОКОН
  // ============================================================

  const companyFields: AdminModalField[] = [
    {
      name: "name",
      label: "Название компании",
      type: "text",
      placeholder: "Например: Строй-Групп",
      required: true,
      value: companyForm.name,
      onChange: (value) => setCompanyForm({ ...companyForm, name: value }),
      fullWidth: true,
    },
    {
      name: "phone",
      label: "Телефон",
      type: "text",
      placeholder: "+7 (999) 123-45-67",
      value: companyForm.phone,
      onChange: (value) => setCompanyForm({ ...companyForm, phone: value }),
    },
    {
      name: "website",
      label: "Сайт",
      type: "text",
      placeholder: "https://company.ru",
      value: companyForm.website,
      onChange: (value) => setCompanyForm({ ...companyForm, website: value }),
    },
    {
      name: "address",
      label: "Адрес",
      type: "text",
      placeholder: "г. Москва, ул. Примерная, д. 1",
      value: companyForm.address,
      onChange: (value) => setCompanyForm({ ...companyForm, address: value }),
      fullWidth: true,
    },
    {
      name: "isActive",
      label: "Активна",
      type: "select",
      options: [
        { value: "true", label: "✅ Активна" },
        { value: "false", label: "❌ Неактивна" },
      ],
      value: companyForm.isActive ? "true" : "false",
      onChange: (value) =>
        setCompanyForm({ ...companyForm, isActive: value === "true" }),
    },
  ];

  const editCompanyFields = (): AdminModalField[] => {
    if (!editingCompany) return [];

    return [
      {
        name: "name",
        label: "Название компании",
        type: "text",
        placeholder: "Например: Строй-Групп",
        required: true,
        value: editForm.name || "",
        onChange: (value) => setEditForm({ ...editForm, name: value }),
        fullWidth: true,
      },
      {
        name: "phone",
        label: "Телефон",
        type: "text",
        placeholder: "+7 (999) 123-45-67",
        value: editForm.phone || "",
        onChange: (value) => setEditForm({ ...editForm, phone: value }),
      },
      {
        name: "website",
        label: "Сайт",
        type: "text",
        placeholder: "https://company.ru",
        value: editForm.website || "",
        onChange: (value) => setEditForm({ ...editForm, website: value }),
      },
      {
        name: "address",
        label: "Адрес",
        type: "text",
        placeholder: "г. Москва, ул. Примерная, д. 1",
        value: editForm.address || "",
        onChange: (value) => setEditForm({ ...editForm, address: value }),
        fullWidth: true,
      },
      {
        name: "isActive",
        label: "Активна",
        type: "select",
        options: [
          { value: "true", label: "✅ Активна" },
          { value: "false", label: "❌ Неактивна" },
        ],
        value: editForm.isActive ? "true" : "false",
        onChange: (value) =>
          setEditForm({ ...editForm, isActive: value === "true" }),
      },
    ];
  };

  const complexFields: AdminModalField[] = [
    {
      name: "name",
      label: "Название ЖК",
      type: "text",
      placeholder: "Например: ЖК Новая Москва",
      required: true,
      value: complexForm.name,
      onChange: (value) => setComplexForm({ ...complexForm, name: value }),
      fullWidth: true,
    },
    {
      name: "status",
      label: "Статус",
      type: "select",
      options: [
        { value: "строится", label: "🏗️ Строится" },
        { value: "сдан", label: "🏢 Сдан" },
        { value: "проект", label: "🏠 Проект" },
      ],
      required: true,
      value: complexForm.status,
      onChange: (value) => setComplexForm({ ...complexForm, status: value }),
    },
    {
      name: "description",
      label: "Описание",
      type: "textarea",
      placeholder: "Краткое описание ЖК...",
      value: complexForm.description,
      onChange: (value) =>
        setComplexForm({ ...complexForm, description: value }),
      rows: 2,
      fullWidth: true,
    },
    {
      name: "isActive",
      label: "Активен",
      type: "select",
      options: [
        { value: "true", label: "✅ Активен" },
        { value: "false", label: "❌ Неактивен" },
      ],
      value: complexForm.isActive ? "true" : "false",
      onChange: (value) =>
        setComplexForm({ ...complexForm, isActive: value === "true" }),
    },
  ];

  // ============================================================
  // РЕНДЕР
  // ============================================================

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="companies-section">
      <AdminLayout title="🏢 Компании">
        <AdminToolbar
          buttons={[
            {
              label: "+ Создать компанию",
              onClick: openCreateModal,
              variant: "primary",
            },
            {
              label: "🔄 Обновить",
              onClick: loadCompanies,
              variant: "secondary",
            },
          ]}
          totalCount={companies.length}
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Пользователей</th>
                <th>ЖК</th>
                <th>Телефон</th>
                <th>Сайт</th>
                <th>Активна</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const companyComplexes = getCompanyComplexes(company.id);

                return (
                  <React.Fragment key={company.id}>
                    <tr>
                      <td>
                        <strong>{company.name}</strong>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          <span>{getUsersCount(company.users)}</span>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          <span>{companyComplexes.length}</span>
                        </div>
                      </td>
                      <td>{company.phone || "-"}</td>
                      <td>
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {company.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <StatusBadge
                          isActive={company.isActive}
                          activeText="Активна"
                        />
                      </td>
                      <td>
                        <ActionButtons
                          buttons={[
                            {
                              icon: "✏️",
                              onClick: () => openEditModal(company),
                              variant: "primary",
                              title: "Редактировать",
                            },
                            {
                              icon: "🗑️",
                              onClick: () =>
                                handleDeleteCompany(company.id, company.name),
                              variant: "danger",
                              title: "Удалить",
                            },
                          ]}
                          size="sm"
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    Нет компаний. Нажмите "Создать компанию".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ КОМПАНИИ */}
        <AdminModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCompany}
          title="🏢 Создание компании"
          fields={companyFields}
          isSubmitting={isSubmitting}
          saveLabel="Создать компанию"
          cancelLabel="Отмена"
          size="lg"
        />

        {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ КОМПАНИИ */}
        <AdminModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCompany(null);
            setEditForm({});
          }}
          onSave={handleUpdateCompany}
          title={`✏️ Редактирование: ${editingCompany?.name || ""}`}
          fields={editCompanyFields()}
          isSubmitting={isSubmitting}
          saveLabel="Сохранить изменения"
          cancelLabel="Отмена"
          size="lg"
        />

        {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ЖК */}
        <AdminModal
          isOpen={showComplexModal}
          onClose={() => setShowComplexModal(false)}
          onSave={handleCreateComplex}
          title="🏗️ Создание ЖК"
          fields={complexFields}
          isSubmitting={isSubmitting}
          saveLabel="Создать ЖК"
          cancelLabel="Отмена"
          size="md"
        />
      </AdminLayout>
    </div>
  );
};
