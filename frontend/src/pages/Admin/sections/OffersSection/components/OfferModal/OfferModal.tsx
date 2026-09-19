// frontend/src/pages/Admin/sections/offers/components/OfferModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  AdminOffer,
  AdminBank,
  AdminProgram,
  AdminCompany,
  AdminComplex,
} from "../../../../types/admin.types";
import Tabs from "../../../../components/Tabs/Tabs";
import { DynamicRate, DynamicSubsidy } from "../../types";
import { DynamicRatesForm } from "../DynamicRatesForm/DynamicRatesForm";
import { DynamicSubsidiesForm } from "../DynamicSubsidiesForm/DynamicSubsidiesForm";
import adminApi from "../../../../../../services/adminApi";
import "./OfferModal.css";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  editingOffer: AdminOffer | null;
  banks: AdminBank[];
  programs: AdminProgram[];
  companies: AdminCompany[];
  complexes: AdminComplex[];
  onRefresh: () => void;
  selectedBankId?: string | null;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  onClose,
  isCreating,
  editingOffer,
  banks,
  programs,
  companies,
  complexes,
  onRefresh,
  selectedBankId,
}) => {
  const [formData, setFormData] = useState<Partial<AdminOffer>>({});
  const [dynamicRates, setDynamicRates] = useState<DynamicRate[]>([]);
  const [dynamicSubsidies, setDynamicSubsidies] = useState<DynamicSubsidy[]>(
    [],
  );
  const [showRatesForm, setShowRatesForm] = useState(false);
  const [showSubsidiesForm, setShowSubsidiesForm] = useState(false);
  const [ratesEditMode, setRatesEditMode] = useState(false);
  const [subsidiesEditMode, setSubsidiesEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialOfferId, setInitialOfferId] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState("");
  const [draggedBadgeIndex, setDraggedBadgeIndex] = useState<number | null>(
    null,
  );
  const [dragOverBadgeIndex, setDragOverBadgeIndex] = useState<number | null>(
    null,
  );

  // 🔥 НОВОЕ: выбранная компания для табов ЖК
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const selectedProgram = programs.find((p) => p.id === formData.programId);
  const programType = selectedProgram?.type || "";
  const isFamily = programType === "family";
  const isIT = programType === "it";
  const isFamilyOrIT = isFamily || isIT;
  const isShortTerm = programType === "short";
  const isTranche = programType === "tranche";
  const isTwoContracts = formData.isTwoContracts || false;

  // ============================================================
  // 🔥 ТАБЫ КОМПАНИЙ
  // ============================================================

  const companiesWithComplexes = useMemo(() => {
    const companyIds = new Set(complexes.map((c) => c.companyId));
    return companies.filter(
      (company) => companyIds.has(company.id) && company.isActive,
    );
  }, [companies, complexes]);

  const companyTabs = useMemo(() => {
    return companiesWithComplexes.map((company) => ({
      id: company.id,
      label: company.name,
      icon: "🏢",
      count: complexes.filter((c) => c.companyId === company.id).length,
      isActive: company.isActive,
    }));
  }, [companiesWithComplexes, complexes]);

  const complexesByCompany = useMemo(() => {
    if (!selectedCompanyId) return [];
    return complexes.filter((c) => c.companyId === selectedCompanyId);
  }, [complexes, selectedCompanyId]);

  // ============================================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================================

  useEffect(() => {
    if (isCreating) {
      const initialBankId = selectedBankId || "";

      setFormData({
        program: "",
        rate: 0,
        twoRate: null,
        shortRate: null,
        subsidyPercent: 0,
        minPVPercent: 20.1,
        durationMonths: null,
        isTwoContracts: false,
        isExcessLimit: false,
        isTranche: false,
        trancheFirstPercent: null,
        trancheSecondDate: null,
        complexes: [],
        badges: [],
        subsidyCalculationMethod: "standard",
        thresholdTolerance: null,
        thresholdToleranceType: null,
        roundingStrategy: null,
        description: "",
        isActive: true,
        bankId: initialBankId,
        programId: "",
        minLoanAmount: null,
        maxLoanAmount: null,
        minLoanTerm: null,
        maxLoanTerm: null,
      });

      const resetDynamicForms = () => {
        setDynamicRates([
          {
            conditionMetadata: {
              amountMin: null,
              amountMax: null,
              pvMin: null,
              pvMax: null,
              termMin: null,
              termMax: null,
            },
            rate: 0,
            priority: 1,
            description: "",
            isActive: true,
          },
        ]);

        setDynamicSubsidies([
          {
            conditionMetadata: {
              amountMin: null,
              amountMax: null,
              pvMin: null,
              pvMax: null,
              termMin: null,
              termMax: null,
            },
            tolerance: 0.5,
            subsidyPercent: 0,
            priority: 1,
            description: "",
            isActive: true,
          },
        ]);
      };

      resetDynamicForms();
      setShowRatesForm(false);
      setShowSubsidiesForm(false);
      setRatesEditMode(false);
      setSubsidiesEditMode(false);
      setErrors({});
      setInitialOfferId(null);
      setNewBadge("");

      if (companiesWithComplexes.length > 0) {
        setSelectedCompanyId(companiesWithComplexes[0].id);
      }
    } else if (editingOffer) {
      setFormData({
        program: editingOffer.program,
        rate: editingOffer.rate,
        twoRate: editingOffer.twoRate,
        shortRate: editingOffer.shortRate,
        subsidyPercent: editingOffer.subsidyPercent,
        minPVPercent: editingOffer.minPVPercent,
        durationMonths: editingOffer.durationMonths,
        isTwoContracts: editingOffer.isTwoContracts,
        isExcessLimit: editingOffer.isExcessLimit,
        isTranche: editingOffer.isTranche,
        trancheFirstPercent: editingOffer.trancheFirstPercent,
        trancheSecondDate: editingOffer.trancheSecondDate,
        complexes: editingOffer.complexes || [],
        badges: editingOffer.badges || [],
        subsidyCalculationMethod:
          editingOffer.subsidyCalculationMethod || "standard",
        thresholdTolerance: editingOffer.thresholdTolerance,
        thresholdToleranceType: editingOffer.thresholdToleranceType,
        roundingStrategy: editingOffer.roundingStrategy,
        description: editingOffer.description,
        isActive: editingOffer.isActive,
        bankId: editingOffer.bankId,
        programId: editingOffer.programId,
        minLoanAmount: editingOffer.minLoanAmount,
        maxLoanAmount: editingOffer.maxLoanAmount,
        minLoanTerm: editingOffer.minLoanTerm,
        maxLoanTerm: editingOffer.maxLoanTerm,
      });

      loadDynamicDataFromOffer(editingOffer);
      setErrors({});
      setInitialOfferId(editingOffer.id);
      setRatesEditMode(false);
      setSubsidiesEditMode(false);
      setNewBadge("");

      if (editingOffer.complexes && editingOffer.complexes.length > 0) {
        const firstComplexName = editingOffer.complexes[0];
        const firstComplex = complexes.find((c) => c.name === firstComplexName);
        if (firstComplex) {
          setSelectedCompanyId(firstComplex.companyId);
        } else if (companiesWithComplexes.length > 0) {
          setSelectedCompanyId(companiesWithComplexes[0].id);
        }
      } else if (companiesWithComplexes.length > 0) {
        setSelectedCompanyId(companiesWithComplexes[0].id);
      }
    }
  }, [
    isCreating,
    editingOffer,
    selectedBankId,
    companiesWithComplexes,
    complexes,
  ]);

  // Сброс флагов при смене программы
  useEffect(() => {
    if (!isFamilyOrIT) {
      setFormData((prev) => ({
        ...prev,
        isTwoContracts: false,
        isExcessLimit: false,
        twoRate: null,
      }));
    }
    if (!isTranche) {
      setFormData((prev) => ({
        ...prev,
        isTranche: false,
        trancheFirstPercent: null,
        trancheSecondDate: null,
      }));
    }
    if (!isShortTerm) {
      setFormData((prev) => ({
        ...prev,
        subsidyCalculationMethod: null,
      }));
    }
  }, [programType, isFamilyOrIT, isTranche, isShortTerm]);

  // ============================================================
  // ДИНАМИЧЕСКИЕ ДАННЫЕ
  // ============================================================

  const loadDynamicDataFromOffer = (offer: AdminOffer) => {
    console.log("📊 Loading dynamic data from offer:", offer);

    if (
      offer.dynamicRates &&
      Array.isArray(offer.dynamicRates) &&
      offer.dynamicRates.length > 0
    ) {
      const rates = offer.dynamicRates
        .map((rate: any) => ({
          id: rate.id,
          conditionMetadata: rate.conditionMetadata || {
            amountMin: null,
            amountMax: null,
            pvMin: null,
            pvMax: null,
            termMin: null,
            termMax: null,
          },
          rate: rate.rate || 0,
          priority: rate.priority || 0,
          description: rate.description || "",
          isActive: rate.isActive !== undefined ? rate.isActive : true,
        }))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      setDynamicRates(rates);
      setShowRatesForm(true);
    } else {
      setDynamicRates([
        {
          conditionMetadata: {
            amountMin: null,
            amountMax: null,
            pvMin: null,
            pvMax: null,
            termMin: null,
            termMax: null,
          },
          rate: 0,
          priority: 1,
          description: "",
          isActive: true,
        },
      ]);
      setShowRatesForm(false);
    }

    if (
      offer.dynamicSubsidies &&
      Array.isArray(offer.dynamicSubsidies) &&
      offer.dynamicSubsidies.length > 0
    ) {
      const subsidies = offer.dynamicSubsidies
        .map((subsidy: any) => ({
          id: subsidy.id,
          conditionMetadata: subsidy.conditionMetadata || {
            amountMin: null,
            amountMax: null,
            pvMin: null,
            pvMax: null,
            termMin: null,
            termMax: null,
          },
          tolerance: subsidy.tolerance ?? 0.5,
          subsidyPercent: subsidy.subsidyPercent || 0,
          priority: subsidy.priority || 0,
          description: subsidy.description || "",
          isActive: subsidy.isActive !== undefined ? subsidy.isActive : true,
        }))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      setDynamicSubsidies(subsidies);
      setShowSubsidiesForm(true);
    } else {
      setDynamicSubsidies([
        {
          conditionMetadata: {
            amountMin: null,
            amountMax: null,
            pvMin: null,
            pvMax: null,
            termMin: null,
            termMax: null,
          },
          tolerance: 0.5,
          subsidyPercent: 0,
          priority: 1,
          description: "",
          isActive: true,
        },
      ]);
      setShowSubsidiesForm(false);
    }
  };

  // ============================================================
  // ОБРАБОТЧИКИ
  // ============================================================

  const handleChange = (field: keyof AdminOffer, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
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

  const isAllCompanyComplexesSelected = useMemo(() => {
    if (complexesByCompany.length === 0) return false;
    const selected = formData.complexes || [];
    return complexesByCompany.every((c) => selected.includes(c.name));
  }, [complexesByCompany, formData.complexes]);

  const handleToggleAllCompanyComplexes = () => {
    const selected = formData.complexes || [];
    const companyNames = complexesByCompany.map((c) => c.name);

    if (isAllCompanyComplexesSelected) {
      setFormData({
        ...formData,
        complexes: selected.filter((name) => !companyNames.includes(name)),
      });
    } else {
      const newSelected = new Set([...selected, ...companyNames]);
      setFormData({
        ...formData,
        complexes: Array.from(newSelected),
      });
    }
  };

  // ============================================================
  // 🔥 БЕЙДЖИ ОФФЕРА
  // ============================================================

  const addBadge = () => {
    if (!newBadge.trim()) return;
    const badges = formData.badges || [];
    if (badges.includes(newBadge.trim())) {
      alert("Такой бейдж уже добавлен");
      return;
    }
    setFormData({
      ...formData,
      badges: [...badges, newBadge.trim()],
    });
    setNewBadge("");
  };

  const removeBadge = (badgeToRemove: string) => {
    setFormData({
      ...formData,
      badges: (formData.badges || []).filter((b) => b !== badgeToRemove),
    });
  };

  const handleBadgeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBadge();
    }
  };

  const addPresetBadge = (preset: string) => {
    const badges = formData.badges || [];
    if (badges.includes(preset)) return;
    setFormData({
      ...formData,
      badges: [...badges, preset],
    });
  };

  // ============================================================
  // 🔥 DRAG-AND-DROP БЕЙДЖЕЙ
  // ============================================================

  const handleBadgeDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBadgeIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleBadgeDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverBadgeIndex(index);
  };

  const handleBadgeDragLeave = () => {
    setDragOverBadgeIndex(null);
  };

  const handleBadgeDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedBadgeIndex === null || draggedBadgeIndex === dropIndex) {
      setDraggedBadgeIndex(null);
      setDragOverBadgeIndex(null);
      return;
    }

    const badges = [...(formData.badges || [])];
    const [draggedItem] = badges.splice(draggedBadgeIndex, 1);
    badges.splice(dropIndex, 0, draggedItem);

    setFormData({ ...formData, badges });
    setDraggedBadgeIndex(null);
    setDragOverBadgeIndex(null);
  };

  const handleBadgeDragEnd = () => {
    setDraggedBadgeIndex(null);
    setDragOverBadgeIndex(null);
  };

  // ============================================================
  // ДИНАМИЧЕСКИЕ СТАВКИ/СУБСИДИИ
  // ============================================================

  const handleRateDelete = (rate: DynamicRate) => {
    if (rate.id) {
      adminApi
        .hardDeleteDynamicRate(rate.id)
        .then(() => console.log(`🗑️ Rate ${rate.id} deleted from DB`))
        .catch((error) =>
          console.error(`❌ Failed to delete rate ${rate.id}:`, error),
        );
    }
    setDynamicRates((prev) => prev.filter((r) => r.id !== rate.id));
  };

  const handleSubsidyDelete = (subsidy: DynamicSubsidy) => {
    if (subsidy.id) {
      adminApi
        .hardDeleteDynamicSubsidy(subsidy.id)
        .then(() => console.log(`🗑️ Subsidy ${subsidy.id} deleted from DB`))
        .catch((error) =>
          console.error(`❌ Failed to delete subsidy ${subsidy.id}:`, error),
        );
    }
    setDynamicSubsidies((prev) => prev.filter((s) => s.id !== subsidy.id));
  };

  const handleToggleRatesForm = () => {
    if (showRatesForm) {
      const rateIds = dynamicRates.filter((r) => r.id).map((r) => r.id);
      for (const id of rateIds) {
        if (id) {
          adminApi
            .hardDeleteDynamicRate(id)
            .then(() => console.log(`🗑️ Rate ${id} deleted from DB`))
            .catch((error) =>
              console.error(`❌ Failed to delete rate ${id}:`, error),
            );
        }
      }
      setDynamicRates([]);
      setRatesEditMode(false);
    } else {
      if (dynamicRates.length === 0) {
        setDynamicRates([
          {
            conditionMetadata: {
              amountMin: null,
              amountMax: null,
              pvMin: null,
              pvMax: null,
              termMin: null,
              termMax: null,
            },
            rate: 0,
            priority: 1,
            description: "",
            isActive: true,
          },
        ]);
      }
      setRatesEditMode(false);
    }
    setShowRatesForm(!showRatesForm);
  };

  const handleToggleSubsidiesForm = () => {
    if (showSubsidiesForm) {
      const subsidyIds = dynamicSubsidies.filter((s) => s.id).map((s) => s.id);
      for (const id of subsidyIds) {
        if (id) {
          adminApi
            .hardDeleteDynamicSubsidy(id)
            .then(() => console.log(`🗑️ Subsidy ${id} deleted from DB`))
            .catch((error) =>
              console.error(`❌ Failed to delete subsidy ${id}:`, error),
            );
        }
      }
      setDynamicSubsidies([]);
      setSubsidiesEditMode(false);
    } else {
      if (dynamicSubsidies.length === 0) {
        setDynamicSubsidies([
          {
            conditionMetadata: {
              amountMin: null,
              amountMax: null,
              pvMin: null,
              pvMax: null,
              termMin: null,
              termMax: null,
            },
            tolerance: 0.5,
            subsidyPercent: 0,
            priority: 1,
            description: "",
            isActive: true,
          },
        ]);
      }
      setSubsidiesEditMode(false);
    }
    setShowSubsidiesForm(!showSubsidiesForm);
  };

  const handleRatesEditToggle = () => {
    setRatesEditMode(!ratesEditMode);
  };

  const handleSubsidiesEditToggle = () => {
    setSubsidiesEditMode(!subsidiesEditMode);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankId) {
      newErrors.bankId = "Выберите банк";
    }
    if (!formData.programId) {
      newErrors.programId = "Выберите программу";
    }
    if (!formData.program || formData.program.trim() === "") {
      newErrors.program = "Введите название программы";
    }
    if (!formData.rate || formData.rate <= 0) {
      newErrors.rate = "Введите ставку (больше 0)";
    }
    if (!formData.minPVPercent || formData.minPVPercent < 0) {
      newErrors.minPVPercent = "Введите минимальный ПВ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // СОХРАНЕНИЕ
  // ============================================================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      let offer: AdminOffer;

      const offerData = {
        program: formData.program || "Новый оффер",
        rate: formData.rate || 0,
        twoRate: formData.twoRate || null,
        shortRate: formData.shortRate || null,
        subsidyPercent: formData.subsidyPercent || 0,
        minPVPercent: formData.minPVPercent || 20.1,
        durationMonths: formData.durationMonths || null,
        isTwoContracts: formData.isTwoContracts || false,
        isExcessLimit: formData.isExcessLimit || false,
        isTranche: formData.isTranche || false,
        trancheFirstPercent: formData.trancheFirstPercent || null,
        trancheSecondDate: formData.trancheSecondDate || null,
        complexes: formData.complexes || [],
        badges: formData.badges || [],
        subsidyCalculationMethod: formData.subsidyCalculationMethod || null,
        thresholdTolerance: formData.thresholdTolerance || null,
        thresholdToleranceType: formData.thresholdToleranceType || null,
        roundingStrategy: formData.roundingStrategy || null,
        description: formData.description || null,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        bankId: formData.bankId,
        programId: formData.programId,
        minLoanAmount: formData.minLoanAmount || null,
        maxLoanAmount: formData.maxLoanAmount || null,
        minLoanTerm: formData.minLoanTerm || null,
        maxLoanTerm: formData.maxLoanTerm || null,
      };

      if (isCreating) {
        offer = await adminApi.createOffer(offerData);
        await saveDynamicData(offer.id);
      } else if (editingOffer) {
        offer = await adminApi.updateOffer(editingOffer.id, offerData);
        await saveDynamicData(editingOffer.id);
      }

      onRefresh();
      onClose();
      alert(isCreating ? "✅ Оффер создан!" : "✅ Оффер обновлен!");
    } catch (error) {
      console.error("Error saving offer:", error);
      alert("❌ Ошибка при сохранении оффера");
    } finally {
      setLoading(false);
    }
  };

  const saveDynamicData = async (offerId: string) => {
    try {
      console.log("💾 Starting saveDynamicData for offer:", offerId);

      if (showRatesForm) {
        const existingRates = await adminApi.getOfferDynamicRates(offerId);
        const keptRateIds = dynamicRates.filter((r) => r.id).map((r) => r.id);

        for (const rate of existingRates) {
          if (rate.id && !keptRateIds.includes(rate.id)) {
            try {
              await adminApi.hardDeleteDynamicRate(rate.id);
            } catch (error) {
              console.error(`❌ Failed to delete rate ${rate.id}:`, error);
            }
          }
        }

        for (const rate of dynamicRates) {
          const isValid =
            rate.rate > 0 ||
            (rate.description && rate.description.trim() !== "");
          if (!isValid) continue;

          const rateData = {
            conditionMetadata: rate.conditionMetadata || {},
            rate: rate.rate,
            priority: rate.priority || 0,
            description: rate.description || "",
            isActive: true,
          };

          if (rate.id) {
            try {
              await adminApi.updateDynamicRate(rate.id, rateData);
            } catch (error) {
              console.error(`❌ Failed to update rate ${rate.id}:`, error);
            }
          } else {
            try {
              await adminApi.createDynamicRate(offerId, rateData);
            } catch (error) {
              console.error(`❌ Failed to create rate:`, error);
            }
          }
        }
      } else {
        const existingRates = await adminApi.getOfferDynamicRates(offerId);
        for (const rate of existingRates) {
          if (rate.id) {
            try {
              await adminApi.hardDeleteDynamicRate(rate.id);
            } catch (error) {
              console.error(`❌ Failed to delete rate ${rate.id}:`, error);
            }
          }
        }
      }

      if (showSubsidiesForm) {
        const existingSubsidies =
          await adminApi.getOfferDynamicSubsidies(offerId);
        const keptSubsidyIds = dynamicSubsidies
          .filter((s) => s.id)
          .map((s) => s.id);

        for (const subsidy of existingSubsidies) {
          if (subsidy.id && !keptSubsidyIds.includes(subsidy.id)) {
            try {
              await adminApi.hardDeleteDynamicSubsidy(subsidy.id);
            } catch (error) {
              console.error(
                `❌ Failed to delete subsidy ${subsidy.id}:`,
                error,
              );
            }
          }
        }

        for (const subsidy of dynamicSubsidies) {
          const isValid =
            subsidy.subsidyPercent > 0 ||
            (subsidy.description && subsidy.description.trim() !== "");
          if (!isValid) continue;

          const subsidyData = {
            conditionMetadata: subsidy.conditionMetadata || {},
            tolerance: subsidy.tolerance || 0,
            subsidyPercent: subsidy.subsidyPercent,
            priority: subsidy.priority || 0,
            description: subsidy.description || "",
            isActive: true,
          };

          if (subsidy.id) {
            try {
              await adminApi.updateDynamicSubsidy(subsidy.id, subsidyData);
            } catch (error) {
              console.error(
                `❌ Failed to update subsidy ${subsidy.id}:`,
                error,
              );
            }
          } else {
            try {
              await adminApi.createDynamicSubsidy(offerId, subsidyData);
            } catch (error) {
              console.error(`❌ Failed to create subsidy:`, error);
            }
          }
        }
      } else {
        const existingSubsidies =
          await adminApi.getOfferDynamicSubsidies(offerId);
        for (const subsidy of existingSubsidies) {
          if (subsidy.id) {
            try {
              await adminApi.hardDeleteDynamicSubsidy(subsidy.id);
            } catch (error) {
              console.error(
                `❌ Failed to delete subsidy ${subsidy.id}:`,
                error,
              );
            }
          }
        }
      }

      console.log("✅ All dynamic data saved successfully!");
    } catch (error) {
      console.error("❌ Error saving dynamic data:", error);
      throw error;
    }
  };

  // ============================================================
  // РЕНДЕР
  // ============================================================

  if (!isOpen) return null;

  const activeBanks = banks.filter((b) => b.isActive);
  const activePrograms = programs.filter((p) => p.isActive);
  const isBankLocked = isCreating && selectedBankId;
  const selectedBankName = banks.find((b) => b.id === selectedBankId)?.name;

  const getTwoContractsLabel = () => {
    if (isFamily) return "Семейная ипотека (2 договора)";
    if (isIT) return "ИТ ипотека (2 договора)";
    return "2 договора";
  };

  const selectedComplexesCount = (formData.complexes || []).length;
  const badgesCount = (formData.badges || []).length;

  const presetBadges = [
    "🔥 Акции",
    "⭐ Спецпредложение",
    "🎁 Бонус",
    "⚡ Ограниченное время",
    "🏆 Лучшая ставка",
  ];

  return (
    <div className="modal-overlay modal-fullscreen" onClick={onClose}>
      <div
        className="modal-content modal-fullscreen-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isCreating ? "➕ Создать оффер" : "✏️ Редактировать оффер"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-form-grid">
            {/* Статус */}
            <div className="form-group">
              <label htmlFor="isActive" className="form-label">
                Статус
              </label>
              <select
                id="isActive"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  handleChange("isActive", e.target.value === "active")
                }
                className="admin-select"
              >
                <option value="active">✅ Активен</option>
                <option value="inactive">❌ Неактивен</option>
              </select>
            </div>

            {/* Банк */}
            <div className="form-group">
              <label htmlFor="bankId" className="form-label required">
                Банк
              </label>
              {isBankLocked ? (
                <div className="bank-locked">
                  <span className="bank-locked-icon">🏦</span>
                  <span className="bank-locked-name">
                    {selectedBankName || "Банк не выбран"}
                  </span>
                  <span className="bank-locked-badge">🔒</span>
                  <input type="hidden" value={formData.bankId || ""} />
                </div>
              ) : (
                <select
                  id="bankId"
                  value={formData.bankId || ""}
                  onChange={(e) => handleChange("bankId", e.target.value)}
                  className={`form-select ${errors.bankId ? "error" : ""}`}
                >
                  <option value="">Выберите банк</option>
                  {activeBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.bankId && (
                <span className="form-error">{errors.bankId}</span>
              )}
              {isBankLocked && (
                <span className="form-hint">
                  Банк выбран из вкладки и не может быть изменен
                </span>
              )}
            </div>

            {/* Программа */}
            <div className="form-group">
              <label htmlFor="programId" className="form-label required">
                Программа
              </label>
              <select
                id="programId"
                value={formData.programId || ""}
                onChange={(e) => handleChange("programId", e.target.value)}
                className={`form-select ${errors.programId ? "error" : ""}`}
              >
                <option value="">Выберите программу</option>
                {activePrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.label}
                  </option>
                ))}
              </select>
              {errors.programId && (
                <span className="form-error">{errors.programId}</span>
              )}
            </div>

            {/* Название оффера */}
            <div className="form-group">
              <label htmlFor="program" className="form-label required">
                Название оффера
              </label>
              <input
                id="program"
                type="text"
                value={formData.program || ""}
                onChange={(e) => handleChange("program", e.target.value)}
                className={`form-input ${errors.program ? "error" : ""}`}
                placeholder="Например: Ипотека с господдержкой"
              />
              {errors.program && (
                <span className="form-error">{errors.program}</span>
              )}
            </div>

            {/* Опции для семейной и ИТ ипотеки */}
            {isFamilyOrIT && (
              <div className="form-group form-checkboxes full-width">
                <label className="form-label">Опции</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isTwoContracts || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          handleChange("isExcessLimit", false);
                        }
                        handleChange("isTwoContracts", checked);
                      }}
                    />
                    {getTwoContractsLabel()}
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isExcessLimit || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          handleChange("isTwoContracts", false);
                        }
                        handleChange("isExcessLimit", checked);
                      }}
                    />
                    Сверхлимит
                  </label>
                </div>
              </div>
            )}

            {/* Поля для траншевой ипотеки */}
            {isTranche && (
              <>
                <div className="form-group">
                  <label htmlFor="trancheFirstPercent" className="form-label">
                    Первый транш (%)
                  </label>
                  <input
                    id="trancheFirstPercent"
                    type="number"
                    step="0.01"
                    value={formData.trancheFirstPercent || ""}
                    onChange={(e) =>
                      handleChange(
                        "trancheFirstPercent",
                        parseFloat(e.target.value) || null,
                      )
                    }
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="trancheSecondDate" className="form-label">
                    Дата второго транша
                  </label>
                  <input
                    id="trancheSecondDate"
                    type="date"
                    value={formData.trancheSecondDate || ""}
                    onChange={(e) =>
                      handleChange("trancheSecondDate", e.target.value || null)
                    }
                    className="admin-input"
                  />
                </div>
              </>
            )}

            {/* Ставка */}
            <div className="form-group full-width">
              <div className="field-with-action">
                <div className="field-with-action-left">
                  <label htmlFor="rate" className="form-label required">
                    Ставка (%)
                  </label>
                  <input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate || ""}
                    onChange={(e) =>
                      handleChange("rate", parseFloat(e.target.value) || 0)
                    }
                    className={`form-input ${errors.rate ? "error" : ""}`}
                    placeholder="0.00"
                  />
                  {errors.rate && (
                    <span className="form-error">{errors.rate}</span>
                  )}
                </div>
                <div className="field-with-action-right">
                  <button
                    type="button"
                    onClick={handleToggleRatesForm}
                    className={`action-btn ${showRatesForm ? "active" : ""}`}
                  >
                    📊 {showRatesForm ? "Убрать" : "Добавить"} динамическую
                    ставку
                  </button>
                </div>
              </div>
            </div>

            {/* Двухставочная ставка */}
            {isFamilyOrIT && isTwoContracts && (
              <div className="form-group full-width">
                <div className="field-with-action">
                  <div className="field-with-action-left">
                    <label htmlFor="twoRate" className="form-label">
                      Ставка по второму договору(%)
                    </label>
                    <input
                      id="twoRate"
                      type="number"
                      step="0.01"
                      value={formData.twoRate || ""}
                      onChange={(e) =>
                        handleChange(
                          "twoRate",
                          parseFloat(e.target.value) || null,
                        )
                      }
                      className="admin-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="field-with-action-right" />
                </div>
              </div>
            )}

            {/* Субсидия */}
            <div className="form-group full-width">
              <div className="field-with-action">
                <div className="field-with-action-left">
                  <label htmlFor="subsidyPercent" className="form-label">
                    Субсидия (%)
                  </label>
                  <input
                    id="subsidyPercent"
                    type="number"
                    step="0.01"
                    value={formData.subsidyPercent || ""}
                    onChange={(e) =>
                      handleChange(
                        "subsidyPercent",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="admin-input"
                    placeholder="0.00"
                  />
                </div>
                <div className="field-with-action-right">
                  <button
                    type="button"
                    onClick={handleToggleSubsidiesForm}
                    className={`action-btn ${showSubsidiesForm ? "active" : ""}`}
                  >
                    💰 {showSubsidiesForm ? "Убрать" : "Добавить"} динамическую
                    субсидию
                  </button>
                </div>
              </div>
            </div>

            {/* Минимальный ПВ */}
            <div className="form-group">
              <label htmlFor="minPVPercent" className="form-label required">
                Минимальный ПВ (%)
              </label>
              <input
                id="minPVPercent"
                type="number"
                step="0.1"
                value={formData.minPVPercent || ""}
                onChange={(e) =>
                  handleChange(
                    "minPVPercent",
                    parseFloat(e.target.value) || 20.1,
                  )
                }
                className={`form-input ${errors.minPVPercent ? "error" : ""}`}
                placeholder="20.1"
              />
              {errors.minPVPercent && (
                <span className="form-error">{errors.minPVPercent}</span>
              )}
            </div>

            {/* Срок субсидированной ставки */}
            {isShortTerm && (
              <div className="form-group">
                <label htmlFor="durationMonths" className="form-label">
                  Срок субсидированной ставки (мес.)
                </label>
                <input
                  id="durationMonths"
                  type="number"
                  value={formData.durationMonths || ""}
                  onChange={(e) =>
                    handleChange(
                      "durationMonths",
                      parseInt(e.target.value) || null,
                    )
                  }
                  className="admin-input"
                  placeholder="Например: 36"
                />
                <span className="form-hint">
                  Период, в течение которого действует субсидированная ставка
                </span>
              </div>
            )}

            {/* Короткий срок */}
            {isShortTerm && (
              <div className="form-group">
                <label htmlFor="shortRate" className="form-label">
                  Короткий срок (%)
                </label>
                <input
                  id="shortRate"
                  type="number"
                  step="0.01"
                  value={formData.shortRate || ""}
                  onChange={(e) =>
                    handleChange(
                      "shortRate",
                      parseFloat(e.target.value) || null,
                    )
                  }
                  className="admin-input"
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Метод расчета субсидии */}
            {isShortTerm && (
              <div className="form-group full-width">
                <label className="form-label">
                  Метод расчета платежа в субсидированный период
                </label>
                <div className="subsidy-method-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="subsidyCalculationMethod"
                      value="onlyPercent"
                      checked={
                        formData.subsidyCalculationMethod === "onlyPercent"
                      }
                      onChange={(e) =>
                        handleChange("subsidyCalculationMethod", e.target.value)
                      }
                    />
                    <span className="radio-content">
                      <span className="radio-title">Только проценты</span>
                      <span className="radio-description">
                        В субсидированный период платятся только проценты, тело
                        кредита не погашается
                      </span>
                    </span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="subsidyCalculationMethod"
                      value="standard"
                      checked={formData.subsidyCalculationMethod === "standard"}
                      onChange={(e) =>
                        handleChange("subsidyCalculationMethod", e.target.value)
                      }
                    />
                    <span className="radio-content">
                      <span className="radio-title">Стандартный аннуитет</span>
                      <span className="radio-description">
                        В субсидированный период применяется стандартный
                        аннуитетный платеж
                      </span>
                    </span>
                  </label>
                </div>
                <span className="form-hint">
                  Выберите метод расчета ежемесячного платежа на период действия
                  субсидии
                </span>
              </div>
            )}

            {/* 🔥 ПАРАМЕТРЫ КРЕДИТА */}
            <div className="form-group full-width">
              <label className="form-label">Параметры кредита</label>
              <div className="loan-params-grid">
                <div className="form-group">
                  <label
                    htmlFor="minLoanAmount"
                    className="form-label form-label-sm"
                  >
                    Сумма от (₽)
                  </label>
                  <input
                    id="minLoanAmount"
                    type="number"
                    min={0}
                    step={100000}
                    value={formData.minLoanAmount || ""}
                    onChange={(e) =>
                      handleChange(
                        "minLoanAmount",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="form-input"
                    placeholder="Например: 1 000 000"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="maxLoanAmount"
                    className="form-label form-label-sm"
                  >
                    Сумма до (₽)
                  </label>
                  <input
                    id="maxLoanAmount"
                    type="number"
                    min={0}
                    step={100000}
                    value={formData.maxLoanAmount || ""}
                    onChange={(e) =>
                      handleChange(
                        "maxLoanAmount",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="form-input"
                    placeholder="Например: 8 000 000"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="minLoanTerm"
                    className="form-label form-label-sm"
                  >
                    Срок от (мес.)
                  </label>
                  <input
                    id="minLoanTerm"
                    type="number"
                    min={1}
                    step={1}
                    value={formData.minLoanTerm || ""}
                    onChange={(e) =>
                      handleChange(
                        "minLoanTerm",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="form-input"
                    placeholder="Например: 12"
                  />
                </div>

                <div className="form-group">
                  <label
                    htmlFor="maxLoanTerm"
                    className="form-label form-label-sm"
                  >
                    Срок до (мес.)
                  </label>
                  <input
                    id="maxLoanTerm"
                    type="number"
                    min={1}
                    step={1}
                    value={formData.maxLoanTerm || ""}
                    onChange={(e) =>
                      handleChange(
                        "maxLoanTerm",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="form-input"
                    placeholder="Например: 360"
                  />
                </div>
              </div>
              <span className="form-hint">
                Укажите диапазон суммы и срока кредита, на который клиент может
                взять оффер. Оставьте пустым, если ограничений нет.
              </span>
            </div>

            {/* Описание */}
            <div className="form-group full-width">
              <label htmlFor="description" className="form-label">
                Описание
              </label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Дополнительная информация..."
              />
            </div>

            {/* 🔥 ЖИЛЫЕ КОМПЛЕКСЫ С ТАБАМИ ПО КОМПАНИЯМ */}
            <div className="form-group full-width">
              <label className="form-label">
                Жилые комплексы
                {selectedComplexesCount > 0 && (
                  <span className="complexes-selected-count">
                    {" "}
                    (выбрано: {selectedComplexesCount})
                  </span>
                )}
              </label>

              {companiesWithComplexes.length > 0 ? (
                <>
                  <Tabs
                    tabs={companyTabs}
                    selectedId={selectedCompanyId}
                    onSelect={setSelectedCompanyId}
                    emptyMessage="😕 Нет компаний с ЖК"
                    emptyHint="Создайте компанию и ЖК в соответствующих разделах"
                  />

                  {complexesByCompany.length > 0 ? (
                    <div className="complexes-grid">
                      <label
                        className={`checkbox-label checkbox-label-all ${
                          isAllCompanyComplexesSelected ? "checked" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleAllCompanyComplexes();
                        }}
                      >
                        <span className="select-all-icon">
                          {isAllCompanyComplexesSelected ? "☑️" : "☐"}
                        </span>
                        <span className="select-all-text">
                          {isAllCompanyComplexesSelected
                            ? "Снять все"
                            : "Выбрать все"}
                        </span>
                      </label>

                      {complexesByCompany.map((complex) => (
                        <label
                          key={complex.id}
                          className={`checkbox-label ${
                            (formData.complexes || []).includes(complex.name)
                              ? "checked"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={(formData.complexes || []).includes(
                              complex.name,
                            )}
                            onChange={() => handleComplexToggle(complex.name)}
                          />
                          {complex.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="complexes-empty">
                      <p>У этой компании нет ЖК</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="complexes-empty">
                  <p>Нет доступных жилых комплексов</p>
                </div>
              )}
            </div>

            {/* 🔥 БЕЙДЖИ ОФФЕРА */}
            <div className="form-group full-width badges-in-modal">
              <div className="badges-header">
                <label className="form-label">
                  🏷️ Бейджи оффера
                  {badgesCount > 0 && (
                    <span className="complexes-selected-count">
                      {" "}
                      (добавлено: {badgesCount})
                    </span>
                  )}
                </label>
              </div>

              <div className="badges-input">
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  onKeyPress={handleBadgeKeyPress}
                  placeholder="Например: 💳 Условия оплаты"
                  className="form-input"
                  maxLength={100}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addBadge}
                  disabled={!newBadge.trim() || loading}
                  className="admin-btn admin-btn-primary admin-btn-sm"
                >
                  Добавить
                </button>
              </div>

              {formData.badges && formData.badges.length > 0 ? (
                <div className="badges-list">
                  {formData.badges.map((badge, index) => (
                    <div
                      key={`${badge}-${index}`}
                      className={`badge-item ${
                        draggedBadgeIndex === index ? "dragging" : ""
                      } ${dragOverBadgeIndex === index ? "drag-over" : ""}`}
                      draggable
                      onDragStart={(e) => handleBadgeDragStart(e, index)}
                      onDragOver={(e) => handleBadgeDragOver(e, index)}
                      onDragLeave={handleBadgeDragLeave}
                      onDrop={(e) => handleBadgeDrop(e, index)}
                      onDragEnd={handleBadgeDragEnd}
                      title="Перетащите, чтобы изменить порядок"
                    >
                      <span className="badge-drag-handle" title="Перетащить">
                        ⠿
                      </span>
                      <span className="badge-order">{index + 1}</span>
                      <span className="badge-text">{badge}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBadge(badge);
                        }}
                        className="badge-remove"
                        title="Удалить бейдж"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="badges-empty">
                  <p>
                    Нет бейджей. Добавьте вручную или выберите из пресетов ниже.
                  </p>
                </div>
              )}

              <div className="badges-presets">
                <span className="presets-label">Быстрый выбор:</span>
                {presetBadges.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addPresetBadge(preset)}
                    disabled={
                      (formData.badges || []).includes(preset) || loading
                    }
                    className="badge-preset-btn"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-divider" />

          {showRatesForm && (
            <DynamicRatesForm
              rates={dynamicRates}
              onRatesChange={setDynamicRates}
              onRateDelete={handleRateDelete}
              isEditMode={ratesEditMode}
              onEditModeToggle={handleRatesEditToggle}
            />
          )}

          {showSubsidiesForm && (
            <DynamicSubsidiesForm
              subsidies={dynamicSubsidies}
              onSubsidiesChange={setDynamicSubsidies}
              onSubsidyDelete={handleSubsidyDelete}
              isEditMode={subsidiesEditMode}
              onEditModeToggle={handleSubsidiesEditToggle}
            />
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="admin-btn admin-btn-secondary"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="admin-btn admin-btn-success"
            disabled={loading}
          >
            {loading
              ? "⏳ Сохранение..."
              : `💾 ${isCreating ? "Создать" : "Сохранить"}`}
          </button>
        </div>
      </div>
    </div>
  );
};
