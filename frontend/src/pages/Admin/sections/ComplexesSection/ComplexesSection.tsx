// frontend/src/pages/Admin/sections/ComplexesSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../../services/adminApi";
import {
  AdminComplex,
  AdminBank,
  AdminCompany,
  CreateComplexDTO,
  UpdateComplexDTO,
} from "../../types/admin.types";
import { AdminLayout } from "../../components/AdminLayout/AdminLayout";
import AdminToolbar from "../../components/AdminToolbar/AdminToolbar";
import "./ComplexesSection.css";
import BankSelector from "../../components/BankSelector/BankSelector";
import ActionButtons from "../../components/ActionButtons/ActionButtons";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import Tabs from "../../components/Tabs/Tabs";
import AdminModal from "../../components/AdminModal/AdminModal";

type ApartmentTypeForm = {
  id?: string;
  type: string;
  pricePerSquareMeter: number;
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  isActive: boolean;
};

type ComplexFormData = {
  name: string;
  status: "строится" | "сдан" | "проект";
  description: string;
  banks: string[];
  paymentTerms: string[];
  promotions: string[]; // 🔥 ДОБАВЛЯЕМ
  specialOffers: string[]; // 🔥 ДОБАВЛЯЕМ
  materialsLink: string;
  isActive: boolean;
  companyId: string;
  apartmentTypes: ApartmentTypeForm[];
};

export const ComplexesSection: React.FC = () => {
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComplex, setExpandedComplex] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Состояния для модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComplex, setEditingComplex] = useState<AdminComplex | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Состояния для новых значений
  const [newPaymentTerm, setNewPaymentTerm] = useState("");
  const [newPromotion, setNewPromotion] = useState("");
  const [newSpecialOffer, setNewSpecialOffer] = useState("");

  // Форма
  const [formData, setFormData] = useState<ComplexFormData>({
    name: "",
    status: "строится",
    description: "",
    banks: [],
    paymentTerms: [],
    promotions: [],
    specialOffers: [],
    materialsLink: "",
    isActive: true,
    companyId: "",
    apartmentTypes: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [complexesData, banksData, companiesData] = await Promise.all([
        adminApi.getComplexes(),
        adminApi.getBanks(),
        adminApi.getCompanies(),
      ]);
      setComplexes(Array.isArray(complexesData) ? complexesData : []);
      setBanks(Array.isArray(banksData) ? banksData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);

      if (companiesData.length > 0 && !selectedCompanyId) {
        const firstActiveCompany = companiesData.find((c: any) => c.isActive);
        setSelectedCompanyId(firstActiveCompany?.id || companiesData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const loadComplexes = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getComplexes();
      setComplexes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading complexes:", error);
      alert("Ошибка при загрузке ЖК");
    } finally {
      setLoading(false);
    }
  };

  const getComplexesByCompany = (companyId: string) => {
    return complexes.filter((c) => c.companyId === companyId);
  };

  const companyTabs = companies.map((company) => ({
    id: company.id,
    label: company.name,
    icon: "🏢",
    count: getComplexesByCompany(company.id).length,
    isActive: company.isActive,
  }));

  const filteredComplexes = getComplexesByCompany(selectedCompanyId);

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ УСЛОВИЯМИ ОПЛАТЫ
  // ============================================================

  const addPaymentTerm = () => {
    if (!newPaymentTerm.trim()) return;
    if (formData.paymentTerms.includes(newPaymentTerm.trim())) {
      alert("Такое условие оплаты уже добавлено");
      return;
    }
    setFormData({
      ...formData,
      paymentTerms: [...formData.paymentTerms, newPaymentTerm.trim()],
    });
    setNewPaymentTerm("");
  };

  const removePaymentTerm = (termToRemove: string) => {
    setFormData({
      ...formData,
      paymentTerms: formData.paymentTerms.filter((t) => t !== termToRemove),
    });
  };

  const handlePaymentTermKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPaymentTerm();
    }
  };

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ АКЦИЯМИ
  // ============================================================

  const addPromotion = () => {
    if (!newPromotion.trim()) return;
    if (formData.promotions.includes(newPromotion.trim())) {
      alert("Такая акция уже добавлена");
      return;
    }
    setFormData({
      ...formData,
      promotions: [...formData.promotions, newPromotion.trim()],
    });
    setNewPromotion("");
  };

  const removePromotion = (promotionToRemove: string) => {
    setFormData({
      ...formData,
      promotions: formData.promotions.filter((p) => p !== promotionToRemove),
    });
  };

  const handlePromotionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPromotion();
    }
  };

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ СПЕЦПРЕДЛОЖЕНИЯМИ
  // ============================================================

  const addSpecialOffer = () => {
    if (!newSpecialOffer.trim()) return;
    if (formData.specialOffers.includes(newSpecialOffer.trim())) {
      alert("Такое спецпредложение уже добавлено");
      return;
    }
    setFormData({
      ...formData,
      specialOffers: [...formData.specialOffers, newSpecialOffer.trim()],
    });
    setNewSpecialOffer("");
  };

  const removeSpecialOffer = (offerToRemove: string) => {
    setFormData({
      ...formData,
      specialOffers: formData.specialOffers.filter((o) => o !== offerToRemove),
    });
  };

  const handleSpecialOfferKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSpecialOffer();
    }
  };

  // ============================================================
  // УПРАВЛЕНИЕ ТИПАМИ КВАРТИР
  // ============================================================

  const addApartmentType = () => {
    setFormData({
      ...formData,
      apartmentTypes: [
        ...formData.apartmentTypes,
        {
          type: "",
          pricePerSquareMeter: 0,
          surcharges: {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          isActive: true,
        },
      ],
    });
  };

  const removeApartmentType = (index: number) => {
    if (formData.apartmentTypes.length <= 1) {
      alert("Должен быть хотя бы один тип квартиры");
      return;
    }
    const newTypes = formData.apartmentTypes.filter((_, i) => i !== index);
    setFormData({ ...formData, apartmentTypes: newTypes });
  };

  const updateApartmentType = (index: number, field: string, value: any) => {
    const updatedTypes = [...formData.apartmentTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    setFormData({ ...formData, apartmentTypes: updatedTypes });
  };

  // ============================================================
  // МОДАЛЬНОЕ ОКНО
  // ============================================================

  const openCreateModal = () => {
    setEditingComplex(null);
    setNewPaymentTerm("");
    setNewPromotion("");
    setNewSpecialOffer("");
    setFormData({
      name: "",
      status: "строится",
      description: "",
      banks: [],
      paymentTerms: [],
      promotions: [],
      specialOffers: [],
      materialsLink: "",
      isActive: true,
      companyId: selectedCompanyId || "",
      apartmentTypes: [
        {
          type: "",
          pricePerSquareMeter: 0,
          surcharges: {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          isActive: true,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (complex: AdminComplex) => {
    setEditingComplex(complex);
    setNewPaymentTerm("");
    setNewPromotion("");
    setNewSpecialOffer("");
    setFormData({
      name: complex.name,
      status: complex.status,
      description: complex.description || "",
      banks: complex.banks || [],
      paymentTerms: complex.paymentTerms || [],
      promotions: complex.promotions || [],
      specialOffers: complex.specialOffers || [],
      materialsLink: complex.materialsLink || "",
      isActive: complex.isActive,
      companyId: complex.companyId || "",
      apartmentTypes:
        complex.apartmentTypes?.map((at) => ({
          id: at.id,
          type: at.type,
          pricePerSquareMeter: at.pricePerSquareMeter,
          surcharges: at.surcharges || {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          isActive: at.isActive,
        })) || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComplex(null);
    setNewPaymentTerm("");
    setNewPromotion("");
    setNewSpecialOffer("");
  };

  const handleSave = async () => {
    // Валидация
    if (!formData.name) {
      alert("Введите название ЖК");
      return;
    }
    if (!formData.status) {
      alert("Выберите статус ЖК");
      return;
    }
    if (!formData.companyId) {
      alert("Выберите компанию");
      return;
    }

    const types = formData.apartmentTypes || [];
    if (types.length === 0) {
      alert("Добавьте хотя бы один тип квартиры");
      return;
    }

    for (const type of types) {
      if (!type.type) {
        alert("Заполните название типа квартиры");
        return;
      }
      if (!type.pricePerSquareMeter || type.pricePerSquareMeter <= 0) {
        alert(
          `Укажите корректную цену для типа "${type.type || "без названия"}"`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingComplex) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } catch (error) {
      console.error("Error saving complex:", error);
      alert("❌ Ошибка при сохранении ЖК");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    const createData: CreateComplexDTO = {
      name: formData.name,
      status: formData.status,
      description: formData.description,
      banks: formData.banks,
      paymentTerms: formData.paymentTerms,
      promotions: formData.promotions, // 🔥 ДОБАВЛЯЕМ
      specialOffers: formData.specialOffers, // 🔥 ДОБАВЛЯЕМ
      materialsLink: formData.materialsLink,
      isActive: formData.isActive,
      companyId: formData.companyId,
      apartmentTypes: formData.apartmentTypes.map((type) => ({
        type: type.type,
        pricePerSquareMeter: type.pricePerSquareMeter,
        surcharges: type.surcharges,
        isActive: type.isActive,
      })),
    };

    console.log("📊 Creating complex:", createData);

    const newComplex = await adminApi.createComplex(createData);
    setComplexes([...complexes, newComplex]);
    closeModal();
    alert("✅ ЖК успешно создан!");
  };

  const handleUpdate = async () => {
    if (!editingComplex) return;

    const updateData: UpdateComplexDTO = {
      name: formData.name,
      status: formData.status,
      description: formData.description,
      banks: formData.banks,
      paymentTerms: formData.paymentTerms,
      promotions: formData.promotions, // 🔥 ДОБАВЛЯЕМ
      specialOffers: formData.specialOffers, // 🔥 ДОБАВЛЯЕМ
      materialsLink: formData.materialsLink,
      isActive: formData.isActive,
      companyId: formData.companyId,
    };

    console.log("📊 Updating complex:", updateData);

    await adminApi.updateComplex(editingComplex.id, updateData);

    // Обновляем типы квартир
    const existingTypes = await adminApi.getApartmentTypes(editingComplex.id);
    const formTypes = formData.apartmentTypes;

    for (const existingType of existingTypes) {
      const stillExists = formTypes.some((t) => t.id === existingType.id);
      if (!stillExists) {
        await adminApi.deleteApartmentType(existingType.id);
      }
    }

    for (const type of formTypes) {
      if (type.id) {
        await adminApi.updateApartmentType(type.id, {
          type: type.type,
          pricePerSquareMeter: type.pricePerSquareMeter,
          surcharges: type.surcharges,
          isActive: type.isActive,
        });
      } else {
        await adminApi.createApartmentType(editingComplex.id, {
          type: type.type,
          pricePerSquareMeter: type.pricePerSquareMeter,
          surcharges: type.surcharges,
          isActive: type.isActive,
        });
      }
    }

    const freshComplexes = await adminApi.getComplexes();
    setComplexes(freshComplexes);
    closeModal();
    alert("✅ ЖК успешно обновлен!");
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(`Удалить ЖК "${name}"? Это удалит все связанные типы квартир!`)
    )
      return;
    try {
      await adminApi.deleteComplex(id);
      setComplexes(complexes.filter((c) => c.id !== id));
      alert("✅ ЖК удален!");
    } catch (error) {
      console.error("Error deleting complex:", error);
      alert("❌ Ошибка при удалении ЖК");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedComplex(expandedComplex === id ? null : id);
  };

  // ============================================================
  // ПОЛЯ ДЛЯ МОДАЛЬНОГО ОКНА
  // ============================================================

  const getComplexFields = () => {
    const isEdit = !!editingComplex;

    return [
      {
        name: "name",
        label: "Название ЖК",
        type: "text" as const,
        placeholder: "Например: ЖК Новая Москва",
        required: true,
        value: formData.name || "",
        onChange: (value: string) => setFormData({ ...formData, name: value }),
        fullWidth: true,
      },
      {
        name: "status",
        label: "Статус",
        type: "select" as const,
        options: [
          { value: "строится", label: "🏗️ Строится" },
          { value: "сдан", label: "🏢 Сдан" },
          { value: "проект", label: "🏠 Проект" },
        ],
        required: true,
        value: formData.status || "строится",
        onChange: (value: string) =>
          setFormData({ ...formData, status: value as any }),
      },
      {
        name: "companyId",
        label: "Компания",
        type: "select" as const,
        options: companies.map((c) => ({
          value: c.id,
          label: c.name,
        })),
        required: true,
        value: formData.companyId || "",
        onChange: (value: string) =>
          setFormData({ ...formData, companyId: value }),
        disabled: isEdit && !formData.companyId,
      },
      {
        name: "description",
        label: "Описание",
        type: "textarea" as const,
        placeholder: "Краткое описание ЖК...",
        value: formData.description || "",
        onChange: (value: string) =>
          setFormData({ ...formData, description: value }),
        rows: 2,
        fullWidth: true,
      },
      {
        name: "materialsLink",
        label: "Ссылка на материалы",
        type: "text" as const,
        placeholder: "https://example.com/materials",
        value: formData.materialsLink || "",
        onChange: (value: string) =>
          setFormData({ ...formData, materialsLink: value }),
        fullWidth: true,
      },
      {
        name: "isActive",
        label: "Активен",
        type: "select" as const,
        options: [
          { value: "active", label: "✅ Активен" },
          { value: "inactive", label: "❌ Неактивен" },
        ],
        value: formData.isActive ? "active" : "inactive",
        onChange: (value: string) =>
          setFormData({ ...formData, isActive: value === "active" }),
      },
    ];
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="complexes-section">
      <AdminLayout title="🏗️ Жилые комплексы">
        <AdminToolbar
          buttons={[
            {
              label: "+ Добавить ЖК",
              onClick: openCreateModal,
              variant: "primary",
            },
            {
              label: "🔄 Обновить",
              onClick: loadComplexes,
              variant: "secondary",
            },
          ]}
          totalCount={filteredComplexes.length}
        />

        <Tabs
          tabs={companyTabs}
          selectedId={selectedCompanyId}
          onSelect={setSelectedCompanyId}
          emptyMessage="😕 Нет активных компаний"
          emptyHint="Создайте компанию в разделе 'Компании'"
        />

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Статус</th>
                <th>Банки</th>
                <th>Условия оплаты</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplexes.map((complex) => (
                <React.Fragment key={complex.id}>
                  <tr>
                    <td>
                      <strong>{complex.name}</strong>
                    </td>
                    <td>
                      <span className="complex-status">
                        {complex.status === "строится" && "🏗️ Строится"}
                        {complex.status === "сдан" && "🏢 Сдан"}
                        {complex.status === "проект" && "🏠 Проект"}
                      </span>
                    </td>
                    <td>{complex.banks?.join(", ") || "-"}</td>
                    <td>
                      {complex.paymentTerms &&
                      complex.paymentTerms.length > 0 ? (
                        <div className="payment-terms-preview">
                          {complex.paymentTerms.slice(0, 2).map((term, idx) => (
                            <span key={idx} className="payment-term-tag">
                              {term}
                            </span>
                          ))}
                          {complex.paymentTerms.length > 2 && (
                            <span className="payment-term-more">
                              +{complex.paymentTerms.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge isActive={complex.isActive} />
                    </td>
                    <td>
                      <ActionButtons
                        buttons={[
                          {
                            icon: "✏️",
                            onClick: () => openEditModal(complex),
                            variant: "primary",
                            title: "Редактировать",
                          },
                          {
                            icon: "🗑️",
                            onClick: () =>
                              handleDelete(complex.id, complex.name),
                            variant: "danger",
                            title: "Удалить",
                          },
                        ]}
                        size="sm"
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {filteredComplexes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6b7280",
                    }}
                  >
                    Нет ЖК в этой компании. Нажмите{" "}
                    <strong>"+ Добавить ЖК"</strong> чтобы создать первый.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ЕДИНОЕ МОДАЛЬНОЕ ОКНО */}
        <AdminModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          title={
            editingComplex
              ? `✏️ Редактирование: ${editingComplex.name}`
              : "🏗️ Создание ЖК"
          }
          fields={getComplexFields()}
          isSubmitting={isSubmitting}
          saveLabel={editingComplex ? "Сохранить изменения" : "Создать ЖК"}
          cancelLabel="Отмена"
          size="full"
        >
          {/* 🔥 УСЛОВИЯ ОПЛАТЫ */}
          <div className="payment-terms-in-modal">
            <div className="payment-terms-header">
              <h4>💳 Условия оплаты</h4>
            </div>

            <div className="payment-terms-input">
              <input
                type="text"
                value={newPaymentTerm}
                onChange={(e) => setNewPaymentTerm(e.target.value)}
                onKeyPress={handlePaymentTermKeyPress}
                placeholder="Введите условие оплаты..."
                className="admin-modal-input"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={addPaymentTerm}
                disabled={!newPaymentTerm.trim() || isSubmitting}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                Добавить
              </button>
            </div>

            {formData.paymentTerms.length > 0 ? (
              <div className="payment-terms-list">
                {formData.paymentTerms.map((term, index) => (
                  <div key={index} className="payment-term-item">
                    <span className="payment-term-text">{term}</span>
                    <button
                      type="button"
                      onClick={() => removePaymentTerm(term)}
                      className="payment-term-remove"
                      disabled={isSubmitting}
                      title="Удалить условие"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="payment-terms-empty">
                <p>Нет условий оплаты</p>
              </div>
            )}
          </div>

          {/* 🔥 АКЦИИ */}
          <div className="promotions-in-modal">
            <div className="promotions-header">
              <h4>🔥 Акции и предложения</h4>
            </div>

            <div className="promotions-input">
              <input
                type="text"
                value={newPromotion}
                onChange={(e) => setNewPromotion(e.target.value)}
                onKeyPress={handlePromotionKeyPress}
                placeholder="Введите акцию (например: Скидка 5% до 31.12)..."
                className="admin-modal-input"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={addPromotion}
                disabled={!newPromotion.trim() || isSubmitting}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                Добавить
              </button>
            </div>

            {formData.promotions.length > 0 ? (
              <div className="promotions-list">
                {formData.promotions.map((promo, index) => (
                  <div key={index} className="promotion-item">
                    <span className="promotion-text">🔥 {promo}</span>
                    <button
                      type="button"
                      onClick={() => removePromotion(promo)}
                      className="promotion-remove"
                      disabled={isSubmitting}
                      title="Удалить акцию"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="promotions-empty">
                <p>Нет акций</p>
              </div>
            )}
          </div>

          {/* 🔥 СПЕЦПРЕДЛОЖЕНИЯ */}
          <div className="special-offers-in-modal">
            <div className="special-offers-header">
              <h4>⭐ Спецпредложения</h4>
            </div>

            <div className="special-offers-input">
              <input
                type="text"
                value={newSpecialOffer}
                onChange={(e) => setNewSpecialOffer(e.target.value)}
                onKeyPress={handleSpecialOfferKeyPress}
                placeholder="Введите спецпредложение (например: Ипотека 0.1% первый год)..."
                className="admin-modal-input"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={addSpecialOffer}
                disabled={!newSpecialOffer.trim() || isSubmitting}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                Добавить
              </button>
            </div>

            {formData.specialOffers.length > 0 ? (
              <div className="special-offers-list">
                {formData.specialOffers.map((offer, index) => (
                  <div key={index} className="special-offer-item">
                    <span className="special-offer-text">⭐ {offer}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialOffer(offer)}
                      className="special-offer-remove"
                      disabled={isSubmitting}
                      title="Удалить спецпредложение"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="special-offers-empty">
                <p>Нет спецпредложений</p>
              </div>
            )}
          </div>

          {/* БАНКИ */}
          <div className="bank-selector-in-modal">
            <div className="bank-selector-header">
              <h4>🏦 Банки-партнеры</h4>
            </div>
            <BankSelector
              selectedBanks={formData.banks || []}
              onChange={(banks: string[]) =>
                setFormData({ ...formData, banks })
              }
              banks={banks}
              placeholder="Выберите банки..."
            />
          </div>

          {/* ТИПЫ КВАРТИР */}
          <div className="apartment-types-in-modal">
            <div className="apartment-types-header">
              <h4>🏠 Типы квартир</h4>
              <button
                type="button"
                onClick={addApartmentType}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                + Добавить тип
              </button>
            </div>

            <div className="apartment-types-list">
              {formData.apartmentTypes.map((type, index) => (
                <div key={type.id || index} className="apartment-type-row">
                  <div className="type-field">
                    <input
                      placeholder="Тип (Студия, 1-комн...)"
                      value={type.type || ""}
                      onChange={(e) =>
                        updateApartmentType(index, "type", e.target.value)
                      }
                      className="admin-modal-input"
                    />
                  </div>
                  <div className="type-field">
                    <input
                      type="number"
                      placeholder="Цена за м²"
                      value={type.pricePerSquareMeter || ""}
                      onChange={(e) =>
                        updateApartmentType(
                          index,
                          "pricePerSquareMeter",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="admin-modal-input"
                    />
                  </div>
                  <div className="type-field">
                    <input
                      type="number"
                      placeholder="Надбавка без ПВ"
                      value={type.surcharges?.withoutDownPayment || ""}
                      onChange={(e) =>
                        updateApartmentType(index, "surcharges", {
                          ...type.surcharges,
                          withoutDownPayment: parseFloat(e.target.value) || 0,
                          partialDownPayment:
                            type.surcharges?.partialDownPayment || 0,
                        })
                      }
                      className="admin-modal-input"
                    />
                  </div>
                  <div className="type-field">
                    <input
                      type="number"
                      placeholder="Надбавка с ПВ"
                      value={type.surcharges?.partialDownPayment || ""}
                      onChange={(e) =>
                        updateApartmentType(index, "surcharges", {
                          ...type.surcharges,
                          withoutDownPayment:
                            type.surcharges?.withoutDownPayment || 0,
                          partialDownPayment: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="admin-modal-input"
                    />
                  </div>
                  <div className="type-field type-actions">
                    <button
                      type="button"
                      onClick={() => removeApartmentType(index)}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      title="Удалить тип"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {formData.apartmentTypes.length === 0 && (
              <div className="apartment-types-empty">
                <p>Нет типов квартир. Нажмите "Добавить тип"</p>
              </div>
            )}
          </div>
        </AdminModal>
      </AdminLayout>
    </div>
  );
};
