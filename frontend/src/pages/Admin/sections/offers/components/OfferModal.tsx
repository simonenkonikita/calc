// frontend/src/pages/Admin/sections/offers/components/OfferModal.tsx

import React, { useState, useEffect } from "react";
import {
  AdminOffer,
  AdminBank,
  AdminProgram,
  AdminComplex,
} from "../../../types/admin.types";
import { DynamicRate, DynamicSubsidy } from "../types";
import { DynamicRatesForm } from "./DynamicRatesForm";
import { DynamicSubsidiesForm } from "./DynamicSubsidiesForm";
import adminApi from "../../../../../services/adminApi";
import "./OfferModal.css";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreating: boolean;
  editingOffer: AdminOffer | null;
  banks: AdminBank[];
  programs: AdminProgram[];
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialOfferId, setInitialOfferId] = useState<string | null>(null);

  const selectedProgram = programs.find((p) => p.id === formData.programId);
  const programType = selectedProgram?.type || "";
  const isFamily = programType === "family";
  const isIT = programType === "it";
  const isFamilyOrIT = isFamily || isIT;
  const isShortTerm = programType === "short";
  const isTranche = programType === "tranche";
  const isTwoContracts = formData.isTwoContracts || false;

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
        excessLimit: false,
        isTranche: false,
        trancheFirstPercent: null,
        trancheSecondDate: null,
        complexes: [],
        subsidyCalculationMethod: "standard",
        thresholdTolerance: null,
        thresholdToleranceType: null,
        roundingStrategy: null,
        minLoanTermYears: null,
        description: "",
        isActive: true,
        bankId: initialBankId,
        programId: "",
      });

      resetDynamicForms();
      setShowRatesForm(false);
      setShowSubsidiesForm(false);
      setErrors({});
      setInitialOfferId(null);
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
        excessLimit: editingOffer.excessLimit,
        isTranche: editingOffer.isTranche,
        trancheFirstPercent: editingOffer.trancheFirstPercent,
        trancheSecondDate: editingOffer.trancheSecondDate,
        complexes: editingOffer.complexes || [],
        subsidyCalculationMethod:
          editingOffer.subsidyCalculationMethod || "standard",
        thresholdTolerance: editingOffer.thresholdTolerance,
        thresholdToleranceType: editingOffer.thresholdToleranceType,
        roundingStrategy: editingOffer.roundingStrategy,
        minLoanTermYears: editingOffer.minLoanTermYears,
        description: editingOffer.description,
        isActive: editingOffer.isActive,
        bankId: editingOffer.bankId,
        programId: editingOffer.programId,
      });

      loadDynamicDataFromOffer(editingOffer);
      setErrors({});
      setInitialOfferId(editingOffer.id);
    }
  }, [isCreating, editingOffer, selectedBankId]);

  // Сброс флагов при смене программы
  useEffect(() => {
    if (!isFamilyOrIT) {
      setFormData((prev) => ({
        ...prev,
        isTwoContracts: false,
        excessLimit: false,
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
        priority: 0,
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
        priority: 0,
        description: "",
        isActive: true,
      },
    ]);
  };

  const loadDynamicDataFromOffer = (offer: AdminOffer) => {
    console.log("📊 Loading dynamic data from offer:", offer);

    // 1. Загружаем динамические ставки
    if (
      offer.dynamicRates &&
      Array.isArray(offer.dynamicRates) &&
      offer.dynamicRates.length > 0
    ) {
      const rates = offer.dynamicRates.map((rate: any) => ({
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
      }));

      setDynamicRates(rates);
      setShowRatesForm(true);
      console.log(`📊 Loaded ${rates.length} dynamic rates`);
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
          priority: 0,
          description: "",
          isActive: true,
        },
      ]);
      setShowRatesForm(false);
    }

    // 2. Загружаем динамические субсидии
    if (
      offer.dynamicSubsidies &&
      Array.isArray(offer.dynamicSubsidies) &&
      offer.dynamicSubsidies.length > 0
    ) {
      const subsidies = offer.dynamicSubsidies.map((subsidy: any) => ({
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
      }));

      setDynamicSubsidies(subsidies);
      setShowSubsidiesForm(true);
      console.log(`📊 Loaded ${subsidies.length} dynamic subsidies`);
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
          priority: 0,
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
        adminApi
          .hardDeleteDynamicRate(id)
          .then(() => console.log(`🗑️ Rate ${id} deleted from DB`))
          .catch((error) =>
            console.error(`❌ Failed to delete rate ${id}:`, error),
          );
      }
      setDynamicRates([]);
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
            priority: 0,
            description: "",
            isActive: true,
          },
        ]);
      }
    }
    setShowRatesForm(!showRatesForm);
  };

  const handleToggleSubsidiesForm = () => {
    if (showSubsidiesForm) {
      const subsidyIds = dynamicSubsidies.filter((s) => s.id).map((s) => s.id);
      for (const id of subsidyIds) {
        adminApi
          .hardDeleteDynamicSubsidy(id)
          .then(() => console.log(`🗑️ Subsidy ${id} deleted from DB`))
          .catch((error) =>
            console.error(`❌ Failed to delete subsidy ${id}:`, error),
          );
      }
      setDynamicSubsidies([]);
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
            priority: 0,
            description: "",
            isActive: true,
          },
        ]);
      }
    }
    setShowSubsidiesForm(!showSubsidiesForm);
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
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        bankId: formData.bankId,
        programId: formData.programId,
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

      // ============================================================
      // 1. СОХРАНЯЕМ СТАВКИ
      // ============================================================
      if (showRatesForm) {
        const existingRates = await adminApi.getOfferDynamicRates(offerId);
        const keptRateIds = dynamicRates.filter((r) => r.id).map((r) => r.id);

        for (const rate of existingRates) {
          if (rate.id && !keptRateIds.includes(rate.id)) {
            try {
              await adminApi.hardDeleteDynamicRate(rate.id);
              console.log(`🗑️ Deleted orphan rate ${rate.id}`);
            } catch (error) {
              console.error(`❌ Failed to delete rate ${rate.id}:`, error);
            }
          }
        }

        let createdCount = 0;
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
              console.log(`✅ Updated rate ${rate.id}: ${rate.rate}%`);
            } catch (error) {
              console.error(`❌ Failed to update rate ${rate.id}:`, error);
            }
          } else {
            try {
              const created = await adminApi.createDynamicRate(
                offerId,
                rateData,
              );
              createdCount++;
              console.log(`✅ Created rate ${created.id}: ${rate.rate}%`);
            } catch (error) {
              console.error(`❌ Failed to create rate:`, error);
            }
          }
        }
        console.log(
          `📊 Processed rates: ${createdCount} new, ${dynamicRates.filter((r) => r.id).length} existing`,
        );
      } else {
        const existingRates = await adminApi.getOfferDynamicRates(offerId);
        for (const rate of existingRates) {
          if (rate.id) {
            try {
              await adminApi.hardDeleteDynamicRate(rate.id);
              console.log(`🗑️ Deleted rate ${rate.id}`);
            } catch (error) {
              console.error(`❌ Failed to delete rate ${rate.id}:`, error);
            }
          }
        }
      }

      // ============================================================
      // 2. СОХРАНЯЕМ СУБСИДИИ
      // ============================================================
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
              console.log(`🗑️ Deleted orphan subsidy ${subsidy.id}`);
            } catch (error) {
              console.error(
                `❌ Failed to delete subsidy ${subsidy.id}:`,
                error,
              );
            }
          }
        }

        let createdCount = 0;
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
              console.log(
                `✅ Updated subsidy ${subsidy.id}: ${subsidy.subsidyPercent}%`,
              );
            } catch (error) {
              console.error(
                `❌ Failed to update subsidy ${subsidy.id}:`,
                error,
              );
            }
          } else {
            try {
              const created = await adminApi.createDynamicSubsidy(
                offerId,
                subsidyData,
              );
              createdCount++;
              console.log(
                `✅ Created subsidy ${created.id}: ${subsidy.subsidyPercent}%`,
              );
            } catch (error) {
              console.error(`❌ Failed to create subsidy:`, error);
            }
          }
        }
        console.log(
          `📊 Processed subsidies: ${createdCount} new, ${dynamicSubsidies.filter((s) => s.id).length} existing`,
        );
      } else {
        const existingSubsidies =
          await adminApi.getOfferDynamicSubsidies(offerId);
        for (const subsidy of existingSubsidies) {
          if (subsidy.id) {
            try {
              await adminApi.hardDeleteDynamicSubsidy(subsidy.id);
              console.log(`🗑️ Deleted subsidy ${subsidy.id}`);
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
                className="form-select"
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
                          handleChange("excessLimit", false);
                        }
                        handleChange("isTwoContracts", checked);
                      }}
                    />
                    {getTwoContractsLabel()}
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.excessLimit || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          handleChange("isTwoContracts", false);
                        }
                        handleChange("excessLimit", checked);
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
                    className="form-input"
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
                    className="form-input"
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
                      className="form-input"
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
                    className="form-input"
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
                  className="form-input"
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
                  className="form-input"
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

            {/* Жилые комплексы */}
            <div className="form-group full-width">
              <label className="form-label">Жилые комплексы</label>
              <div className="complexes-grid">
                {complexes.map((complex) => (
                  <label key={complex.id} className="checkbox-label">
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
            </div>
          </div>

          <div className="modal-divider" />

          {/* Динамические формы */}
          {showRatesForm && (
            <DynamicRatesForm
              rates={dynamicRates}
              onRatesChange={setDynamicRates}
              onRateDelete={handleRateDelete}
            />
          )}

          {showSubsidiesForm && (
            <DynamicSubsidiesForm
              subsidies={dynamicSubsidies}
              onSubsidiesChange={setDynamicSubsidies}
              onSubsidyDelete={handleSubsidyDelete}
            />
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="admin-btn-secondary"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="admin-btn-success"
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
