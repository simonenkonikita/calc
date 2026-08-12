// frontend/src/pages/Admin/sections/offers/components/OfferModal.tsx

import React, { useState, useEffect } from "react";
import { AdminOffer, AdminBank, AdminProgram, AdminComplex } from "../../../types/admin.types";
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
}) => {
  const [formData, setFormData] = useState<Partial<AdminOffer>>({});
  const [dynamicRates, setDynamicRates] = useState<DynamicRate[]>([]);
  const [dynamicSubsidies, setDynamicSubsidies] = useState<DynamicSubsidy[]>([]);
  const [showRatesForm, setShowRatesForm] = useState(false);
  const [showSubsidiesForm, setShowSubsidiesForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCreating) {
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
      setShowRatesForm(false);
      setShowSubsidiesForm(false);
      resetDynamicForms();
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
    }
  }, [isCreating, editingOffer]);

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

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.bankId || !formData.programId || !formData.rate || !formData.minPVPercent) {
        alert("Заполните все обязательные поля");
        setLoading(false);
        return;
      }

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

        // Создаем динамические ставки и субсидии
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
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isCreating ? "➕ Создать оффер" : "✏️ Редактировать оффер"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Форма - сокращена для краткости, можно взять из предыдущей версии */}
          <div className="modal-form-grid">
            {/* ... поля формы ... */}
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
          <button onClick={onClose} className="admin-btn-secondary" disabled={loading}>
            Отмена
          </button>
          <button onClick={handleSubmit} className="admin-btn-success" disabled={loading}>
            {loading ? "⏳ Сохранение..." : `💾 ${isCreating ? "Создать" : "Сохранить"}`}
          </button>
        </div>
      </div>
    </div>
  );
};