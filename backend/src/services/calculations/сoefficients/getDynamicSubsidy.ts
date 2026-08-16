// backend/src/services/calculations/coefficients/getDynamicSubsidy.ts

import { Offer } from "../../../entities/Offer";
import { DynamicRateRule } from "../../../types/types";
import { getThresholdSubsidy } from "./getThresholdSubsidy";

const checkCondition = (
  rule: DynamicRateRule,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  // 🔥 Если есть функция условия - используем её
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

  // 🔥 Проверяем по диапазонам (minTerm, maxTerm и т.д.)
  // Проверка по ПВ
  if (rule.minPVPercent !== undefined && rule.minPVPercent !== null) {
    if (pv < rule.minPVPercent) return false;
  }
  if (rule.maxPVPercent !== undefined && rule.maxPVPercent !== null) {
    if (pv > rule.maxPVPercent) return false;
  }

  // Проверка по сумме
  if (rule.minAmount !== undefined && rule.minAmount !== null) {
    if (amount < rule.minAmount) return false;
  }
  if (rule.maxAmount !== undefined && rule.maxAmount !== null) {
    if (amount > rule.maxAmount) return false;
  }

  // 🔥 Проверка по сроку (в годах)
  if (rule.minTerm !== undefined && rule.minTerm !== null) {
    if (term < rule.minTerm) return false;
  }
  if (rule.maxTerm !== undefined && rule.maxTerm !== null) {
    if (term > rule.maxTerm) return false;
  }

  // 🔥 Проверка по простому условию (type + condition + value)
  if (rule.type && rule.condition && rule.value !== undefined) {
    let actualValue: number;
    switch (rule.type) {
      case "pv":
        actualValue = pv;
        break;
      case "amount":
        actualValue = amount;
        break;
      case "term":
        actualValue = term;
        break;
      default:
        return false;
    }

    switch (rule.condition) {
      case "gte":
        return actualValue >= rule.value;
      case "lte":
        return actualValue <= rule.value;
      case "lt":
        return actualValue < rule.value;
      case "gt":
        return actualValue > rule.value;
      case "eq":
        return actualValue === rule.value;
      default:
        return false;
    }
  }

  // Если нет никаких условий - считаем что подходит
  return true;
};

// ============================================================
// ФУНКЦИЯ ДЛЯ РАБОТЫ С OFFER (из БД)
// ============================================================
export const getDynamicSubsidy = (
  offer: Offer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  const dynamicSubsidies = offer.dynamicSubsidies || [];

  console.log(`🔍 getDynamicSubsidy called for offer ${offer.id}:`, {
    pvPercent,
    mortgageAmount,
    loanTerm,
    dynamicSubsidiesCount: dynamicSubsidies.length,
  });

  if (dynamicSubsidies.length === 0) {
    console.log(
      "ℹ️ No dynamic subsidies, using fixed subsidy:",
      offer.subsidyPercent,
    );
    return offer.subsidyPercent ?? 0;
  }

  // 🔥 Сортируем по приоритету (меньше = выше приоритет)
  const sortedSubsidies = [...dynamicSubsidies]
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  console.log(
    "📊 Sorted subsidies:",
    sortedSubsidies.map((s) => ({
      id: s.id,
      minTerm: s.minTerm,
      maxTerm: s.maxTerm,
      subsidyPercent: s.subsidyPercent,
      priority: s.priority,
    })),
  );

  // 🔥 Преобразуем в правила для checkCondition
  const rules: DynamicRateRule[] = sortedSubsidies.map((subsidy) => ({
    minPVPercent: subsidy.minPVPercent ?? undefined,
    maxPVPercent: subsidy.maxPVPercent ?? undefined,
    minAmount: subsidy.minAmount ?? undefined,
    maxAmount: subsidy.maxAmount ?? undefined,
    minTerm: subsidy.minTerm ?? undefined,
    maxTerm: subsidy.maxTerm ?? undefined,
    subsidyPercent: subsidy.subsidyPercent,
    priority: subsidy.priority,
    description: subsidy.description,
    roundingStrategy: subsidy.roundingStrategy as "up" | "down" | undefined,
    conditionMetadata: subsidy.conditionMetadata,
  }));

  // 🔥 Проверяем каждое правило
  for (const rule of rules) {
    const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);

    console.log(`🔍 Rule check:`, {
      minTerm: rule.minTerm,
      maxTerm: rule.maxTerm,
      subsidyPercent: rule.subsidyPercent,
      isMatch,
    });

    if (isMatch && rule.subsidyPercent !== undefined) {
      console.log(`✅ Selected subsidy: ${rule.subsidyPercent}%`);
      return rule.subsidyPercent;
    }
  }

  // 🔥 Если ничего не подошло - возвращаем фиксированную субсидию
  console.log(
    `ℹ️ No dynamic subsidy matched, using fixed: ${offer.subsidyPercent}%`,
  );
  return offer.subsidyPercent ?? 0;
};

// ============================================================
// ФУНКЦИЯ ДЛЯ РАБОТЫ С ПРАВИЛАМИ (из JSONB)
// ============================================================
export const getDynamicSubsidyFromRules = (
  rules: DynamicRateRule[],
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  if (!rules || rules.length === 0) {
    return 0;
  }

  const sortedRules = [...rules].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0),
  );

  for (const rule of sortedRules) {
    const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);
    if (isMatch && rule.subsidyPercent !== undefined) {
      return rule.subsidyPercent;
    }
  }

  return 0;
};
