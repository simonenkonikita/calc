// src/hooks/calculations/bankProgram/mortgageAmount/tranche/calculateTrancheMortgageAmount.ts

import { BankOffer, Variables } from "../../../../../types/types";

export interface TrancheMortgageResult {
  mortgageAmount: number; // Общая сумма ипотеки
  firstTrancheAmount: number; // Сумма первого транша
  secondTrancheAmount: number; // Сумма второго транша
  isLimitExceeded: boolean;
}

interface CalculateTrancheMortgageAmountParams {
  objectCost: number;
  contractAmount: number;
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number;
  userDownPaymentPercent: number;
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
}

export const calculateTrancheMortgageAmount = (
  params: CalculateTrancheMortgageAmountParams,
): TrancheMortgageResult => {
  const {
    contractAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    objectCost,
    downPayment,
  } = params;

  const MIN_TRANCHE = 100000;
  const MIN_PERCENT_TRANCHE = 0.4;

  // 1. Общая сумма ипотеки
  const mortgageAmount = contractAmount - downPaymentAmount;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  // 2. Получаем процент первого транша из оффера (по умолчанию 19.9%)
  const baseTranchePercent = bankOffer.trancheFirstPercent || 19.9;

  // 3. Минимальный ПВ (обычно 20.1%)
  const minPVPercent = bankOffer.minPVPercent || 20.1;
  const targetTotal = contractAmount * MIN_PERCENT_TRANCHE; // 40% от суммы в договоре
  const trancheSumm = contractAmount * (downPayment / contractAmount);

  let firstTrancheAmount: number;
  let secondTrancheAmount: number;

  // ============================================================
  // ЛОГИКА РАСЧЕТА ПЕРВОГО ТРАНША
  // ============================================================
  if (mortgageAmount <= MIN_TRANCHE) {
    // Если ПВ больше 40%, первый транш всегда = 100 000
    firstTrancheAmount = mortgageAmount;
    secondTrancheAmount = Math.max(0, mortgageAmount - firstTrancheAmount);
  } else if (
    downPayment >= userDesiredDownPayment &&
    trancheSumm >= targetTotal
  ) {
    firstTrancheAmount = MIN_TRANCHE;
    secondTrancheAmount = Math.max(0, mortgageAmount - firstTrancheAmount);
  } else if (userDownPaymentPercent >= 40) {
    // Если ПВ больше 40%, первый транш всегда = 100 000
    firstTrancheAmount = MIN_TRANCHE;
    secondTrancheAmount = Math.max(0, mortgageAmount - firstTrancheAmount);
  }
  // Если ПВ минимальный (20.1%), транш = 19.9% от стоимости объекта
  else if (userDownPaymentPercent <= minPVPercent) {
    // Используем процент от стоимости объекта
    const tranchePercent = baseTranchePercent / 100;
    firstTrancheAmount = objectCost * tranchePercent;
    secondTrancheAmount = Math.max(0, mortgageAmount - firstTrancheAmount);
  }
  // Если ПВ между минимальным и 40%, транш рассчитывается так:
  // Первый взнос + транш = 40% от contractAmount
  else {
    // Сумма первого взноса + транш должна давать 40% от contractAmount

    // Транш = 40% от contractAmount - первый взнос
    firstTrancheAmount = Math.max(MIN_TRANCHE, targetTotal - downPaymentAmount);

    // Ограничиваем первый транш, чтобы он не превышал общую ипотеку
    firstTrancheAmount = Math.min(firstTrancheAmount, mortgageAmount);

    secondTrancheAmount = Math.max(0, mortgageAmount - firstTrancheAmount);
  }

  const result: TrancheMortgageResult = {
    mortgageAmount: Math.ceil(mortgageAmount),
    firstTrancheAmount: Math.ceil(firstTrancheAmount),
    secondTrancheAmount: Math.ceil(secondTrancheAmount),
    isLimitExceeded: false,
  };

  return result;
};
