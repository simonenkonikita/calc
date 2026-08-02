// src/hooks/coefficients/getDynamicSubsidy.ts

import { DynamicRateRule, BankOffer } from "../../../types/types";
import { getThresholdSubsidy } from "./getThresholdSubsidy";

/**
 * Проверка условия правила
 */
const checkCondition = (
  rule: DynamicRateRule,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  // 1. Если есть conditionFn - используем её
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

  // 2. Если есть minAmount/maxAmount - проверяем диапазон
  const minAmount = rule.minAmount ?? 0;
  const maxAmount = rule.maxAmount ?? Infinity;

  if (amount >= minAmount && amount < maxAmount) {
    return true;
  }

  // 3. JSON-совместимые условия
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

  return false;
};

/**
 * Получение динамической субсидии
 */
export const getDynamicSubsidy = (
  bankOffer: BankOffer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  if (
    bankOffer.dynamicSubsidyPercent &&
    bankOffer.dynamicSubsidyPercent.length > 0
  ) {
    const rules = bankOffer.dynamicSubsidyPercent;

    // 🔥 ПРОВЕРЯЕМ НАЛИЧИЕ ПОРОГОВЫХ ПРАВИЛ
    const hasThresholdRules = rules.some(
      (rule) => rule.minAmount !== undefined || rule.maxAmount !== undefined,
    );

    if (hasThresholdRules) {
      // Используем пороговую логику с погрешностью
      const globalTolerance = bankOffer.thresholdTolerance;
      const globalToleranceType = bankOffer.thresholdToleranceType ?? "percent";

      const subsidy = getThresholdSubsidy(
        mortgageAmount,
        rules,
        globalTolerance,
        globalToleranceType,
      );

      if (subsidy > 0) {
        return subsidy;
      }
    }

    // 🔥 ЕСЛИ ПОРОГОВАЯ ЛОГИКА НЕ СРАБОТАЛА - ИСПОЛЬЗУЕМ ОБЫЧНУЮ
    const sortedRules = [...rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    for (const rule of sortedRules) {
      const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);

      if (isMatch) {
        if (rule.subsidyPercent !== undefined) {
          return rule.subsidyPercent;
        }
      }
    }
  }

  // Если ничего не подошло - возвращаем базовую субсидию
  return bankOffer.subsidyPercent ?? 0;
};
