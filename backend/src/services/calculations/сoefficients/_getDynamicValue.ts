// backend/src/services/calculations/coefficients/getDynamicValue.ts

import { DynamicRate } from "../../../entities/DynamicRate";
import { DynamicSubsidy } from "../../../entities/DynamicSubsidy";
import { getThresholdSubsidy } from "./_getThresholdSubsidy";

type DynamicEntity = DynamicRate | DynamicSubsidy;

/**
 * Универсальная проверка условия для ставок и субсидий
 */
const checkCondition = (
  rule: DynamicEntity,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  // 1. Если есть conditionFn в metadata
  if (rule.conditionMetadata?.conditionFn) {
    return rule.conditionMetadata.conditionFn(pv, amount, term);
  }

  // 2. Проверка по диапазону (minValue/maxValue) - для субсидий
  if (
    rule.minValue !== null &&
    rule.minValue !== undefined &&
    rule.maxValue !== null &&
    rule.maxValue !== undefined
  ) {
    const minVal =
      typeof rule.minValue === "string"
        ? parseFloat(rule.minValue)
        : rule.minValue;
    const maxVal =
      typeof rule.maxValue === "string"
        ? parseFloat(rule.maxValue)
        : rule.maxValue;
    return amount >= minVal && amount <= maxVal;
  }

  // 3. Проверка по простому условию (type + condition + value) - для ставок
  if (
    rule.conditionType &&
    rule.condition &&
    rule.value !== null &&
    rule.value !== undefined
  ) {
    let actualValue: number;
    const ruleValue =
      typeof rule.value === "string" ? parseFloat(rule.value) : rule.value;

    switch (rule.conditionType) {
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
        return actualValue >= ruleValue;
      case "lte":
        return actualValue <= ruleValue;
      case "lt":
        return actualValue < ruleValue;
      case "gt":
        return actualValue > ruleValue;
      case "eq":
        return actualValue === ruleValue;
      default:
        return false;
    }
  }

  return false;
};

/**
 * Универсальная функция для получения динамического значения
 */
export const getDynamicValue = <T extends DynamicEntity>(
  items: T[],
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
  defaultValue: number,
  useThreshold: boolean = false, // 🔥 Флаг для пороговой логики
): number => {
  if (!items || items.length === 0) {
    return defaultValue;
  }

  // 🔥 Если включена пороговая логика и это субсидии
  if (useThreshold) {
    const hasThresholdRules = items.some(
      (item) => item.minValue !== null && item.minValue !== undefined,
    );

    if (hasThresholdRules) {
      const globalTolerance = (items[0] as any).offer?.thresholdTolerance ?? 0;
      const globalToleranceType =
        (items[0] as any).offer?.thresholdToleranceType ?? "percent";

      // Приводим к DynamicSubsidy[] для пороговой логики
      const subsidies = items as DynamicSubsidy[];
      const subsidy = getThresholdSubsidy(
        mortgageAmount,
        subsidies,
        globalTolerance,
        globalToleranceType,
      );

      if (subsidy > 0) {
        return subsidy;
      }
    }
  }

  // 🔥 Обычная проверка условий
  const sorted = [...items]
    .filter((item) => item.isActive !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const item of sorted) {
    if (checkCondition(item, pvPercent, mortgageAmount, loanTerm)) {
      return item.rate;
    }
  }

  return defaultValue;
};
