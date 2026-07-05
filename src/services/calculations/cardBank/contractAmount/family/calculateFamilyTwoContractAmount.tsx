import {
  BankCoefficients,
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../../../utils/types";
import { calculateBankCoefficients } from "../../../сoefficients/calculateBankCoefficients";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ ДЛЯ 2 ДОГОВОРОВ ==========
export const calculateFamilyTwoContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
): ContractAmountResult => {
  const limit = variables.familyMortgageLimit || 6000000;
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;

  // 🔥 ИСПРАВЛЕНО: используем субсидию из coefficients (она уже динамическая)
  const subsidyPercent = coefficients.subsidyPercent;
  const subsidyRate = subsidyPercent / 100;

  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const cafsummPV = userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);

  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  let summCredit: number;
  let isWithinLimit: boolean;

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  }

  const isThresholdCondition =
    isSpecialMortgageMode && downPayment < summCreditWithoutPV * cafsummPV;

  const baseContractAmount = objectCost + maxLimit * subsidyRate;

  let contractAmount: number;

  const summCreditFamilyTwo = objectCost * coefficients.requiredCoeffFamilyTwo;

  if (isThresholdCondition) {
    if (noSubsidyInflate) {
      if (isWithinLimit) {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        contractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      }
    } else {
      if (isWithinLimit) {
        contractAmount = summCreditFamilyTwo / 0.799;
      } else {
        contractAmount = summCreditFamilyTwo / 0.799;
      }
    }
  } else {
    if (noSubsidyInflate) {
      contractAmount = Math.ceil(objectCost);
    } else {
      if (isWithinLimit) {
        if (downPayment <= userDesiredDownPayment) {
          contractAmount = summCreditFamilyTwo;
        } else {
          contractAmount = summCreditFamilyTwo;
        }
      } else {
        if (downPayment <= userDesiredDownPayment) {
          contractAmount = objectCost + (maxLimit - limit) * subsidyRate;
        } else if (downPayment > baseContractAmount - maxLimit) {
          contractAmount = summCreditFamilyTwo;
        } else {
          contractAmount = summCreditFamilyTwo;
        }
      }
    }
  }

  // 🔥 ВЫЧИСЛЯЕМ ВТОРОЙ ДОГОВОР
  const firstContractAmount = Math.min(limit, contractAmount - downPayment);
  const secondContractAmount = Math.max(
    0,
    contractAmount - downPayment - limit,
  );

  // 🔥 ПЕРЕСЧИТЫВАЕМ КОЭФФИЦИЕНТЫ С ДИНАМИЧЕСКОЙ СУБСИДИЕЙ (второй проход)
  const actualCoefficients = calculateBankCoefficients(
    variables,
    objectCost,
    bankOffer,
    userDownPaymentPercent,
    secondContractAmount,
  );

  // 🔥 ИСПРАВЛЕНО: используем динамическую субсидию из actualCoefficients
  const actualSubsidyPercent = actualCoefficients.subsidyPercent;
  const actualSubsidyRate = actualSubsidyPercent / 100;
  const actualSummCreditFamilyTwo =
    objectCost * actualCoefficients.requiredCoeffFamilyTwo;

  let finalContractAmount: number;

  if (isThresholdCondition) {
    if (noSubsidyInflate) {
      if (isWithinLimit) {
        finalContractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        finalContractAmount = Math.ceil((objectCost - downPayment) / 0.799);
      }
    } else {
      if (isWithinLimit) {
        finalContractAmount = actualSummCreditFamilyTwo / 0.799;
      } else {
        finalContractAmount = actualSummCreditFamilyTwo / 0.799;
      }
    }
  } else {
    if (noSubsidyInflate) {
      finalContractAmount = Math.ceil(objectCost);
    } else {
      if (isWithinLimit) {
        if (downPayment <= userDesiredDownPayment) {
          finalContractAmount = actualSummCreditFamilyTwo;
        } else {
          finalContractAmount = actualSummCreditFamilyTwo;
        }
      } else {
        if (downPayment <= userDesiredDownPayment) {
          finalContractAmount =
            objectCost + (maxLimit - limit) * actualSubsidyRate;
        } else if (downPayment > baseContractAmount - maxLimit) {
          finalContractAmount = actualSummCreditFamilyTwo;
        } else {
          finalContractAmount = actualSummCreditFamilyTwo;
        }
      }
    }
  }

  // 🔥 Пересчитываем суммы договоров для финального результата
  const finalFirstContract = Math.min(limit, finalContractAmount - downPayment);
  const finalSecondContract = Math.max(
    0,
    finalContractAmount - downPayment - limit,
  );

  console.log(`"2 договора" финальный результат:`, {
    contractAmount: finalContractAmount,
    firstContract: finalFirstContract,
    secondContract: finalSecondContract,
    subsidyPercent: actualSubsidyPercent,
    requiredCoeffFamilyTwo: actualCoefficients.requiredCoeffFamilyTwo,
  });

  return {
    contractAmount: Math.ceil(finalContractAmount),
  };
};
