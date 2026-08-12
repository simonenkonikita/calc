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

  // 🔥 Определяем тип программы по programId
  const selectedProgram = programs.find((p) => p.id === formData.programId);
  const programType = selectedProgram?.type || "";
  const programLabel = selectedProgram?.label || "";

  // 🔥 Проверки для отображения полей
  const isFamily = programType === "family";
  const isIT = programType === "it";
  const isFamilyOrIT = isFamily || isIT;
  const isShortTerm = programType === "short";
  const isTranche = programType === "tranche";
  const isTwoContracts = formData.isTwoContracts || false;

  // Инициализация формы
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
        subsidyCalculationMethod: null,
        thresholdTolerance: null,
        thresholdToleranceType: null,
        roundingStrategy: null,
        minLoanTermYears: null,
        description: "",
        isActive: true,
        bankId: initialBankId,
        programId: "",
      });
      setShowRatesForm(false);
      setShowSubsidiesForm(false);
      resetDynamicForms();
      setErrors({});
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
        subsidyCalculationMethod: editingOffer.subsidyCalculationMethod,
        thresholdTolerance: editingOffer.thresholdTolerance,
        thresholdToleranceType: editingOffer.thresholdToleranceType,
        roundingStrategy: editingOffer.roundingStrategy,
        minLoanTermYears: editingOffer.minLoanTermYears,
        description: editingOffer.description,
        isActive: editingOffer.isActive,
        bankId: editingOffer.bankId,
        programId: editingOffer.programId,
      });
      if (editingOffer.id) {
        loadDynamicData(editingOffer.id);
      }
      setErrors({});
    }
  }, [isCreating, editingOffer, selectedBankId]);

  // 🔥 Эффект для сброса флагов при смене программы
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
  }, [programType, isFamilyOrIT, isTranche]);

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

  const loadDynamicData = async (offerId: string) => {
    try {
      const [rates, subsidies] = await Promise.all([
        adminApi.getOfferRates(offerId),
        adminApi.getOfferSubsidies(offerId),
      ]);
      if (rates && rates.length > 0) {
        setDynamicRates(rates);
        setShowRatesForm(true);
      }
      if (subsidies && subsidies.length > 0) {
        setDynamicSubsidies(subsidies);
        setShowSubsidiesForm(true);
      }
    } catch (error) {
      console.error("Error loading dynamic data:", error);
    }
  };

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

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      let offer: AdminOffer;

      if (isCreating) {
        offer = await adminApi.createOffer({
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

        await createDynamicData(offer.id);
      } else if (editingOffer) {
        offer = await adminApi.updateOffer(editingOffer.id, formData);
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

  const createDynamicData = async (offerId: string) => {
    try {
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
            await adminApi.createDynamicRate(offerId, rateData);
          }
        }
      }

      if (showSubsidiesForm) {
        for (const subsidy of dynamicSubsidies) {
          if (subsidy.subsidyPercent > 0) {
            await adminApi.createDynamicSubsidy(offerId, {
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
    } catch (error) {
      console.error("Error creating dynamic data:", error);
    }
  };

  if (!isOpen) return null;

  const activeBanks = banks.filter((b) => b.isActive);
  const activePrograms = programs.filter((p) => p.isActive);

  const isBankLocked = isCreating && selectedBankId;
  const selectedBankName = banks.find((b) => b.id === selectedBankId)?.name;

  // 🔥 Получаем текст для чекбокса "2 договора"
  const getTwoContractsLabel = () => {
    if (isFamily) return "Семейная ипотека (2 договора)";
    if (isIT) return "ИТ ипотека (2 договора)";
    return "2 договора";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isCreating ? "➕ Создать оффер" : "✏️ Редактировать оффер"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-form-grid">
            {/* Статус - только при редактировании */}
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

            {/* 🔥 Опции - только для семейной и ИТ ипотеки */}
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
                        // 🔥 Если включаем 2 договора - снимаем сверхлимит
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
                        // 🔥 Если включаем сверхлимит - снимаем 2 договора
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

            {/* 🔥 Поля для траншевой ипотеки */}
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

            {/* 🔥 Ставка */}
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
                    onClick={() => setShowRatesForm(!showRatesForm)}
                    className={`action-btn ${showRatesForm ? "active" : ""}`}
                  >
                    📊 {showRatesForm ? "Скрыть" : "Добавить"} динамическую
                    ставку
                  </button>
                </div>
              </div>
            </div>

            {/* 🔥 Двухставочная ставка - сразу под ставкой, если включен 2 договора */}
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
                  <div className="field-with-action-right">
                    {/* Пустой блок для выравнивания */}
                  </div>
                </div>
              </div>
            )}

            {/* Субсидия с кнопкой динамической субсидии */}
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
                    onClick={() => setShowSubsidiesForm(!showSubsidiesForm)}
                    className={`action-btn ${showSubsidiesForm ? "active" : ""}`}
                  >
                    💰 {showSubsidiesForm ? "Скрыть" : "Добавить"} динамическую
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

            {/* Срок кредита */}
            <div className="form-group">
              <label htmlFor="durationMonths" className="form-label">
                Срок кредита (мес.)
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
                placeholder="Например: 360"
              />
            </div>

            {/* Короткий срок - только для программы short */}
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

            {/* ЖК */}
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

          <div className="modal-divider"></div>

          {/* Динамические формы */}
          {showRatesForm && (
            <DynamicRatesForm
              rates={dynamicRates}
              onRatesChange={setDynamicRates}
            />
          )}

          {showSubsidiesForm && (
            <DynamicSubsidiesForm
              subsidies={dynamicSubsidies}
              onSubsidiesChange={setDynamicSubsidies}
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
