// frontend/src/pages/Admin/sections/CompaniesSection.tsx

import React, { useState, useEffect } from "react";
import { AdminLayout } from "../AdminLayout";
import { AdminCompany, AdminComplex } from "../types/admin.types";
import "./CompaniesSection.css";
import { useAuthExtended } from "../../../hooks/ui/useAuth";
import adminApi from "../../../services/adminApi";

export const CompaniesSection: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminCompany>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔥 Состояния для управления комплексами
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
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
  const [complexFormData, setComplexFormData] = useState<Partial<AdminComplex>>({});
  
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    website: "",
    adminEmail: "",
    adminPassword: "",
    adminFirstName: "",
    adminLastName: "",
    adminPhone: "",
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
    if (!companyForm.adminEmail.trim()) {
      alert("⚠️ Введите email администратора");
      return;
    }
    if (!companyForm.adminPassword.trim() || companyForm.adminPassword.length < 6) {
      alert("⚠️ Пароль должен быть не менее 6 символов");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await adminApi.createCompanyWithAdmin({
        companyName: companyForm.name.trim(),
        adminEmail: companyForm.adminEmail.trim(),
        adminPassword: companyForm.adminPassword,
        adminFirstName: companyForm.adminFirstName.trim(),
        adminLastName: companyForm.adminLastName.trim(),
        adminPhone: companyForm.adminPhone.trim(),
        companyDescription: companyForm.description.trim(),
        companyPhone: companyForm.phone.trim(),
        companyAddress: companyForm.address.trim(),
        companyWebsite: companyForm.website.trim(),
      });

      console.log("✅ Company created:", result);

      setShowCreateModal(false);
      setCompanyForm({
        name: "",
        description: "",
        phone: "",
        address: "",
        website: "",
        adminEmail: "",
        adminPassword: "",
        adminFirstName: "",
        adminLastName: "",
        adminPhone: "",
      });

      await loadCompanies();
      alert(`✅ Компания "${result.company.name}" создана!`);
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
    if (!confirm(`Удалить компанию "${name}" со всеми пользователями и ЖК?`)) return;
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
    return `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || admin.email;
  };

  const getUsersCount = (users?: any[]) => {
    return users?.length || 0;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "строится": "🏗️ Строится",
      "сдан": "🏢 Сдан",
      "проект": "🏠 Проект",
    };
    return labels[status] || status;
  };

  // ============================================================
  // РЕНДЕР
  // ============================================================

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="companies-section">
      <AdminLayout title="🏢 Компании">
        <div className="admin-toolbar">
          <button
            onClick={() => setShowCreateModal(true)}
            className="admin-btn-primary"
          >
            + Создать компанию
          </button>
          <button onClick={loadCompanies} className="admin-btn-secondary">
            🔄 Обновить
          </button>
          <span
            style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: "auto" }}
          >
            Всего: {companies.length}
          </span>
        </div>

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
                              setFormData({ ...formData, adminId: e.target.value })
                            }
                          />
                        ) : (
                          getAdminName(company.admin)
                        )}
                      </td>
                      <td>{getUsersCount(company.users)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span>{companyComplexes.length}</span>
                          <button
                            onClick={() => {
                              setSelectedCompanyId(company.id);
                              setShowComplexModal(true);
                            }}
                            className="admin-btn-success admin-btn-sm"
                            title="Добавить ЖК"
                          >
                            + ЖК
                          </button>
                          {companyComplexes.length > 0 && (
                            <button
                              onClick={() => setExpandedCompanyId(isExpanded ? null : company.id)}
                              className="admin-btn-secondary admin-btn-sm"
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
                              setFormData({ ...formData, phone: e.target.value })
                            }
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
                              setFormData({ ...formData, website: e.target.value })
                            }
                          />
                        ) : company.website ? (
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
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
                          >
                            <option value="active">✅ Активна</option>
                            <option value="inactive">❌ Неактивна</option>
                          </select>
                        ) : company.isActive ? (
                          "✅"
                        ) : (
                          "❌"
                        )}
                      </td>
                      <td>
                        {editingId === company.id ? (
                          <div className="admin-actions">
                            <button
                              onClick={() => handleUpdateCompany(company.id)}
                              className="admin-btn-success"
                            >
                              💾
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setFormData({});
                              }}
                              className="admin-btn-danger"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="admin-actions">
                            <button
                              onClick={() => {
                                setEditingId(company.id);
                                setFormData(company);
                              }}
                              className="admin-btn-primary"
                              title="Редактировать"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(company.id, company.name)}
                              className="admin-btn-danger"
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* 🔥 Список ЖК компании */}
                    {isExpanded && companyComplexes.length > 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: "0.5rem 1rem" }}>
                          <div className="company-complexes-list">
                            <div style={{ 
                              display: "grid", 
                              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                              gap: "0.5rem",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#6b7280",
                              padding: "0.5rem 0",
                              borderBottom: "1px solid #e5e7eb"
                            }}>
                              <span>Название</span>
                              <span>Статус</span>
                              <span>Банки</span>
                              <span>Активен</span>
                              <span>Типы квартир</span>
                              <span>Действия</span>
                            </div>
                            {companyComplexes.map((complex) => (
                              <div key={complex.id} style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto",
                                gap: "0.5rem",
                                padding: "0.4rem 0",
                                borderBottom: "1px solid #f3f4f6",
                                alignItems: "center",
                                fontSize: "0.85rem"
                              }}>
                                <span>{complex.name}</span>
                                <span>{getStatusLabel(complex.status)}</span>
                                <span>{complex.banks?.join(", ") || "-"}</span>
                                <span>{complex.isActive ? "✅" : "❌"}</span>
                                <span>{complex.apartmentTypes?.length || 0}</span>
                                <div className="admin-actions">
                                  <button
                                    onClick={() => {
                                      setEditingComplexId(complex.id);
                                      setComplexFormData(complex);
                                    }}
                                    className="admin-btn-primary admin-btn-xs"
                                    title="Редактировать"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComplex(complex.id, complex.name)}
                                    className="admin-btn-danger admin-btn-xs"
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
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    Нет компаний. Нажмите "Создать компанию".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ============================================================
            МОДАЛЬНОЕ ОКНО СОЗДАНИЯ КОМПАНИИ
            ============================================================ */}
        {showCreateModal && (
          <div
            className="modal-overlay"
            onClick={() => !isSubmitting && setShowCreateModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "600px" }}
            >
              <div className="modal-header">
                <h2>🏢 Создание компании</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                  {/* Информация о компании */}
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", color: "#374151" }}>
                    📋 Информация о компании
                  </h3>

                  <div className="form-group">
                    <label className="form-label required">Название компании</label>
                    <input
                      className="form-input"
                      placeholder="Например: Строй-Групп"
                      value={companyForm.name}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, name: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Краткое описание компании..."
                      value={companyForm.description}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, description: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="form-group">
                      <label className="form-label">Телефон компании</label>
                      <input
                        className="form-input"
                        placeholder="+7 (999) 123-45-67"
                        value={companyForm.phone}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, phone: e.target.value })
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Сайт компании</label>
                      <input
                        className="form-input"
                        placeholder="https://company.ru"
                        value={companyForm.website}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, website: e.target.value })
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Адрес</label>
                    <input
                      className="form-input"
                      placeholder="г. Москва, ул. Примерная, д. 1"
                      value={companyForm.address}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, address: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Информация об администраторе */}
                  <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", color: "#374151" }}>
                    👤 Администратор компании
                  </h3>

                  <div className="form-group">
                    <label className="form-label required">Email администратора</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="admin@company.ru"
                      value={companyForm.adminEmail}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, adminEmail: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Пароль</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={companyForm.adminPassword}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, adminPassword: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="form-group">
                      <label className="form-label">Имя</label>
                      <input
                        className="form-input"
                        placeholder="Иван"
                        value={companyForm.adminFirstName}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, adminFirstName: e.target.value })
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Фамилия</label>
                      <input
                        className="form-input"
                        placeholder="Петров"
                        value={companyForm.adminLastName}
                        onChange={(e) =>
                          setCompanyForm({ ...companyForm, adminLastName: e.target.value })
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Телефон администратора</label>
                    <input
                      className="form-input"
                      placeholder="+7 (999) 123-45-67"
                      value={companyForm.adminPhone}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, adminPhone: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="admin-btn-secondary"
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateCompany}
                  className="admin-btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "⏳ Создание..." : "🏢 Создать компанию"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            🔥 МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ЖК
            ============================================================ */}
        {showComplexModal && (
          <div
            className="modal-overlay"
            onClick={() => !isSubmitting && setShowComplexModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "500px" }}
            >
              <div className="modal-header">
                <h2>🏗️ Создание ЖК</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowComplexModal(false)}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="form-group">
                    <label className="form-label required">Название ЖК</label>
                    <input
                      className="form-input"
                      placeholder="Например: ЖК Новая Москва"
                      value={complexForm.name}
                      onChange={(e) =>
                        setComplexForm({ ...complexForm, name: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Статус</label>
                    <select
                      className="form-select"
                      value={complexForm.status}
                      onChange={(e) =>
                        setComplexForm({ ...complexForm, status: e.target.value as any })
                      }
                      disabled={isSubmitting}
                    >
                      <option value="строится">🏗️ Строится</option>
                      <option value="сдан">🏢 Сдан</option>
                      <option value="проект">🏠 Проект</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Описание</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Краткое описание ЖК..."
                      value={complexForm.description}
                      onChange={(e) =>
                        setComplexForm({ ...complexForm, description: e.target.value })
                      }
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Активен</label>
                    <select
                      className="form-select"
                      value={complexForm.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        setComplexForm({ ...complexForm, isActive: e.target.value === "active" })
                      }
                      disabled={isSubmitting}
                    >
                      <option value="active">✅ Активен</option>
                      <option value="inactive">❌ Неактивен</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  onClick={() => setShowComplexModal(false)}
                  className="admin-btn-secondary"
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateComplex}
                  className="admin-btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "⏳ Создание..." : "🏗️ Создать ЖК"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </div>
  );
};