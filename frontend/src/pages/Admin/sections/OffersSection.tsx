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
import "./OffersSection.css";

interface DynamicRate {
  id?: string;
  conditionType: string;
  condition: string;
  value: number | null;
  minValue: number | null;
  maxValue: number | null;
  rate: number;
  priority: number;
  description: string;
  isActive: boolean;
  useComplexCondition?: boolean;
  conditionMetadata?: {
    pvMin?: number | null;
    pvMax?: number | null;
    amountMin?: number | null;
    amountMax?: number | null;
    termMin?: number | null;
    termMax?: number | null;
  };
}

interface DynamicSubsidy {
  id?: string;
  minPVPercent: number | null;
  maxPVPercent: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  subsidyPercent: number;
  priority: number;
  description: string;
  roundingStrategy: string | null;
  isActive: boolean;
}

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
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [dynamicData, setDynamicData] = useState<
    Record<string, { rates: DynamicRate[]; subsidies: DynamicSubsidy[] }>
  >({});

  // Состояния для динамических ставок и субсидий в форме
  const [dynamicRates, setDynamicRates] = useState<DynamicRate[]>([
    {
      conditionType: "pv",
      condition: "gte",
      value: null,
      minValue: null,
      maxValue: null,
      rate: 0,
      priority: 0,
      description: "",
      isActive: true,
      useComplexCondition: false,
      conditionMetadata: {
        pvMin: null,
        pvMax: null,
        amountMin: null,
        amountMax: null,
        termMin: null,
        termMax: null,
      },
    },
  ]);
  const [dynamicSubsidies, setDynamicSubsidies] = useState<DynamicSubsidy[]>([
    {
      minPVPercent: null,
      maxPVPercent: null,
      minAmount: null,
      maxAmount: null,
      minTerm: null,
      maxTerm: null,
      subsidyPercent: 0,
      priority: 0,
      description: "",
      roundingStrategy: null,
      isActive: true,
    },
  ]);
  const [showRatesForm, setShowRatesForm] = useState(false);
  const [showSubsidiesForm, setShowSubsidiesForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

      if (banksData.length > 0 && !selectedBankId) {
        setSelectedBankId(banksData[0].id);
      }

      await loadAllDynamicData(offersData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const loadAllDynamicData = async (offersData: AdminOffer[]) => {
    const dataMap: Record<
      string,
      { rates: DynamicRate[]; subsidies: DynamicSubsidy[] }
    > = {};
    for (const offer of offersData) {
      try {
        const [rates, subsidies] = await Promise.all([
          adminApi.getOfferDynamicRates(offer.id),
          adminApi.getOfferDynamicSubsidies(offer.id),
        ]);
        dataMap[offer.id] = {
          rates: Array.isArray(rates) ? rates : [],
          subsidies: Array.isArray(subsidies) ? subsidies : [],
        };
      } catch (error) {
        console.error(`Error loading dynamic data for offer ${offer.id}:`, error);
        dataMap[offer.id] = { rates: [], subsidies: [] };
      }
    }
    setDynamicData(dataMap);
  };

  // ============================================================
  // УПРАВЛЕНИЕ ДИНАМИЧЕСКИМИ СТАВКАМИ
  // ============================================================
  const addRateRow = () => {
    setDynamicRates([
      ...dynamicRates,
      {
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: dynamicRates.length,
        description: "",
        isActive: true,
        useComplexCondition: false,
        conditionMetadata: {
          pvMin: null,
          pvMax: null,
          amountMin: null,
          amountMax: null,
          termMin: null,
          termMax: null,
        },
      },
    ]);
  };

  const removeRateRow = (index: number) => {
    if (dynamicRates.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }
    setDynamicRates(dynamicRates.filter((_, i) => i !== index));
  };

  const updateRateRow = (index: number, field: keyof DynamicRate, value: any) => {
    const updated = [...dynamicRates];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicRates(updated);
  };

  const updateRateMetadata = (
    index: number,
    field: keyof DynamicRate["conditionMetadata"],
    value: any
  ) => {
    const updated = [...dynamicRates];
    if (!updated[index].conditionMetadata) {
      updated[index].conditionMetadata = {};
    }
    updated[index].conditionMetadata![field] = value !== "" ? value : null;
    setDynamicRates(updated);
  };

  // ============================================================
  // УПРАВЛЕНИЕ ДИНАМИЧЕСКИМИ СУБСИДИЯМИ
  // ============================================================
  const addSubsidyRow = () => {
    setDynamicSubsidies([
      ...dynamicSubsidies,
      {
        minPVPercent: null,
        maxPVPercent: null,
        minAmount: null,
        maxAmount: null,
        minTerm: null,
        maxTerm: null,
        subsidyPercent: 0,
        priority: dynamicSubsidies.length,
        description: "",
        roundingStrategy: null,
        isActive: true,
      },
    ]);
  };

  const removeSubsidyRow = (index: number) => {
    if (dynamicSubsidies.length <= 1) {
      alert("Должна быть хотя бы одна строка");
      return;
    }
    setDynamicSubsidies(dynamicSubsidies.filter((_, i) => i !== index));
  };

  const updateSubsidyRow = (index: number, field: keyof DynamicSubsidy, value: any) => {
    const updated = [...dynamicSubsidies];
    updated[index] = { ...updated[index], [field]: value };
    setDynamicSubsidies(updated);
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

  const getProgramTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      base: "Базовая ипотека",
      full: "Субсидия / Весь срок",
      short: "Субсидия / Короткий срок",
      family: "Семейная ипотека",
      it: "ИТ ипотека",
      tranche: "Траншевая ипотека",
    };
    return labels[type] || type;
  };

  const getProgramTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      base: "🏠",
      full: "📈",
      short: "⚡",
      family: "👨‍👩‍👧‍👦",
      it: "💻",
      tranche: "📊",
    };
    return icons[type] || "📋";
  };

  const getProgramTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      base: "#6b7280",
      full: "#f59e0b",
      short: "#ef4444",
      family: "#8b5cf6",
      it: "#3b82f6",
      tranche: "#ec4899",
    };
    return colors[type] || "#6b7280";
  };

  // ============================================================
  // ГРУППИРОВКА ОФФЕРОВ ПО БАНКАМ И ПРОГРАММАМ
  // ============================================================
  const getOffersByBankAndProgram = () => {
    const result: Record<string, Record<string, AdminOffer[]>> = {};
    
    const offersByBank: Record<string, AdminOffer[]> = {};
    for (const offer of offers) {
      if (!offersByBank[offer.bankId]) {
        offersByBank[offer.bankId] = [];
      }
      offersByBank[offer.bankId].push(offer);
    }

    for (const [bankId, bankOffers] of Object.entries(offersByBank)) {
      const byProgram: Record<string, AdminOffer[]> = {};
      for (const offer of bankOffers) {
        const programId = offer.programId;
        if (!byProgram[programId]) {
          byProgram[programId] = [];
        }
        byProgram[programId].push(offer);
      }
      result[bankId] = byProgram;
    }

    return result;
  };

  // ============================================================
  // ЛОГИКА ОТОБРАЖЕНИЯ СТАВОК
  // ============================================================
  const getDisplayRate = (offer: AdminOffer) => {
    const offerData = dynamicData[offer.id];
    const hasDynamicRates = offerData?.rates && offerData.rates.length > 0;
    const hasDynamicRatesIU =
      offer.dynamicRatesIU && offer.dynamicRatesIU.length > 0;

    if (hasDynamicRates) {
      return (
        <div className="rate-dynamic-container">
          {offerData.rates.map((rule: any, i: number) => {
            let conditionDisplay = "";
            if (rule.conditionMetadata) {
              const meta = rule.conditionMetadata;
              const parts = [];
              if (meta.pvMin !== null || meta.pvMax !== null) {
                parts.push(`ПВ ${meta.pvMin ?? '—'}—${meta.pvMax ?? '∞'}`);
              }
              if (meta.amountMin !== null || meta.amountMax !== null) {
                parts.push(`Сумма ${meta.amountMin ?? '—'}—${meta.amountMax ?? '∞'}`);
              }
              if (meta.termMin !== null || meta.termMax !== null) {
                parts.push(`Срок ${meta.termMin ?? '—'}—${meta.termMax ?? '∞'}`);
              }
              conditionDisplay = parts.join(', ');
            } else {
              conditionDisplay = rule.description ||
                `${rule.conditionType} ${rule.condition} ${rule.value || ''}`;
            }
            return (
              <div key={i} className="rate-dynamic-item">
                <span className="rate-dynamic-value">{rule.rate}%</span>
                <span className="rate-dynamic-condition">{conditionDisplay}</span>
              </div>
            );
          })}
        </div>
      );
    }

    if (hasDynamicRatesIU) {
      return (
        <div className="rate-dynamic-container">
          {offer.dynamicRatesIU.map((rule: any, i: number) => (
            <div key={i} className="rate-dynamic-item">
              <span className="rate-dynamic-value">{rule.rate}%</span>
              <span className="rate-dynamic-condition">
                {rule.description || `ПВ от ${rule.minPVPercent}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="rate-static-container">
        {offer.shortRate && (
          <span className="rate-short">{offer.shortRate}% →</span>
        )}
        <span className="rate-main">{offer.rate}%</span>
        {offer.twoRate && <span className="rate-two">{offer.twoRate}%</span>}
      </div>
    );
  };

  // ============================================================
  // ЛОГИКА ОТОБРАЖЕНИЯ СУБСИДИЙ
  // ============================================================
  const getDisplaySubsidy = (offer: AdminOffer) => {
    const offerData = dynamicData[offer.id];
    const hasDynamicSubsidy =
      offerData?.subsidies && offerData.subsidies.length > 0;
    const hasDynamicSubsidyPercent =
      offer.dynamicSubsidyPercent && offer.dynamicSubsidyPercent.length > 0;

    if (hasDynamicSubsidy) {
      const subsidies = offerData.subsidies
        .map((rule: any) => rule.subsidyPercent)
        .filter((val: number) => val !== undefined && val !== null)
        .sort((a: number, b: number) => a - b);

      if (subsidies.length === 0) return { display: "—", type: "none" };

      const minSubsidy = subsidies[0];
      const maxSubsidy = subsidies[subsidies.length - 1];

      if (minSubsidy === maxSubsidy) {
        return { display: `${minSubsidy}%`, type: "dynamic" };
      }

      return { display: `${minSubsidy}% — ${maxSubsidy}%`, type: "dynamic" };
    }

    if (hasDynamicSubsidyPercent) {
      const subsidies = offer.dynamicSubsidyPercent
        .map((rule: any) => rule.subsidyPercent)
        .filter((val: number) => val !== undefined && val !== null)
        .sort((a: number, b: number) => a - b);

      if (subsidies.length === 0) return { display: "—", type: "none" };

      const minSubsidy = subsidies[0];
      const maxSubsidy = subsidies[subsidies.length - 1];

      if (minSubsidy === maxSubsidy) {
        return { display: `${minSubsidy}%`, type: "dynamic" };
      }

      return { display: `${minSubsidy}% — ${maxSubsidy}%`, type: "dynamic" };
    }

    if (offer.subsidyPercent > 0) {
      return { display: `${offer.subsidyPercent}%`, type: "fixed" };
    }

    return { display: "—", type: "none" };
  };

  // ============================================================
  // ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ДЛЯ РЕДАКТИРОВАНИЯ
  // ============================================================
  const openEditModal = (offer: AdminOffer) => {
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
    
    if (dynamicData[offer.id]) {
      const rates = dynamicData[offer.id].rates.length > 0 ? dynamicData[offer.id].rates : [{
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: 0,
        description: "",
        isActive: true,
        useComplexCondition: false,
        conditionMetadata: {
          pvMin: null,
          pvMax: null,
          amountMin: null,
          amountMax: null,
          termMin: null,
          termMax: null,
        },
      }];
      setDynamicRates(rates);
      setDynamicSubsidies(dynamicData[offer.id].subsidies.length > 0 ? dynamicData[offer.id].subsidies : [{
        minPVPercent: null,
        maxPVPercent: null,
        minAmount: null,
        maxAmount: null,
        minTerm: null,
        maxTerm: null,
        subsidyPercent: 0,
        priority: 0,
        description: "",
        roundingStrategy: null,
        isActive: true,
      }]);
      setShowRatesForm(dynamicData[offer.id].rates.length > 0);
      setShowSubsidiesForm(dynamicData[offer.id].subsidies.length > 0);
    }
    
    setShowEditModal(true);
  };

  // ============================================================
  // ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ДЛЯ СОЗДАНИЯ
  // ============================================================
  const openCreateModal = () => {
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
      bankId: selectedBankId || "",
      programId: "",
    });
    setShowRatesForm(false);
    setShowSubsidiesForm(false);
    resetDynamicForms();
    setShowEditModal(true);
  };

  const resetDynamicForms = () => {
    setDynamicRates([
      {
        conditionType: "pv",
        condition: "gte",
        value: null,
        minValue: null,
        maxValue: null,
        rate: 0,
        priority: 0,
        description: "",
        isActive: true,
        useComplexCondition: false,
        conditionMetadata: {
          pvMin: null,
          pvMax: null,
          amountMin: null,
          amountMax: null,
          termMin: null,
          termMax: null,
        },
      },
    ]);
    setDynamicSubsidies([
      {
        minPVPercent: null,
        maxPVPercent: null,
        minAmount: null,
        maxAmount: null,
        minTerm: null,
        maxTerm: null,
        subsidyPercent: 0,
        priority: 0,
        description: "",
        roundingStrategy: null,
        isActive: true,
      },
    ]);
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

      if (showRatesForm) {
        for (const rate of dynamicRates) {
          if (rate.rate > 0) {
            const rateData: any = {
              conditionType: rate.conditionType,
              condition: rate.condition,
              value: rate.value || null,
              minValue: rate.minValue || null,
              maxValue: rate.maxValue || null,
              rate: rate.rate,
              priority: rate.priority || 0,
              description: rate.description || "",
              isActive: true,
            };
            if (rate.useComplexCondition && rate.conditionMetadata) {
              rateData.conditionMetadata = rate.conditionMetadata;
            }
            await adminApi.createDynamicRate(newOffer.id, rateData);
          }
        }
      }

      if (showSubsidiesForm) {
        for (const subsidy of dynamicSubsidies) {
          if (subsidy.subsidyPercent > 0) {
            await adminApi.createDynamicSubsidy(newOffer.id, {
              minPVPercent: subsidy.minPVPercent || null,
              maxPVPercent: subsidy.maxPVPercent || null,
              minAmount: subsidy.minAmount || null,
              maxAmount: subsidy.maxAmount || null,
              minTerm: subsidy.minTerm || null,
              maxTerm: subsidy.maxTerm || null,
              subsidyPercent: subsidy.subsidyPercent,
              priority: subsidy.priority || 0,
              description: subsidy.description || "",
              roundingStrategy: subsidy.roundingStrategy || null,
              isActive: true,
            });
          }
        }
      }

      setOffers([...offers, newOffer]);
      closeModal();
      alert("✅ Оффер успешно создан!");
    } catch (error) {
      console.error("Error creating offer:", error);
      alert("❌ Ошибка при создании оффера");
    }
  };

  // ============================================================
  // ОБНОВЛЕНИЕ ОФФЕРА
  // ============================================================
  const handleUpdate = async () => {
    if (!editingId) return;
    
    try {
      const updated = await adminApi.updateOffer(editingId, formData);
      setOffers(offers.map((o) => (o.id === editingId ? updated : o)));
      closeModal();
      alert("✅ Оффер обновлен!");
    } catch (error) {
      console.error("Error updating offer:", error);
      alert("❌ Ошибка при обновлении оффера");
    }
  };

  // ============================================================
  // ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
  // ============================================================
  const closeModal = () => {
    setShowEditModal(false);
    setEditingId(null);
    setIsCreating(false);
    setFormData({});
    setShowRatesForm(false);
    setShowSubsidiesForm(false);
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

  const filteredOffers = offers.filter((offer) => {
    const matchesBank = !selectedBankId || offer.bankId === selectedBankId;
    const matchesSearch =
      offer.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBankName(offer.bankId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesBank && matchesSearch;
  });

  const groupedOffers = getOffersByBankAndProgram();

  if (loading) return <div className="admin-loading">Загрузка...</div>;

  return (
    <div className="offers-section">
      <AdminLayout title="📄 Офферы (предложения банков)">
        <div className="admin-toolbar">
          <button onClick={openCreateModal} className="admin-btn-primary">
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
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Всего: {filteredOffers.length}
          </span>
        </div>

        {/* Табы банков */}
        <div className="bank-tabs">
          {banks.map((bank) => {
            const count = offers.filter((o) => o.bankId === bank.id).length;
            return (
              <button
                key={bank.id}
                className={`bank-tab ${selectedBankId === bank.id ? "active" : ""}`}
                onClick={() => setSelectedBankId(bank.id)}
              >
                <span className="bank-tab-icon">🏦</span>
                <span className="bank-tab-name">{bank.name}</span>
                <span className="bank-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Офферы по банкам и программам */}
        {selectedBankId && groupedOffers[selectedBankId] && (
          <div className="bank-offers">
            {Object.entries(groupedOffers[selectedBankId]).map(([programId, programOffers]) => {
              const program = programs.find((p) => p.id === programId);
              const programType = program?.type || "unknown";
              const programLabel = program?.label || programId;
              const typeLabel = getProgramTypeLabel(programType);
              const typeIcon = getProgramTypeIcon(programType);
              const typeColor = getProgramTypeColor(programType);

              return (
                <div key={programId} className="program-group">
                  <div className="program-group-header">
                    <div className="program-group-title">
                      <span className="program-icon">{typeIcon}</span>
                      <span className="program-label">{programLabel}</span>
                      <span className="program-type-badge" style={{ backgroundColor: typeColor }}>
                        {typeLabel}
                      </span>
                    </div>
                    <span className="program-offers-count">
                      {programOffers.length} {programOffers.length === 1 ? "оффер" : "офферов"}
                    </span>
                  </div>

                  <div className="program-offers-list">
                    {programOffers.map((offer) => (
                      <div key={offer.id} className="offer-card">
                        <div className="offer-card-header">
                          <div className="offer-card-title">
                            <span className="offer-program-name">{offer.program}</span>
                            {offer.isActive ? (
                              <span className="status-badge active">✅ Активен</span>
                            ) : (
                              <span className="status-badge inactive">❌ Неактивен</span>
                            )}
                          </div>
                          <div className="offer-card-actions">
                            <button
                              onClick={() => openEditModal(offer)}
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
                        </div>

                        <div className="offer-card-body">
                          <div className="offer-details">
                            <div className="offer-detail-item">
                              <span className="detail-label">Ставка:</span>
                              <span className="detail-value rate-cell">
                                {getDisplayRate(offer)}
                              </span>
                            </div>
                            <div className="offer-detail-item">
                              <span className="detail-label">Субсидия:</span>
                              <span className="detail-value subsidy-cell">
                                {(() => {
                                  const subsidy = getDisplaySubsidy(offer);
                                  return (
                                    <span
                                      className={`subsidy-badge subsidy-${subsidy.type}`}
                                      title={
                                        subsidy.type === "dynamic"
                                          ? "Динамическая субсидия"
                                          : subsidy.type === "fixed"
                                          ? "Фиксированная субсидия"
                                          : "Нет субсидии"
                                      }
                                    >
                                      {subsidy.display}
                                      {subsidy.type === "dynamic" && (
                                        <span className="subsidy-dynamic-icon">📊</span>
                                      )}
                                    </span>
                                  );
                                })()}
                              </span>
                            </div>
                            <div className="offer-detail-item">
                              <span className="detail-label">Мин. ПВ:</span>
                              <span className="detail-value">{offer.minPVPercent}%</span>
                            </div>
                            <div className="offer-detail-item">
                              <span className="detail-label">ЖК:</span>
                              <span className="detail-value complex-list">
                                {renderComplexesList(offer.complexes)}
                              </span>
                            </div>
                            {offer.shortRate && (
                              <div className="offer-detail-item">
                                <span className="detail-label">Short Rate:</span>
                                <span className="detail-value">{offer.shortRate}%</span>
                              </div>
                            )}
                            {offer.twoRate && (
                              <div className="offer-detail-item">
                                <span className="detail-label">Two Rate:</span>
                                <span className="detail-value">{offer.twoRate}%</span>
                              </div>
                            )}
                            {offer.isTranche && (
                              <div className="offer-detail-item">
                                <span className="detail-label">Траншевая:</span>
                                <span className="detail-value">✅</span>
                              </div>
                            )}
                            {offer.isTwoContracts && (
                              <div className="offer-detail-item">
                                <span className="detail-label">2 договора:</span>
                                <span className="detail-value">✅</span>
                              </div>
                            )}
                            {offer.excessLimit && (
                              <div className="offer-detail-item">
                                <span className="detail-label">Сверхлимит:</span>
                                <span className="detail-value">✅</span>
                              </div>
                            )}
                            {offer.description && (
                              <div className="offer-detail-item full-width">
                                <span className="detail-label">Описание:</span>
                                <span className="detail-value">{offer.description}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {dynamicData[offer.id] &&
                          (dynamicData[offer.id].rates.length > 0 ||
                           dynamicData[offer.id].subsidies.length > 0) && (
                            <div className="offer-card-footer">
                              {dynamicData[offer.id].rates.length > 0 && (
                                <div className="dynamic-info">
                                  <span className="dynamic-label">📊 Ставки:</span>
                                  <span className="dynamic-value">
                                    {dynamicData[offer.id].rates.length} условий
                                  </span>
                                </div>
                              )}
                              {dynamicData[offer.id].subsidies.length > 0 && (
                                <div className="dynamic-info">
                                  <span className="dynamic-label">💰 Субсидии:</span>
                                  <span className="dynamic-value">
                                    {dynamicData[offer.id].subsidies.length} условий
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {(!groupedOffers[selectedBankId] ||
              Object.keys(groupedOffers[selectedBankId]).length === 0) && (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">Нет офферов в этом банке</div>
                <div className="empty-description">
                  Нажмите "Добавить оффер" чтобы создать первый
                </div>
              </div>
            )}
          </div>
        )}

        {/* Модальное окно для создания/редактирования */}
        {showEditModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{isCreating ? "➕ Создать оффер" : "✏️ Редактировать оффер"}</h2>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Банк *</label>
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
                  </div>

                  <div className="form-group">
                    <label>Программа *</label>
                    <select
                      value={formData.programId || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, programId: e.target.value })
                      }
                    >
                      <option value="">Выберите программу</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.label} ({program.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ставка (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Мин. ПВ (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.minPVPercent ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPVPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Short Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.shortRate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortRate: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Two Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.twoRate ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twoRate: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Субсидия (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.subsidyPercent ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subsidyPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Срок (мес)</label>
                    <input
                      type="number"
                      value={formData.durationMonths ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMonths: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>ЖК</label>
                    <div className="complex-checkboxes">
                      {complexes.map((complex) => (
                        <label key={complex.id} className="complex-checkbox">
                          <input
                            type="checkbox"
                            checked={(formData.complexes || []).includes(complex.name)}
                            onChange={() => handleComplexToggle(complex.name)}
                          />
                          {complex.name}
                        </label>
                      ))}
                    </div>
                    <small style={{ color: "#6b7280" }}>
                      {!formData.complexes || formData.complexes.length === 0
                        ? "📌 Доступно для всех ЖК"
                        : `✅ Выбрано: ${formData.complexes.length}`}
                    </small>
                  </div>

                  <div className="form-group full-width">
                    <label>Описание</label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Дополнительные опции</label>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.isTwoContracts || false}
                          onChange={(e) =>
                            setFormData({ ...formData, isTwoContracts: e.target.checked })
                          }
                        />
                        2 договора
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.excessLimit || false}
                          onChange={(e) =>
                            setFormData({ ...formData, excessLimit: e.target.checked })
                          }
                        />
                        Сверхлимит
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.isTranche || false}
                          onChange={(e) =>
                            setFormData({ ...formData, isTranche: e.target.checked })
                          }
                        />
                        Траншевая
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.isActive !== undefined ? formData.isActive : true}
                          onChange={(e) =>
                            setFormData({ ...formData, isActive: e.target.checked })
                          }
                        />
                        Активен
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-divider"></div>

                <div className="dynamic-forms-toggle">
                  <button
                    onClick={() => setShowRatesForm(!showRatesForm)}
                    className={`toggle-btn ${showRatesForm ? "active" : ""}`}
                  >
                    📊 {showRatesForm ? "Скрыть" : "Показать"} динамические ставки
                  </button>
                  <button
                    onClick={() => setShowSubsidiesForm(!showSubsidiesForm)}
                    className={`toggle-btn ${showSubsidiesForm ? "active" : ""}`}
                  >
                    💰 {showSubsidiesForm ? "Скрыть" : "Показать"} динамические субсидии
                  </button>
                </div>

                {showRatesForm && (
                  <div className="dynamic-form">
                    <div className="dynamic-form-header">
                      <h4>📊 Динамические ставки</h4>
                      <button onClick={addRateRow} className="admin-btn-secondary admin-btn-sm">
                        + Добавить строку
                      </button>
                    </div>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Тип</th>
                            <th>Условие</th>
                            <th>Значение</th>
                            <th>Ставка</th>
                            <th>Приор</th>
                            <th>Описание</th>
                            <th>Сложное</th>
                            <th>Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dynamicRates.map((rate, index) => (
                            <tr key={index}>
                              <td>
                                <select
                                  value={rate.conditionType}
                                  onChange={(e) =>
                                    updateRateRow(index, "conditionType", e.target.value)
                                  }
                                >
                                  <option value="pv">ПВ</option>
                                  <option value="amount">Сумма</option>
                                  <option value="term">Срок</option>
                                </select>
                              </td>
                              <td>
                                <select
                                  value={rate.condition}
                                  onChange={(e) =>
                                    updateRateRow(index, "condition", e.target.value)
                                  }
                                >
                                  <option value="gte">≥</option>
                                  <option value="lte">≤</option>
                                  <option value="lt">&lt;</option>
                                  <option value="gt">&gt;</option>
                                  <option value="eq">=</option>
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Знач"
                                  value={rate.value ?? ""}
                                  onChange={(e) =>
                                    updateRateRow(
                                      index,
                                      "value",
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ставка"
                                  value={rate.rate ?? ""}
                                  onChange={(e) =>
                                    updateRateRow(
                                      index,
                                      "rate",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  style={{ width: "70px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="Приор"
                                  value={rate.priority ?? ""}
                                  onChange={(e) =>
                                    updateRateRow(
                                      index,
                                      "priority",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{ width: "50px" }}
                                />
                              </td>
                              <td>
                                <input
                                  placeholder="Описание"
                                  value={rate.description || ""}
                                  onChange={(e) =>
                                    updateRateRow(index, "description", e.target.value)
                                  }
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={rate.useComplexCondition || false}
                                  onChange={(e) =>
                                    updateRateRow(index, "useComplexCondition", e.target.checked)
                                  }
                                />
                              </td>
                              <td>
                                <button
                                  onClick={() => removeRateRow(index)}
                                  className="admin-btn-danger admin-btn-xs"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {dynamicRates.some(r => r.useComplexCondition) && (
                      <div className="complex-params">
                        <div style={{ fontSize: "0.7rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                          📋 Параметры сложных условий:
                        </div>
                        <div className="complex-params-grid">
                          <div>ПВ от</div>
                          <div>ПВ до</div>
                          <div>Сумма от</div>
                          <div>Сумма до</div>
                          <div>Срок от</div>
                          <div>Срок до</div>
                        </div>
                        {dynamicRates.map((rate, index) => (
                          rate.useComplexCondition && (
                            <div key={index} className="complex-params-row">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="от"
                                value={rate.conditionMetadata?.pvMin ?? ""}
                                onChange={(e) => updateRateMetadata(index, "pvMin", e.target.value)}
                              />
                              <input
                                type="number"
                                step="0.1"
                                placeholder="до"
                                value={rate.conditionMetadata?.pvMax ?? ""}
                                onChange={(e) => updateRateMetadata(index, "pvMax", e.target.value)}
                              />
                              <input
                                type="number"
                                placeholder="от"
                                value={rate.conditionMetadata?.amountMin ?? ""}
                                onChange={(e) => updateRateMetadata(index, "amountMin", e.target.value)}
                              />
                              <input
                                type="number"
                                placeholder="до"
                                value={rate.conditionMetadata?.amountMax ?? ""}
                                onChange={(e) => updateRateMetadata(index, "amountMax", e.target.value)}
                              />
                              <input
                                type="number"
                                placeholder="от"
                                value={rate.conditionMetadata?.termMin ?? ""}
                                onChange={(e) => updateRateMetadata(index, "termMin", e.target.value)}
                              />
                              <input
                                type="number"
                                placeholder="до"
                                value={rate.conditionMetadata?.termMax ?? ""}
                                onChange={(e) => updateRateMetadata(index, "termMax", e.target.value)}
                              />
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showSubsidiesForm && (
                  <div className="dynamic-form">
                    <div className="dynamic-form-header">
                      <h4>💰 Динамические субсидии</h4>
                      <button onClick={addSubsidyRow} className="admin-btn-secondary admin-btn-sm">
                        + Добавить строку
                      </button>
                    </div>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ПВ от</th>
                            <th>ПВ до</th>
                            <th>Сумма от</th>
                            <th>Сумма до</th>
                            <th>Срок от</th>
                            <th>Срок до</th>
                            <th>Субсидия</th>
                            <th>Приор</th>
                            <th>Описание</th>
                            <th>Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dynamicSubsidies.map((subsidy, index) => (
                            <tr key={index}>
                              <td>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="от"
                                  value={subsidy.minPVPercent ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "minPVPercent",
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "60px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="до"
                                  value={subsidy.maxPVPercent ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "maxPVPercent",
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "60px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="от"
                                  value={subsidy.minAmount ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "minAmount",
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="до"
                                  value={subsidy.maxAmount ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "maxAmount",
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="от"
                                  value={subsidy.minTerm ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "minTerm",
                                      e.target.value ? parseInt(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "50px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="до"
                                  value={subsidy.maxTerm ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "maxTerm",
                                      e.target.value ? parseInt(e.target.value) : null
                                    )
                                  }
                                  style={{ width: "50px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="%"
                                  value={subsidy.subsidyPercent ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "subsidyPercent",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  style={{ width: "60px" }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="Приор"
                                  value={subsidy.priority ?? ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(
                                      index,
                                      "priority",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  style={{ width: "50px" }}
                                />
                              </td>
                              <td>
                                <input
                                  placeholder="Описание"
                                  value={subsidy.description || ""}
                                  onChange={(e) =>
                                    updateSubsidyRow(index, "description", e.target.value)
                                  }
                                  style={{ width: "80px" }}
                                />
                              </td>
                              <td>
                                <button
                                  onClick={() => removeSubsidyRow(index)}
                                  className="admin-btn-danger admin-btn-xs"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Отмена
                </button>
                <button
                  onClick={isCreating ? handleCreate : handleUpdate}
                  className="admin-btn-success"
                >
                  💾 {isCreating ? "Создать" : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </div>
  );
};

export default OffersSection;