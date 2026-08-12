// frontend/src/pages/Admin/sections/OffersSection.tsx

import React, { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import {
  AdminOffer,
  AdminBank,
  AdminProgram,
  AdminComplex,
} from "../types/admin.types";
import { AdminLayout } from "../AdminLayout";
import { DynamicSubsidiesTable } from "./DynamicSubsidiesTable";
import "./OffersSection.css";

export const OffersSection: React.FC = () => {
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [programs, setPrograms] = useState<AdminProgram[]>([]);
  const [complexes, setComplexes] = useState<AdminComplex[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdminOffer>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBank, setFilterBank] = useState<string>("");
  const [filterProgram, setFilterProgram] = useState<string>("");
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersData, banksData, programsData, complexesData] =
        await Promise.all([
          adminApi.getOffers(),
          adminApi.getBanks(),
          adminApi.getPrograms(),
          adminApi.getComplexes(),
        ]);
      setOffers(Array.isArray(offersData) ? offersData : []);
      setBanks(Array.isArray(banksData) ? banksData : []);
      setPrograms(Array.isArray(programsData) ? programsData : []);
      setComplexes(Array.isArray(complexesData) ? complexesData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // СОЗДАНИЕ ОФФЕРА
  // ============================================================
  const handleCreate = async () => {
    try {
      if (!formData.bankId) {
        alert("Выберите банк");
        return;
      }
      if (!formData.programId) {
        alert("Выберите программу");
        return;
      }
      if (!formData.rate && formData.rate !== 0) {
        alert("Введите ставку");
        return;
      }
      if (!formData.minPVPercent && formData.minPVPercent !== 0) {
        alert("Введите минимальный ПВ");
        return;
      }

      const newOffer = await adminApi.createOffer({
        program: formData.program || "Новый оффер",
        rate: formData.rate || 0,
        twoRate: formData.twoRate || null,
        shortRate: formData.shortRate || null,
        subsidyPercent: formData.subsidyPercent || 0,
        minPVPercent: formData.minPVPercent || 20.1,
        durationMonths: formData.durationMonths || null,
        isTwoContracts: formData.isTwoContracts || false,
        excessLimit: formData.excessLimit || false,
        isTranche: formData.isTranche || false,
        trancheFirstPercent: formData.trancheFirstPercent || null,
        trancheSecondDate: formData.trancheSecondDate || null,
        complexes: formData.complexes || [],
        subsidyCalculationMethod: formData.subsidyCalculationMethod || null,
        thresholdTolerance: formData.thresholdTolerance || null,
        thresholdToleranceType: formData.thresholdToleranceType || null,
        roundingStrategy: formData.roundingStrategy || null,
        minLoanTermYears: formData.minLoanTermYears || null,
        description: formData.description || null,
        isActive: true,
        bankId: formData.bankId,
        programId: formData.programId,
      });

      setOffers([...offers, newOffer]);
      setIsCreating(false);
      setFormData({});
      alert("✅ Оффер успешно создан!");
    } catch (error) {
      console.error("Error creating offer:", error);
      alert("❌ Ошибка при создании оффера");
    }
  };

  // ============================================================
  // ОБНОВЛЕНИЕ ОФФЕРА
  // ============================================================
  const handleUpdate = async (id: string) => {
    try {
      const updated = await adminApi.updateOffer(id, formData);
      setOffers(offers.map((o) => (o.id === id ? updated : o)));
      setEditingId(null);
      setFormData({});
      alert("✅ Оффер обновлен!");
    } catch (error) {
      console.error("Error updating offer:", error);
      alert("❌ Ошибка при обновлении оффера");
    }
  };

  // ============================================================
  // УДАЛЕНИЕ / ВОССТАНОВЛЕНИЕ
  // ============================================================
  const handleDelete = async (id: string) => {
    if (!confirm("Удалить оффер?")) return;
    try {
      await adminApi.deleteOffer(id);
      setOffers(offers.filter((o) => o.id !== id));
      alert("✅ Оффер удален");
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("❌ Ошибка при удалении оффера");
    }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm("Полностью удалить оффер без возможности восстановления?"))
      return;
    try {
      await adminApi.hardDeleteOffer(id);
      setOffers(offers.filter((o) => o.id !== id));
      alert("✅ Оффер полностью удален");
    } catch (error) {
      console.error("Error hard deleting offer:", error);
      alert("❌ Ошибка при удалении оффера");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const restored = await adminApi.restoreOffer(id);
      setOffers(offers.map((o) => (o.id === id ? restored : o)));
      alert("✅ Оффер восстановлен");
    } catch (error) {
      console.error("Error restoring offer:", error);
      alert("❌ Ошибка при восстановлении оффера");
    }
  };

  const handleCopy = async (id: string) => {
    try {
      const copy = await adminApi.copyOffer(id);
      setOffers([...offers, copy]);
      alert("✅ Оффер скопирован");
    } catch (error) {
      console.error("Error copying offer:", error);
      alert("❌ Ошибка при копировании оффера");
    }
  };

  // ============================================================
  // РЕДАКТИРОВАНИЕ
  // ============================================================
  const startEdit = (offer: AdminOffer) => {
    setEditingId(offer.id);
    setFormData({
      program: offer.program,
      rate: offer.rate,
      twoRate: offer.twoRate,
      shortRate: offer.shortRate,
      subsidyPercent: offer.subsidyPercent,
      minPVPercent: offer.minPVPercent,
      durationMonths: offer.durationMonths,
      isTwoContracts: offer.isTwoContracts,
      excessLimit: offer.excessLimit,
      isTranche: offer.isTranche,
      trancheFirstPercent: offer.trancheFirstPercent,
      trancheSecondDate: offer.trancheSecondDate,
      complexes: offer.complexes || [],
      subsidyCalculationMethod: offer.subsidyCalculationMethod,
      thresholdTolerance: offer.thresholdTolerance,
      thresholdToleranceType: offer.thresholdToleranceType,
      roundingStrategy: offer.roundingStrategy,
      minLoanTermYears: offer.minLoanTermYears,
      description: offer.description,
      isActive: offer.isActive,
      bankId: offer.bankId,
      programId: offer.programId,
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setFormData({
      program: "",
      rate: 0,
      twoRate: null,
      shortRate: null,
      subsidyPercent: 0,
      minPVPercent: 20.1,
      durationMonths: null,
      isTwoContracts: false,
      excessLimit: false,
      isTranche: false,
      trancheFirstPercent: null,
      trancheSecondDate: null,
      complexes: [],
      subsidyCalculationMethod: null,
      thresholdTolerance: null,
      thresholdToleranceType: null,
      roundingStrategy: null,
      minLoanTermYears: null,
      description: "",
      isActive: true,
      bankId: "",
      programId: "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setIsCreating(false);
  };

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================
  const getBankName = (bankId: string) => {
    const bank = banks.find((b) => b.id === bankId);
    return bank?.name || bankId;
  };

  const getProgramLabel = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    return program?.label || programId;
  };

  const handleComplexToggle = (complexName: string) => {
    const currentComplexes = formData.complexes || [];
    if (currentComplexes.includes(complexName)) {
      setFormData({
        ...formData,
        complexes: currentComplexes.filter((c) => c !== complexName),
      });
    } else {
      setFormData({
        ...formData,
        complexes: [...currentComplexes, complexName],
      });
    }
  };

  const renderComplexesList = (complexesList: string[] | null | undefined) => {
    if (!complexesList || complexesList.length === 0) return "Все ЖК";
    return complexesList.join(", ");
  };

  const toggleExpand = (id: string) => {
    setExpandedOffer(expandedOffer === id ? null : id);
  };

  // ============================================================
  // ФИЛЬТРАЦИЯ
  // ============================================================
  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBankName(offer.bankId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesBank = !filterBank || offer.bankId === filterBank;
    const matchesProgram = !filterProgram || offer.programId === filterProgram;
    return matchesSearch && matchesBank && matchesProgram;
  });

  // ============================================================
  // ОТРИСОВКА ФОРМЫ СОЗДАНИЯ/РЕДАКТИРОВАНИЯ
  // ============================================================
  const renderFormRow = (isEdit: boolean, item?: AdminOffer) => {
    const isEditing = isEdit ? editingId === item?.id : isCreating;
    if (!isEditing) return null;

    const handleSave = isEdit ? () => handleUpdate(item!.id) : handleCreate;

    return (
      <tr>
        <td>
          <select
            value={formData.bankId || ""}
            onChange={(e) =>
              setFormData({ ...formData, bankId: e.target.value })
            }
          >
            <option value="">Выберите банк</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select
            value={formData.programId || ""}
            onChange={(e) =>
              setFormData({ ...formData, programId: e.target.value })
            }
          >
            <option value="">Выберите программу</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.label}
              </option>
            ))}
          </select>
        </td>
        <td>
          <input
            type="number"
            step="0.01"
            placeholder="Ставка"
            value={formData.rate ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                rate: parseFloat(e.target.value) || 0,
              })
            }
          />
        </td>
        <td>
          <input
            type="number"
            step="0.01"
            placeholder="Short rate"
            value={formData.shortRate ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                shortRate: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
          />
        </td>
        <td>
          <input
            type="number"
            step="0.01"
            placeholder="Two rate"
            value={formData.twoRate ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                twoRate: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
          />
        </td>
        <td>
          <input
            type="number"
            step="0.01"
            placeholder="Субсидия %"
            value={formData.subsidyPercent ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                subsidyPercent: parseFloat(e.target.value) || 0,
              })
            }
          />
        </td>
        <td>
          <input
            type="number"
            step="0.1"
            placeholder="Мин. ПВ"
            value={formData.minPVPercent ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                minPVPercent: parseFloat(e.target.value) || 0,
              })
            }
          />
        </td>
        <td>
          <div style={{ minWidth: "200px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {complexes.map((complex) => (
                <label
                  key={complex.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "0.25rem",
                    background: (formData.complexes || []).includes(
                      complex.name,
                    )
                      ? "#667eea"
                      : "#f3f4f6",
                    color: (formData.complexes || []).includes(complex.name)
                      ? "white"
                      : "#374151",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={(formData.complexes || []).includes(complex.name)}
                    onChange={() => handleComplexToggle(complex.name)}
                    style={{ margin: 0 }}
                  />
                  {complex.name}
                </label>
              ))}
            </div>
            <div
              style={{
                marginTop: "0.25rem",
                fontSize: "0.65rem",
                color: "#9ca3af",
              }}
            >
              {!formData.complexes || formData.complexes.length === 0
                ? "📌 Доступно для всех ЖК"
                : `✅ Выбрано: ${formData.complexes.length}`}
            </div>
          </div>
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
            <button onClick={handleSave} className="admin-btn-success">
              💾 {isEdit ? "Сохранить" : "Создать"}
            </button>
            <button onClick={cancelEdit} className="admin-btn-danger">
              ✕
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="offers-section">
      <AdminLayout title="📄 Офферы (предложения банков)">
        <div className="admin-toolbar">
          <button onClick={startCreate} className="admin-btn-primary">
            + Добавить оффер
          </button>
          <button onClick={loadData} className="admin-btn-secondary">
            🔄 Обновить
          </button>
          <div className="spacer" />
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по программе или банку..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterBank}
            onChange={(e) => setFilterBank(e.target.value)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <option value="">Все банки</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
            }}
          >
            <option value="">Все программы</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.label}
              </option>
            ))}
          </select>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Всего: {filteredOffers.length}
          </span>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Банк</th>
                <th>Программа</th>
                <th>Ставка</th>
                <th>Short Rate</th>
                <th>Two Rate</th>
                <th>Субсидия %</th>
                <th>Мин. ПВ</th>
                <th>ЖК</th>
                <th>Субсидии</th>
                <th>Активен</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {/* Форма создания */}
              {isCreating && renderFormRow(false)}

              {/* Список офферов */}
              {filteredOffers.map((offer) => (
                <React.Fragment key={offer.id}>
                  {editingId === offer.id ? (
                    renderFormRow(true, offer)
                  ) : (
                    <tr>
                      <td>{getBankName(offer.bankId)}</td>
                      <td>{getProgramLabel(offer.programId)}</td>
                      <td>{offer.rate}%</td>
                      <td>
                        {offer.shortRate !== null ? `${offer.shortRate}%` : "—"}
                      </td>
                      <td>
                        {offer.twoRate !== null ? `${offer.twoRate}%` : "—"}
                      </td>
                      <td>{offer.subsidyPercent}%</td>
                      <td>{offer.minPVPercent}%</td>
                      <td style={{ fontSize: "0.8rem" }}>
                        {renderComplexesList(offer.complexes)}
                      </td>
                      <td>
                        <button
                          className="admin-btn-secondary"
                          onClick={() => toggleExpand(offer.id)}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {expandedOffer === offer.id
                            ? "📄 Скрыть"
                            : "📄 Показать"}{" "}
                          (субсидии)
                        </button>
                      </td>
                      <td>{offer.isActive ? "✅ Активен" : "❌ Неактивен"}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            onClick={() => startEdit(offer)}
                            className="admin-btn-primary admin-btn-sm"
                            title="Редактировать"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleCopy(offer.id)}
                            className="admin-btn-warning admin-btn-sm"
                            title="Копировать"
                          >
                            📋
                          </button>
                          {!offer.isActive ? (
                            <button
                              onClick={() => handleRestore(offer.id)}
                              className="admin-btn-success admin-btn-sm"
                              title="Восстановить"
                            >
                              ↩️
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(offer.id)}
                              className="admin-btn-danger admin-btn-sm"
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          )}
                          {!offer.isActive && (
                            <button
                              onClick={() => handleHardDelete(offer.id)}
                              className="admin-btn-danger admin-btn-sm"
                              title="Полностью удалить"
                            >
                              💀
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  {expandedOffer === offer.id && (
                    <tr>
                      <td colSpan={11} style={{ padding: "0.5rem" }}>
                        <DynamicSubsidiesTable
                          offerId={offer.id}
                          onUpdate={loadData}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {filteredOffers.length === 0 && !isCreating && (
                <tr>
                  <td
                    colSpan={11}
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "2rem",
                    }}
                  >
                    {searchTerm || filterBank || filterProgram
                      ? "Нет офферов, соответствующих фильтрам"
                      : "Нет офферов. Нажмите 'Добавить оффер' чтобы создать первый."}
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

export default OffersSection;
