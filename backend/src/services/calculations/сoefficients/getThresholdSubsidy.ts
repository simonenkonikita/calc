// backend/src/services/calculations/coefficients/getThresholdSubsidy.ts

import { DynamicRateRule } from "../../../types/types";

const calculateTolerance = (
  amount: number,
  rule: DynamicRateRule,
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): number => {
  const rawTolerance = rule.tolerance ?? globalTolerance;
  const toleranceType = rule.toleranceType ?? globalToleranceType;

  if (toleranceType === "percent") {
    return amount * (rawTolerance / 100);
  }

  return rawTolerance;
};

export const applyThresholdRounding = (
  amount: number,
  rules: DynamicRateRule[],
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): { adjustedAmount: number; matchedRule: DynamicRateRule | null } => {
  const sortedRules = [...rules].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  for (const rule of sortedRules) {
    if (rule.minAmount === undefined && rule.maxAmount === undefined) {
      continue;
    }

    const minAmount = rule.minAmount ?? 0;
    const maxAmount = rule.maxAmount ?? Infinity;
    const strategy = rule.roundingStrategy ?? "up";

    const tolerance = calculateTolerance(
      amount,
      rule,
      globalTolerance,
      globalToleranceType,
    );

    if (strategy === "up") {
      const diff = minAmount - amount;
      if (amount < minAmount && diff <= tolerance) {
        return { adjustedAmount: minAmount, matchedRule: rule };
      }
    } else {
      const diff = amount - maxAmount;
      if (amount > maxAmount && diff <= tolerance) {
        return { adjustedAmount: maxAmount, matchedRule: rule };
      }
    }

    if (amount >= minAmount && amount < maxAmount) {
      return { adjustedAmount: amount, matchedRule: rule };
    }
  }

  return { adjustedAmount: amount, matchedRule: null };
};

export const getThresholdSubsidy = (
  amount: number,
  rules: DynamicRateRule[],
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): number => {
  const { adjustedAmount, matchedRule } = applyThresholdRounding(
    amount,
    rules,
    globalTolerance,
    globalToleranceType,
  );

  if (matchedRule) {
    return matchedRule.subsidyPercent ?? 0;
  }

  const sortedRules = [...rules].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  for (const rule of sortedRules) {
    const minAmount = rule.minAmount ?? 0;
    const maxAmount = rule.maxAmount ?? Infinity;

    if (adjustedAmount >= minAmount && adjustedAmount < maxAmount) {
      return rule.subsidyPercent ?? 0;
    }
  }

  for (const rule of sortedRules) {
    if (rule.conditionFn && rule.conditionFn(0, amount, 30)) {
      return rule.subsidyPercent ?? 0;
    }
  }

  return 0;
};