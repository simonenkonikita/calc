// backend/src/services/calculations/coefficients/getDynamicSubsidy.ts

import { DynamicSubsidy } from "../../../entities/DynamicSubsidy";

/**
 * Проверка условий из metadata
 */
const checkMetadataConditions = (
  meta: DynamicSubsidy["conditionMetadata"],
  pv: number,
  amount: number,
  term: number,
): boolean => {
  if (!meta) return true; // пустой metadata = всегда true

  if (meta.amountMin != null && amount < meta.amountMin) return false;
  if (meta.amountMax != null && amount > meta.amountMax) return false;
  if (meta.pvMin != null && pv < meta.pvMin) return false;
  if (meta.pvMax != null && pv > meta.pvMax) return false;
  if (meta.termMin != null && term < meta.termMin) return false;
  if (meta.termMax != null && term > meta.termMax) return false;

  return true;
};

/**
 * Получение порогового значения (amountMin)
 */
const getThresholdAmount = (subsidy: DynamicSubsidy): number | null => {
  return subsidy.conditionMetadata?.amountMin ?? null;
};

/**
 * Применение пороговой логики (всегда UP, всегда в процентах)
 */
const applyThreshold = (
  amount: number,
  subsidy: DynamicSubsidy,
  globalTolerance: number = 0,
): number => {
  const threshold = getThresholdAmount(subsidy);
  if (threshold === null) return amount;

  const tolerance = subsidy.tolerance ?? globalTolerance;
  if (tolerance <= 0) return amount;

  const toleranceValue = amount * (tolerance / 100);
  const diff = threshold - amount;

  if (amount < threshold && diff <= toleranceValue) {
    return threshold; // подтягиваем к порогу
  }

  return amount;
};

/**
 * Получение динамической субсидии
 */
export const getDynamicSubsidy = (
  subsidies: DynamicSubsidy[],
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
  globalTolerance: number = 0,
): number => {
  if (!subsidies || subsidies.length === 0) {
    return 0;
  }

  // Сортируем по приоритету (от высшего к низшему)
  const sorted = [...subsidies]
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // 🔥 ПЕРВЫЙ ПРОХОД: с пороговой логикой
  for (const subsidy of sorted) {
    const threshold = getThresholdAmount(subsidy);
    if (threshold === null) continue;

    const adjustedAmount = applyThreshold(
      mortgageAmount,
      subsidy,
      globalTolerance,
    );

    if (
      checkMetadataConditions(
        subsidy.conditionMetadata,
        pvPercent,
        adjustedAmount,
        loanTerm,
      )
    ) {
      return typeof subsidy.subsidyPercent === "string"
        ? parseFloat(subsidy.subsidyPercent)
        : subsidy.subsidyPercent;
    }
  }

  // 🔥 ВТОРОЙ ПРОХОД: без пороговой логики
  for (const subsidy of sorted) {
    if (
      checkMetadataConditions(
        subsidy.conditionMetadata,
        pvPercent,
        mortgageAmount,
        loanTerm,
      )
    ) {
      return typeof subsidy.subsidyPercent === "string"
        ? parseFloat(subsidy.subsidyPercent)
        : subsidy.subsidyPercent;
    }
  }

  return 0;
};
