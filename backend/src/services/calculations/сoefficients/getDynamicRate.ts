// backend/src/services/calculations/coefficients/getDynamicRate.ts

import { DynamicRate } from "../../../entities/DynamicRate";

/**
 * Проверка условий из metadata
 */
const checkMetadataConditions = (
  meta: DynamicRate["conditionMetadata"],
  pv: number,
  amount: number,
  term: number,
): boolean => {
  if (!meta) return false;

  if (meta.amountMin != null && amount < meta.amountMin) return false;
  if (meta.amountMax != null && amount > meta.amountMax) return false;
  if (meta.pvMin != null && pv < meta.pvMin) return false;
  if (meta.pvMax != null && pv > meta.pvMax) return false;
  if (meta.termMin != null && term < meta.termMin) return false;
  if (meta.termMax != null && term > meta.termMax) return false;

  return true;
};

/**
 * Получение динамической ставки
 */
export const getDynamicRate = (
  rates: DynamicRate[],
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
  defaultRate: number,
): number => {
  if (!rates || rates.length === 0) {
    return defaultRate;
  }

  // Сортируем по приоритету (от высшего к низшему)
  const sorted = [...rates]
    .filter((r) => r.isActive !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const rate of sorted) {
    if (
      checkMetadataConditions(
        rate.conditionMetadata,
        pvPercent,
        mortgageAmount,
        loanTerm,
      )
    ) {
      return typeof rate.rate === "string" ? parseFloat(rate.rate) : rate.rate;
    }
  }

  return defaultRate;
};
