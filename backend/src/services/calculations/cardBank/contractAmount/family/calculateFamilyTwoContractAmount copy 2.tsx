// src/hooks/calculations/bankProgram/contractAmount/family/calculateFamilyTwoContractAmount.tsx

import {
  BankOffer,
  Variables,
  BankCoefficients,
  ContractAmountResult,
} from "../../../../../types/types";
import { getDynamicSubsidy } from "../../../сoefficients/getDynamicSubsidy";

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

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const cafsummCred = 1 - userDownPaymentPercent / 100;
  const summCreditMinPV = objectCost / coefficients.requiredCoeffWithMinPV;
  const summCreditWithoutPV =
    remainingAmount * coefficients.requiredCoeffWithoutPV +
    objectCost -
    downPayment;

  let summCredit: number;
  let isWithinLimit: boolean;
  let contractAmount: number;

  if (noSubsidyInflate && !isSpecialMortgageMode) {
    return {
      contractAmount: Math.ceil(objectCost),
    };
  }

  if (isSpecialMortgageMode) {
    summCredit = summCreditWithoutPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  } else {
    summCredit = summCreditMinPV * cafsummCred;
    isWithinLimit = summCredit <= maxLimit;
  }

  const estimatedSecondContract = Math.max(0, summCredit - limit);

  let secondContractSubsidyPercent = coefficients.subsidyPercent;

  if (
    bankOffer.dynamicSubsidyPercent &&
    bankOffer.dynamicSubsidyPercent.length > 0
  ) {
    secondContractSubsidyPercent = getDynamicSubsidy(
      bankOffer,
      userDownPaymentPercent,
      estimatedSecondContract,
      30,
    );
  }

  const effectiveSubsidyRate = secondContractSubsidyPercent / 100;
  const subsidyAmount = estimatedSecondContract * effectiveSubsidyRate;

  if (noSubsidyInflate) {
    contractAmount = Math.ceil(objectCost);

    // 🔥 Для специального режима (без ПВ) и noSubsidyInflate
    // Нужно также пересчитать ПВ, чтобы он был не меньше минимального
    if (isSpecialMortgageMode) {
      // Минимальный ПВ от суммы договора
      const minPVAmount = contractAmount * (bankOffer.minPVPercent / 100);
      // ПВ = сумма договора - 6 млн - второй договор
      const calculatedDownPayment =
        contractAmount - limit - estimatedSecondContract;
      // Берем максимум из минимального и рассчитанного
      const finalDownPayment = Math.max(minPVAmount, calculatedDownPayment);

      // Пересчитываем сумму кредита с новым ПВ
      const newMortgageAmount = contractAmount - finalDownPayment;
      const newFirstContract = Math.min(newMortgageAmount, limit);
      const newSecondContract = Math.max(0, newMortgageAmount - limit);

      // Пересчитываем субсидию с новым вторым договором
      let newSubsidyPercent = coefficients.subsidyPercent;
      if (
        bankOffer.dynamicSubsidyPercent &&
        bankOffer.dynamicSubsidyPercent.length > 0
      ) {
        newSubsidyPercent = getDynamicSubsidy(
          bankOffer,
          userDownPaymentPercent,
          newSecondContract,
          30,
        );
      }
      const newSubsidyAmount = newSecondContract * (newSubsidyPercent / 100);

      // 🔥 При noSubsidyInflate субсидия НЕ добавляется к сумме договора
      // contractAmount остается = objectCost
    }

    return {
      contractAmount: Math.ceil(contractAmount),
      // Дополнительные поля для отладки (опционально)
      // subsidyAmount: Math.ceil(subsidyAmount),
      // secondContractSubsidyPercent,
    };
  }

  // ============================================================
  // 4. РАСЧЕТ С ЗАВЫШЕНИЕМ НА СУБСИДИЮ (noSubsidyInflate = false)
  // ============================================================
  const summCreditFamilyTwo = objectCost * coefficients.requiredCoeffFamilyTwo;
  const baseContractAmount = objectCost + maxLimit * effectiveSubsidyRate;

  if (isSpecialMortgageMode) {
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
          contractAmount =
            objectCost + (maxLimit - limit) * effectiveSubsidyRate;
        } else if (downPayment > baseContractAmount - maxLimit) {
          contractAmount = summCreditFamilyTwo;
        } else {
          contractAmount = summCreditFamilyTwo;
        }
      }
    }
  }

  return {
    contractAmount: Math.ceil(contractAmount),
  };
};
