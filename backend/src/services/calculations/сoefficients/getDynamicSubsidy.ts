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
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

  const minAmount = rule.minAmount ?? 0;
  const maxAmount = rule.maxAmount ?? Infinity;

  if (amount >= minAmount && amount < maxAmount) {
    return true;
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

export const getDynamicSubsidy = (
  offer: Offer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  const dynamicSubsidies = offer.dynamicSubsidies || [];

  if (dynamicSubsidies.length > 0) {
    // 🔥 Исправление: правильное преобразование с обработкой null
    const rules: DynamicRateRule[] = dynamicSubsidies
      .filter((s) => s.isActive !== false)
      .map((subsidy) => {
        // 🔥 Преобразуем null → undefined для roundingStrategy
        const roundingStrategy = subsidy.roundingStrategy as
          | "up"
          | "down"
          | undefined;

        // 🔥 Преобразуем conditionMetadata для toleranceType
        const toleranceType = subsidy.conditionMetadata?.toleranceType as
          | "fixed"
          | "percent"
          | undefined;

        return {
          minPVPercent: subsidy.minPVPercent,
          maxPVPercent: subsidy.maxPVPercent,
          minAmount: subsidy.minAmount,
          maxAmount: subsidy.maxAmount,
          minTerm: subsidy.minTerm,
          maxTerm: subsidy.maxTerm,
          subsidyPercent: subsidy.subsidyPercent,
          priority: subsidy.priority,
          description: subsidy.description,
          roundingStrategy: roundingStrategy, // ← теперь правильный тип
          conditionMetadata: subsidy.conditionMetadata,
          conditionFn: subsidy.conditionMetadata?.conditionFn,
          type: subsidy.conditionMetadata?.type,
          condition: subsidy.conditionMetadata?.condition,
          value: subsidy.conditionMetadata?.value,
          tolerance: subsidy.conditionMetadata?.tolerance,
          toleranceType: toleranceType, // ← теперь правильный тип
        };
      });

    const hasThresholdRules = rules.some(
      (rule) => rule.minAmount !== undefined || rule.maxAmount !== undefined,
    );

    if (hasThresholdRules) {
      // 🔥 Исправление: преобразуем null → undefined для tolerance
      const globalTolerance = offer.thresholdTolerance ?? undefined;
      const globalToleranceType =
        (offer.thresholdToleranceType as "fixed" | "percent") ?? "percent";

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

    const sortedRules = [...rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    for (const rule of sortedRules) {
      const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);
      if (isMatch && rule.subsidyPercent !== undefined) {
        return rule.subsidyPercent;
      }
    }
  }

  return offer.subsidyPercent ?? 0;
};
