// backend/src/services/calculations/coefficients/getThresholdSubsidy.ts

import { DynamicSubsidy } from "../../../entities/DynamicSubsidy";

/**
 * Расчет погрешности для субсидии
 */
const calculateTolerance = (
  amount: number,
  subsidy: DynamicSubsidy,
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): number => {
  // Берем tolerance из conditionMetadata или глобальный
  const rawTolerance = subsidy.conditionMetadata?.tolerance ?? globalTolerance;
  const toleranceType =
    subsidy.conditionMetadata?.toleranceType ?? globalToleranceType;

  if (toleranceType === "percent") {
    return amount * (rawTolerance / 100);
  }

  return rawTolerance;
};

/**
 * Применение порогового округления для субсидий
 */
export const applyThresholdRounding = (
  amount: number,
  subsidies: DynamicSubsidy[],
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): { adjustedAmount: number; matchedSubsidy: DynamicSubsidy | null } => {
  // Сортируем по приоритету (меньше = выше приоритет)
  const sortedSubsidies = [...subsidies]
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const subsidy of sortedSubsidies) {
    // Пропускаем, если нет диапазона суммы
    if (
      subsidy.minValue === null &&
      subsidy.minValue === undefined &&
      subsidy.maxValue === null &&
      subsidy.maxValue === undefined
    ) {
      continue;
    }

    const minAmount =
      subsidy.minValue !== null && subsidy.minValue !== undefined
        ? Number(subsidy.minValue)
        : 0;
    const maxAmount =
      subsidy.maxValue !== null && subsidy.maxValue !== undefined
        ? Number(subsidy.maxValue)
        : Infinity;

    const strategy = subsidy.conditionMetadata?.roundingStrategy ?? "up";

    // Рассчитываем погрешность
    const tolerance = calculateTolerance(
      amount,
      subsidy,
      globalTolerance,
      globalToleranceType,
    );

    // Стратегия "up" - подтягиваем до минимальной суммы
    if (strategy === "up") {
      const diff = minAmount - amount;
      if (amount < minAmount && diff <= tolerance) {
        return { adjustedAmount: minAmount, matchedSubsidy: subsidy };
      }
    }
    // Стратегия "down" - опускаем до максимальной суммы
    else {
      const diff = amount - maxAmount;
      if (amount > maxAmount && diff <= tolerance) {
        return { adjustedAmount: maxAmount, matchedSubsidy: subsidy };
      }
    }

    // Проверяем, попадает ли сумма в диапазон
    if (amount >= minAmount && amount < maxAmount) {
      return { adjustedAmount: amount, matchedSubsidy: subsidy };
    }
  }

  return { adjustedAmount: amount, matchedSubsidy: null };
};

/**
 * Получение субсидии по пороговой логике
 */
export const getThresholdSubsidy = (
  amount: number,
  subsidies: DynamicSubsidy[],
  globalTolerance: number = 0,
  globalToleranceType: "fixed" | "percent" = "percent",
): number => {
  const { adjustedAmount, matchedSubsidy } = applyThresholdRounding(
    amount,
    subsidies,
    globalTolerance,
    globalToleranceType,
  );

  // Если нашли подходящую субсидию - возвращаем её
  if (matchedSubsidy) {
    return typeof matchedSubsidy.rate === "string"
      ? parseFloat(matchedSubsidy.rate)
      : matchedSubsidy.rate;
  }

  // Если не нашли - ищем по диапазонам
  const sortedSubsidies = [...subsidies]
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const subsidy of sortedSubsidies) {
    const minAmount =
      subsidy.minValue !== null && subsidy.minValue !== undefined
        ? Number(subsidy.minValue)
        : 0;
    const maxAmount =
      subsidy.maxValue !== null && subsidy.maxValue !== undefined
        ? Number(subsidy.maxValue)
        : Infinity;

    if (adjustedAmount >= minAmount && adjustedAmount < maxAmount) {
      return typeof subsidy.rate === "string"
        ? parseFloat(subsidy.rate)
        : subsidy.rate;
    }
  }

  return 0;
};
