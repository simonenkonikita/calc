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
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminCompany>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Состояния для управления комплексами
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(
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

  const [companyForm, setCompanyForm] = useState({
    name: "",
    phone: "",
    address: "",
    website: "",
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
      const [companiesData, complexesData] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getComplexes(),
      ]);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setComplexes(Array.isArray(complexesData) ? complexesData : []);
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

      console.log("✅ Company created:", result);
      console.log("✅ Company name:", result?.name);

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

  const handleUpdateCompany = async (id: string) => {
    try {
      await adminApi.updateCompany(id, formData);
      setEditingId(null);
      setFormData({});
      await loadCompanies();
      alert("✅ Компания обновлена!");
    } catch (error: any) {
      alert(`❌ ${error.message || "Ошибка обновления"}`);
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
  // 🔥 УПРАВЛЕНИЕ КОМПЛЕКСАМИ
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

  // ============================================================
  // 🔥 ПОЛЯ ДЛЯ МОДАЛЬНЫХ ОКОН
  // ============================================================

  // Поля для создания компании
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
  ];

  // Поля для создания ЖК
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
              onClick: () => setShowCreateModal(true),
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
                <th>Администратор</th>
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
                const isExpanded = expandedCompanyId === company.id;

                return (
                  <React.Fragment key={company.id}>
                    <tr>
                      <td>
                        {editingId === company.id ? (
                          <input
                            value={formData.name || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="admin-input admin-input-sm"
                          />
                        ) : (
                          <strong>{company.name}</strong>
                        )}
                      </td>
                      <td>
                        {editingId === company.id ? (
                          <input
                            value={formData.adminId || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                adminId: e.target.value,
                              })
                            }
                            className="admin-input admin-input-sm"
                          />
                        ) : (
                          getAdminName(company.admin)
                        )}
                      </td>
                      <td>{getUsersCount(company.users)}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          <span>{companyComplexes.length}</span>
                          <button
                            onClick={() => {
                              setSelectedCompanyId(company.id);
                              setShowComplexModal(true);
                            }}
                            className="admin-btn admin-btn-success admin-btn-sm"
                            title="Добавить ЖК"
                          >
                            + ЖК
                          </button>
                          {companyComplexes.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedCompanyId(
                                  isExpanded ? null : company.id,
                                )
                              }
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              {isExpanded ? "🔼" : "🔽"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        {editingId === company.id ? (
                          <input
                            value={formData.phone || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="admin-input admin-input-sm"
                          />
                        ) : (
                          company.phone || "-"
                        )}
                      </td>
                      <td>
                        {editingId === company.id ? (
                          <input
                            value={formData.website || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                website: e.target.value,
                              })
                            }
                            className="admin-input admin-input-sm"
                          />
                        ) : company.website ? (
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
                        {editingId === company.id ? (
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
                            <option value="active">✅ Активна</option>
                            <option value="inactive">❌ Неактивна</option>
                          </select>
                        ) : (
                          <StatusBadge
                            isActive={company.isActive}
                            activeText="Активна"
                          />
                        )}
                      </td>
                      <td>
                        {editingId === company.id ? (
                          <ActionButtons
                            buttons={[
                              {
                                icon: "💾",
                                onClick: () => handleUpdateCompany(company.id),
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
                                  setEditingId(company.id);
                                  setFormData(company);
                                },
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
                        )}
                      </td>
                    </tr>

                    {/* 🔥 Список ЖК компании */}
                    {isExpanded && companyComplexes.length > 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: "0.5rem 1rem" }}>
                          <div className="company-complexes-list">
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                                gap: "0.5rem",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                padding: "0.5rem 0",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              <span>Название</span>
                              <span>Статус</span>
                              <span>Банки</span>
                              <span>Активен</span>
                              <span>Типы квартир</span>
                              <span>Действия</span>
                            </div>
                            {companyComplexes.map((complex) => (
                              <div
                                key={complex.id}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "1fr 1fr 1fr 1fr 1fr auto",
                                  gap: "0.5rem",
                                  padding: "0.4rem 0",
                                  borderBottom: "1px solid #f3f4f6",
                                  alignItems: "center",
                                  fontSize: "0.85rem",
                                }}
                              >
                                <span>{complex.name}</span>
                                <span>{getStatusLabel(complex.status)}</span>
                                <span>{complex.banks?.join(", ") || "-"}</span>
                                <span>{complex.isActive ? "✅" : "❌"}</span>
                                <span>
                                  {complex.apartmentTypes?.length || 0}
                                </span>
                                <div className="admin-actions">
                                  <button
                                    onClick={() => {
                                      setEditingComplexId(complex.id);
                                      setComplexFormData(complex);
                                    }}
                                    className="admin-btn admin-btn-primary admin-btn-xs"
                                    title="Редактировать"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComplex(
                                        complex.id,
                                        complex.name,
                                      )
                                    }
                                    className="admin-btn admin-btn-danger admin-btn-xs"
                                    title="Удалить"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
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

        {/* 🔥 МОДАЛЬНОЕ ОКНО СОЗДАНИЯ КОМПАНИИ */}
        <AdminModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCompany}
          title="🏢 Создание компании"
          fields={companyFields}
          isSubmitting={isSubmitting}
          saveLabel="Создать компанию"
          size="lg"
        />

        {/* 🔥 МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ЖК */}
        <AdminModal
          isOpen={showComplexModal}
          onClose={() => setShowComplexModal(false)}
          onSave={handleCreateComplex}
          title="🏗️ Создание ЖК"
          fields={complexFields}
          isSubmitting={isSubmitting}
          saveLabel="Создать ЖК"
          size="md"
        />
      </AdminLayout>
    </div>
  );
};
