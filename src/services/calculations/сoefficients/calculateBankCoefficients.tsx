// src/hooks/calculations/bankProgram/coefficients/calculateBankCoefficients.ts

import { BankOffer, BankCoefficients, Variables } from "../../../utils/types";
import { calculateDynamicSubsidy } from "./calculateDynamicSubsidy";

interface CalculateBankCoefficientsParams {
  variables: Variables;
  objectCost: number;
  downPayment: number;
  remainingAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  bankOffer: BankOffer;
  noSubsidyInflate: boolean;
  isSpecialMortgageMode: boolean;
  loanTermYears?: number;
}

export const calculateBankCoefficients = (
  params: CalculateBankCoefficientsParams,
): BankCoefficients => {
  const {
    variables,
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    noSubsidyInflate,
    isSpecialMortgageMode,
    loanTermYears = 30,
  } = params;

  const downPaymentPercent = userDownPaymentPercent || 0;
  const mortgagePercent = Math.max(1, 100 - downPaymentPercent);
  const pvRate = downPaymentPercent / 100;

  // ============================================================
  // 1. ОПРЕДЕЛЕНИЕ ФЛАГОВ
  // ============================================================
  const isTwoContracts = bankOffer.isTwoContracts === true;
  const hasDynamicSubsidy =
    bankOffer.dynamicSubsidyPercent &&
    bankOffer.dynamicSubsidyPercent.length > 0;

  // ============================================================
  // 2. БАЗОВЫЕ КОЭФФИЦИЕНТЫ
  // ============================================================
  const baseSubsidyPercent = bankOffer.subsidyPercent || 0;

  const baseKefDownPayment =
    mortgagePercent > 0 ? downPaymentPercent / mortgagePercent : 0;

  const baseCreditFromSubsidyPercent = Math.max(0, 100 - baseSubsidyPercent);
  const baseKefSubsidy =
    baseCreditFromSubsidyPercent > 0
      ? baseSubsidyPercent / baseCreditFromSubsidyPercent
      : 0;

  const baseMortgageCoefficient =
    (mortgagePercent * (100 - baseSubsidyPercent)) / 100;
  const baseOverstatementCoefficient = 100 - baseMortgageCoefficient;

  const baseRequiredCoeffWithMinPV =
    1 - (baseSubsidyPercent / 100) * (mortgagePercent / 100);
  const baseRequiredCoeffWithLargePV = 1 - baseSubsidyPercent / 100;
  const baseRequiredCoeffWithoutPV =
    baseMortgageCoefficient > 0
      ? baseOverstatementCoefficient / baseMortgageCoefficient
      : 0;

  const baseSubsidyRate = baseSubsidyPercent / 100;
  const baseM10 = variables.familyMortgageLimit / objectCost;
  const baseDenominator = 1 - (1 - pvRate) * baseSubsidyRate;

  let baseRequiredCoeffFamilyTwo = 1;
  if (baseDenominator !== 0 && baseSubsidyRate > 0) {
    baseRequiredCoeffFamilyTwo =
      baseSubsidyRate *
        (((1 - pvRate) * (1 - baseSubsidyRate * baseM10)) / baseDenominator -
          baseM10) +
      1;
  }

  const baseCoefficients: BankCoefficients = {
    programName: bankOffer.program || "unknown",
    downPaymentPercent,
    mortgagePercent,
    kefDownPayment: baseKefDownPayment,
    subsidyPercent: baseSubsidyPercent,
    creditFromSubsidyPercent: baseCreditFromSubsidyPercent,
    kefSubsidy: baseKefSubsidy,
    mortgageCoefficient: baseMortgageCoefficient,
    overstatementCoefficient: baseOverstatementCoefficient,
    requiredCoeffWithMinPV: baseRequiredCoeffWithMinPV,
    requiredCoeffWithLargePV: baseRequiredCoeffWithLargePV,
    requiredCoeffWithoutPV: baseRequiredCoeffWithoutPV,
    requiredCoeffFamilyTwo: baseRequiredCoeffFamilyTwo,
  };

  // ============================================================
  // 3. ДИНАМИЧЕСКАЯ СУБСИДИЯ (если есть)
  // ============================================================
  if (hasDynamicSubsidy) {
    const finalSubsidy = calculateDynamicSubsidy({
      bankOffer,
      userDownPaymentPercent,
      objectCost,
      downPayment,
      remainingAmount,
      manualDownPayment,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients: baseCoefficients,
      loanTermYears,
      isTwoContracts,
    });

    // Обновляем коэффициенты с новой субсидией
    const finalSubsidyPercent = finalSubsidy;
    const finalMortgagePercent = mortgagePercent;
    const finalCreditFromSubsidyPercent = Math.max(
      0,
      100 - finalSubsidyPercent,
    );
    const finalKefSubsidy =
      finalCreditFromSubsidyPercent > 0
        ? finalSubsidyPercent / finalCreditFromSubsidyPercent
        : 0;
    const finalMortgageCoefficient =
      (finalMortgagePercent * (100 - finalSubsidyPercent)) / 100;
    const finalOverstatementCoefficient = 100 - finalMortgageCoefficient;

    const finalRequiredCoeffWithMinPV =
      1 - (finalSubsidyPercent / 100) * (finalMortgagePercent / 100);
    const finalRequiredCoeffWithLargePV = 1 - finalSubsidyPercent / 100;
    const finalRequiredCoeffWithoutPV =
      finalMortgageCoefficient > 0
        ? finalOverstatementCoefficient / finalMortgageCoefficient
        : 0;

    // Пересчет requiredCoeffFamilyTwo с финальной субсидией
    const finalSubsidyRate = finalSubsidyPercent / 100;
    const finalM10 = variables.familyMortgageLimit / objectCost;
    const finalDenominator = 1 - (1 - pvRate) * finalSubsidyRate;

    let finalRequiredCoeffFamilyTwo = 1;
    if (finalDenominator !== 0 && finalSubsidyRate > 0) {
      finalRequiredCoeffFamilyTwo =
        finalSubsidyRate *
          (((1 - pvRate) * (1 - finalSubsidyRate * finalM10)) /
            finalDenominator -
            finalM10) +
        1;
    }

    return {
      ...baseCoefficients,
      subsidyPercent: finalSubsidyPercent,
      creditFromSubsidyPercent: finalCreditFromSubsidyPercent,
      kefSubsidy: finalKefSubsidy,
      mortgageCoefficient: finalMortgageCoefficient,
      overstatementCoefficient: finalOverstatementCoefficient,
      requiredCoeffWithMinPV: finalRequiredCoeffWithMinPV,
      requiredCoeffWithLargePV: finalRequiredCoeffWithLargePV,
      requiredCoeffWithoutPV: finalRequiredCoeffWithoutPV,
      requiredCoeffFamilyTwo: finalRequiredCoeffFamilyTwo,
    };
  }

  return baseCoefficients;
};
