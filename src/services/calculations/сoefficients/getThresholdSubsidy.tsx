import { DynamicRateRule } from "../../../utils/types";

const calculateTolerance = (
  amount: number,
  rule: DynamicRateRule,
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): number => {
  const rawTolerance = rule.tolerance ?? globalTolerance;
  const toleranceType = rule.toleranceType ?? globalToleranceType;

  if (toleranceType === "percent") {
    const result = amount * (rawTolerance / 100);
    return result;
  }

  return rawTolerance;
};

export const applyThresholdRounding = (
  amount: number,
  rules: DynamicRateRule[],
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): { adjustedAmount: number; matchedRule: DynamicRateRule | null } => {
  // Сортируем правила по приоритету (от высшего к низшему)
  const sortedRules = [...rules].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0),
  );

  for (const rule of sortedRules) {
    // Если у правила нет minAmount/maxAmount - пропускаем
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

    // ================================================================
    // 1. ПРОВЕРКА БЛИЗОСТИ К НИЖНЕЙ ГРАНИЦЕ (округление ВВЕРХ)
    // ================================================================
    if (strategy === "up") {
      const diff = minAmount - amount;
      if (amount < minAmount && diff <= tolerance) {
        return { adjustedAmount: minAmount, matchedRule: rule };
      }
    } else {
      // Если сумма чуть-чуть ПРЕВЫШАЕТ maxAmount (в пределах tolerance)
      const diff = amount - maxAmount;
      if (amount > maxAmount && diff <= tolerance) {
        return { adjustedAmount: maxAmount, matchedRule: rule };
      }
    }

    // ================================================================
    // 2. ПРОВЕРКА ПОПАДАНИЯ В ДИАПАЗОН
    // ================================================================
    if (amount >= minAmount && amount < maxAmount) {
      return { adjustedAmount: amount, matchedRule: rule };
    }
  }

  // Если ничего не подошло - возвращаем исходную сумму
  return { adjustedAmount: amount, matchedRule: null };
};

/**
 * Получение субсидии с учетом пороговой логики
 */
export const getThresholdSubsidy = (
  amount: number,
  rules: DynamicRateRule[],
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): number => {
  // 1. Применяем пороговую корректировку
  const { adjustedAmount, matchedRule } = applyThresholdRounding(
    amount,
    rules,
    globalTolerance,
    globalToleranceType,
  );

  // Если нашли правило через пороговую логику - возвращаем его субсидию
  if (matchedRule) {
    return matchedRule.subsidyPercent ?? 0;
  }

  // 2. Ищем подходящее правило для скорректированной суммы
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

  // 3. Если ничего не найдено - используем conditionFn
  for (const rule of sortedRules) {
    if (rule.conditionFn && rule.conditionFn(0, amount, 30)) {
      return rule.subsidyPercent ?? 0;
    }
  }

  return 0;
};
