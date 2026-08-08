// backend/src/controllers/admin.controller.ts

import { Request, Response } from "express";

import { housingPrices } from "../data/complexPrice/complexPriceData";

import { DEPOSIT_AMOUNT } from "../data/complexPrice/CONSTRUCTION";
import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
  PROGRAM_TYPES,
} from "../data/banks/constants";
import { bankOffers } from "../data/banks";

// ============================================================
// 🔥 БАНКИ (из BANK_NAMES и BASE_RATES)
// ============================================================
export const getBanks = (req: Request, res: Response) => {
  try {
    const banks = Object.entries(BANK_NAMES).map(([key, name], index) => ({
      id: String(index + 1),
      name,
      baseRate: BASE_RATES[key as keyof typeof BASE_RATES] || 0,
      minPVPercent: MIN_PV_PERCENT,
      isActive: true,
      order: index,
    }));
    res.json(banks);
  } catch (error) {
    console.error("Error getting banks:", error);
    res.status(500).json({ error: "Failed to get banks" });
  }
};

// ============================================================
// 🔥 ЖК (из housingPrices)
// ============================================================
export const getComplexes = (req: Request, res: Response) => {
  try {
    const complexMap = new Map();

    housingPrices.forEach((item) => {
      if (!complexMap.has(item.complexName)) {
        complexMap.set(item.complexName, {
          id: item.id,
          name: item.complexName,
          status: item.status || "строится",
          description: item.description || "",
          pricePerSquareMeter: item.pricePerSquareMeter,
          banks: item.banks || [],
          surcharges: item.surcharges || {
            withoutDownPayment: 0,
            partialDownPayment: 0,
          },
          paymentTerms: item.paymentTerms || [],
          promotions: item.promotions || [],
          specialOffers: item.specialOffers || [],
          materialsLink: item.materialsLink || "",
          isActive: true,
        });
      }
    });

    res.json(Array.from(complexMap.values()));
  } catch (error) {
    console.error("Error getting complexes:", error);
    res.status(500).json({ error: "Failed to get complexes" });
  }
};

// ============================================================
// 🔥 ПРОГРАММЫ (из PROGRAM_TYPES)
// ============================================================
export const getPrograms = (req: Request, res: Response) => {
  try {
    const labels: Record<string, string> = {
      base: "Базовая ипотека",
      full: "Субсидии на длинный срок",
      short: "Субсидии на короткий срок",
      family: "Семейная ипотека",
      it: "ИТ ипотека",
      tranche: "Траншевая ипотека",
    };

    const icons: Record<string, string> = {
      base: "🏠",
      full: "📈",
      short: "⚡",
      family: "👨‍👩‍👧‍👦",
      it: "💻",
      tranche: "📊",
    };

    const colors: Record<string, string> = {
      base: "#6b7280",
      full: "#f59e0b",
      short: "#ef4444",
      family: "#8b5cf6",
      it: "#3b82f6",
      tranche: "#ec4899",
    };

    const descriptions: Record<string, string> = {
      base: "Стандартная ипотечная программа с базовой ставкой",
      full: "Субсидированная ипотека на длительный срок",
      short: "Субсидированная ипотека на короткий срок",
      family: "Для семей с детьми. Льготная ставка 6%",
      it: "Для IT-специалистов. Льготная ставка 6%",
      tranche: "Ипотека с траншевой системой финансирования",
    };

    const programs = Object.entries(PROGRAM_TYPES).map(
      ([key, type], index) => ({
        id: String(index + 1),
        type,
        label: labels[type] || type,
        icon: icons[type] || "📋",
        color: colors[type] || "#6b7280",
        description: descriptions[type] || "",
        isActive: true,
      }),
    );

    res.json(programs);
  } catch (error) {
    console.error("Error getting programs:", error);
    res.status(500).json({ error: "Failed to get programs" });
  }
};

// ============================================================
// 🔥 СТАВКИ (из dynamicRates в bankOffers)
// ============================================================
export const getRates = (req: Request, res: Response) => {
  try {
    const rates = bankOffers
      .filter((offer) => offer.dynamicRates && offer.dynamicRates.length > 0)
      .flatMap((offer) =>
        offer.dynamicRates!.map((rule, index) => ({
          id: `${offer.bank}-${index}`,
          bankId: offer.bank,
          programType: offer.type,
          conditionType: rule.type || "pv",
          condition: rule.condition || "gte",
          value: rule.value || 0,
          rate: rule.rate || 0,
          priority: rule.priority || 0,
          description: rule.description || "",
          isActive: true,
        })),
      );
    res.json(rates);
  } catch (error) {
    console.error("Error getting rates:", error);
    res.status(500).json({ error: "Failed to get rates" });
  }
};

// ============================================================
// 🔥 СУБСИДИИ (из dynamicSubsidyPercent в bankOffers)
// ============================================================
export const getSubsidies = (req: Request, res: Response) => {
  try {
    const subsidies = bankOffers
      .filter(
        (offer) =>
          offer.dynamicSubsidyPercent && offer.dynamicSubsidyPercent.length > 0,
      )
      .flatMap((offer) =>
        offer.dynamicSubsidyPercent!.map((rule, index) => ({
          id: `${offer.bank}-${index}`,
          bankId: offer.bank,
          programType: offer.type,
          minPVPercent: 0,
          maxPVPercent: null,
          minAmount: rule.minAmount || null,
          maxAmount: rule.maxAmount || null,
          minTerm: null,
          maxTerm: null,
          subsidyPercent: rule.subsidyPercent || 0,
          priority: rule.priority || 0,
          description: rule.description || "",
          isActive: true,
        })),
      );
    res.json(subsidies);
  } catch (error) {
    console.error("Error getting subsidies:", error);
    res.status(500).json({ error: "Failed to get subsidies" });
  }
};

// ============================================================
// 🔥 КОНФИГУРАЦИЯ (из существующих констант)
// ============================================================
export const getConfig = (req: Request, res: Response) => {
  try {
    res.json({
      depositAmount: DEPOSIT_AMOUNT || 30000,
      minDownPayment: MIN_PV_PERCENT,
      maxLoanTerm: 30,
      defaultComplex: housingPrices[0]?.complexName || "ЖК Сады у моря 3",
      bankOrder: Object.values(BANK_NAMES),
    });
  } catch (error) {
    console.error("Error getting config:", error);
    res.status(500).json({ error: "Failed to get config" });
  }
};

// ============================================================
// 🔥 ОБНОВЛЕНИЕ КОНФИГУРАЦИИ
// ============================================================
export const updateConfig = (req: Request, res: Response) => {
  try {
    // TODO: Сохранять изменения в файл или БД
    const currentConfig = {
      depositAmount: DEPOSIT_AMOUNT || 30000,
      minDownPayment: MIN_PV_PERCENT,
      maxLoanTerm: 30,
      defaultComplex: housingPrices[0]?.complexName || "ЖК Сады у моря 3",
      bankOrder: Object.values(BANK_NAMES),
    };

    const updatedConfig = { ...currentConfig, ...req.body };
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Failed to update config" });
  }
};
