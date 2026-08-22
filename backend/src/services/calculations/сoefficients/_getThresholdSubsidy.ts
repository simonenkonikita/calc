// backend/src/services/calculations/coefficients/getThresholdSubsidy.ts

import { DynamicSubsidy } from "../../../entities/DynamicSubsidy";

/**
 * Проверка, есть ли пороговая логика у субсидии
 */
const hasThresholdLogic = (subsidy: DynamicSubsidy): boolean => {
  const meta = subsidy.conditionMetadata || {};
  return !!(meta.amountMin !== undefined || meta.amountMax !== undefined);
};

/**
 * Получение порогового значения (amountMin)
 */
const getThresholdAmount = (subsidy: DynamicSubsidy): number | null => {
  const meta = subsidy.conditionMetadata || {};
  return meta.amountMin !== undefined ? meta.amountMin : null;
};

/**
 * Расчет погрешности для субсидии (всегда в процентах)
 */
const calculateTolerance = (
  amount: number,
  subsidy: DynamicSubsidy,
  globalTolerance: number = 0,
): number => {
  // Берем tolerance из сущности или глобальный
  const rawTolerance = subsidy.tolerance ?? globalTolerance;

  // Всегда в процентах
  return amount * (rawTolerance / 100);
};

/**
 * Применение порогового округления для субсидий (всегда UP)
 */
export const applyThresholdRounding = (
  amount: number,
  subsidies: DynamicSubsidy[],
  globalTolerance: number = 0,
): { adjustedAmount: number; matchedSubsidy: DynamicSubsidy | null } => {
  // Сортируем по приоритету (меньше = выше приоритет)
  const sortedSubsidies = [...subsidies]
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const subsidy of sortedSubsidies) {
    // Проверяем наличие пороговой логики
    if (!hasThresholdLogic(subsidy)) {
      continue;
    }

    const meta = subsidy.conditionMetadata || {};
    const minAmount = meta.amountMin ?? 0;
    const maxAmount = meta.amountMax ?? Infinity;

    // Рассчитываем погрешность (всегда percent, всегда up)
    const tolerance = calculateTolerance(amount, subsidy, globalTolerance);

    // 🔥 Всегда округляем ВВЕРХ (UP)
    const diff = minAmount - amount;
    if (amount < minAmount && diff <= tolerance) {
      return { adjustedAmount: minAmount, matchedSubsidy: subsidy };
    }

    // Проверяем, попадает ли сумма в диапазон
    if (amount >= minAmount && amount <= maxAmount) {
      return { adjustedAmount: amount, matchedSubsidy: subsidy };
    }
  }

  return { adjustedAmount: amount, matchedSubsidy: null };
};

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

  // Проверка суммы
  if (meta.amountMin !== undefined && amount < meta.amountMin) return false;
  if (meta.amountMax !== undefined && amount > meta.amountMax) return false;

  // Проверка ПВ
  if (meta.pvMin !== undefined && pv < meta.pvMin) return false;
  if (meta.pvMax !== undefined && pv > meta.pvMax) return false;

  // Проверка срока
  if (meta.termMin !== undefined && term < meta.termMin) return false;
  if (meta.termMax !== undefined && term > meta.termMax) return false;

  return true;
};

/**
 * Получение субсидии по пороговой логике
 */
export const getThresholdSubsidy = (
  amount: number,
  subsidies: DynamicSubsidy[],
  pvPercent: number = 0,
  loanTerm: number = 30,
  globalTolerance: number = 0,
): number => {
  // 1️⃣ ПРИМЕНЯЕМ ПОРОГОВУЮ ЛОГИКУ
  const { adjustedAmount, matchedSubsidy } = applyThresholdRounding(
    amount,
    subsidies,
    globalTolerance,
  );

  // Если нашли подходящую субсидию - проверяем остальные условия
  if (matchedSubsidy) {
    const isFullMatch = checkMetadataConditions(
      matchedSubsidy.conditionMetadata,
      pvPercent,
      adjustedAmount,
      loanTerm,
    );

    if (isFullMatch) {
      return typeof matchedSubsidy.subsidyPercent === "string"
        ? parseFloat(matchedSubsidy.subsidyPercent)
        : matchedSubsidy.subsidyPercent;
    }
  }

  // 2️⃣ ИЩЕМ ПО ВСЕМ УСЛОВИЯМ (без порогов)
  const sortedSubsidies = [...subsidies]
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const subsidy of sortedSubsidies) {
    const isMatch = checkMetadataConditions(
      subsidy.conditionMetadata,
      pvPercent,
      adjustedAmount,
      loanTerm,
    );

    if (isMatch) {
      return typeof subsidy.subsidyPercent === "string"
        ? parseFloat(subsidy.subsidyPercent)
        : subsidy.subsidyPercent;
    }
  }

  return 0;
};
