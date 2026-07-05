// src/hooks/сoefficients/getDynamicSubsidy.ts
import { BankOffer, DynamicRateRule } from "../../../utils/types";

/**
 * Проверка условия правила
 */
const checkCondition = (
  rule: DynamicRateRule,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

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
 * @param bankOffer - Предложение банка
 * @param pvPercent - Процент ПВ
 * @param mortgageAmount - Сумма кредита (для 2 договоров - сумма второго договора)
 * @param loanTerm - Срок кредита в годах
 * @returns Процент субсидии
 */
export const getDynamicSubsidy = (
  bankOffer: BankOffer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  // 🔥 1. Проверяем наличие dynamicSubsidyCalculator
  if (bankOffer.dynamicSubsidyCalculator) {
    return bankOffer.dynamicSubsidyCalculator(mortgageAmount);
  }

  // 🔥 2. Проверяем наличие dynamicSubsidyPercent
  if (
    bankOffer.dynamicSubsidyPercent &&
    bankOffer.dynamicSubsidyPercent.length > 0
  ) {
    const sortedRules = [...bankOffer.dynamicSubsidyPercent].sort(
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

  // 🔥 3. Если ничего не подошло - возвращаем базовую субсидию
  return bankOffer.subsidyPercent;
};
