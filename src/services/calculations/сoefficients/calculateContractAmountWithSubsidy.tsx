// src/hooks/calculations/bankProgram/contractAmount/calculateContractAmountWithSubsidy.ts

import { BankOffer, Variables, BankCoefficients } from "../../../utils/types";
import { calculateContractAmount } from "../cardBank/contractAmount/calculateContractAmount";

/**
 * Создает обновленные коэффициенты с новой субсидией
 */
const createUpdatedCoefficients = (
  coefficients: BankCoefficients,
  subsidyPercent: number,
  userDownPaymentPercent: number,
): BankCoefficients => {
  const downPaymentPercent = userDownPaymentPercent || 0;
  const mortgagePercent = Math.max(1, 100 - downPaymentPercent);

  return {
    ...coefficients,
    subsidyPercent: subsidyPercent,
    creditFromSubsidyPercent: Math.max(0, 100 - subsidyPercent),
    kefSubsidy:
      subsidyPercent > 0 ? subsidyPercent / (100 - subsidyPercent) : 0,
    mortgageCoefficient: (mortgagePercent * (100 - subsidyPercent)) / 100,
    overstatementCoefficient:
      100 - (mortgagePercent * (100 - subsidyPercent)) / 100,
    requiredCoeffWithMinPV:
      1 - (subsidyPercent / 100) * (mortgagePercent / 100),
    requiredCoeffWithLargePV: 1 - subsidyPercent / 100,
    requiredCoeffWithoutPV:
      (mortgagePercent * (100 - subsidyPercent)) / 100 > 0
        ? (100 - (mortgagePercent * (100 - subsidyPercent)) / 100) /
          ((mortgagePercent * (100 - subsidyPercent)) / 100)
        : 0,
    requiredCoeffFamilyTwo: coefficients.requiredCoeffFamilyTwo, // сохраняем
  };
};

/**
 * Расчет суммы в договоре с учетом итеративной субсидии
 * Работает для ЛЮБОГО типа программы (full, family, it и т.д.)
 */
export const calculateContractAmountWithSubsidy = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
  subsidyPercent: number,
): number => {
  // 1. Создаем обновленные коэффициенты с новой субсидией
  const updatedCoefficients = createUpdatedCoefficients(
    coefficients,
    subsidyPercent,
    userDownPaymentPercent,
  );

  // 2. Используем реальную функцию расчета суммы договора
  // Она сама выберет правильную реализацию (full, family, it, tranche)
  const result = calculateContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    updatedCoefficients,
  );

  return result.contractAmount;
};
