// src/hooks/сoefficients/getDynamicRate.ts

import { BankOffer, DynamicRateRule } from "../../utils/types";

/**
 * Проверка условия правила
 */
const checkCondition = (
  rule: DynamicRateRule,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  // 1. Если есть conditionFn - используем её (сложные условия)
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

  // 2. Если есть type и condition - используем простые условия
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
 * Получение динамической ставки
 */
export const getDynamicRate = (
  bankOffer: BankOffer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  // Если нет правил - возвращаем базовую ставку
  if (!bankOffer.dynamicRates || bankOffer.dynamicRates.length === 0) {
    return bankOffer.rate;
  }

  // Сортируем по приоритету (от большего к меньшему)
  const sortedRules = [...bankOffer.dynamicRates].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  // Проверяем каждое правило
  for (const rule of sortedRules) {
    const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);

    if (isMatch) {
      // Если есть rateFn - вычисляем ставку
      if (rule.rateFn) {
        return rule.rateFn(bankOffer.rate, pvPercent, mortgageAmount);
      }
      // Иначе используем фиксированную ставку
      if (rule.rate !== undefined) {
        return rule.rate;
      }
    }
  }

  // Если ни одно правило не подошло - возвращаем базовую ставку
  return bankOffer.rate;
};

/**
 * Получение описания правил для отладки
 */
export const getDynamicRulesDescription = (bankOffer: BankOffer): string => {
  if (!bankOffer.dynamicRates || bankOffer.dynamicRates.length === 0) {
    return "Нет динамических правил";
  }

  const descriptions: string[] = [];

  for (const rule of bankOffer.dynamicRates) {
    if (rule.description) {
      descriptions.push(rule.description);
    } else if (rule.type && rule.condition && rule.value !== undefined) {
      const typeMap = { pv: "ПВ", amount: "Сумма", term: "Срок" };
      const conditionMap = {
        gte: "≥",
        lte: "≤",
        lt: "<",
        gt: ">",
        eq: "=",
      };
      const typeText = typeMap[rule.type] || rule.type;
      const conditionText = conditionMap[rule.condition] || rule.condition;
      const valueText =
        rule.type === "amount"
          ? `${(rule.value / 1000000).toFixed(0)} млн ₽`
          : `${rule.value}${rule.type === "pv" ? "%" : " лет"}`;
      const rateText =
        rule.rate !== undefined ? `${rule.rate}%` : "динамическая";
      descriptions.push(
        `${typeText} ${conditionText} ${valueText} → ${rateText}`,
      );
    }
  }

  return descriptions.join("; ");
};
