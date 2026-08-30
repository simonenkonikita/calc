// src/hooks/calculations/bankProgram/steps/adjustTwoContracts.ts

import { Offer } from "../../../../../entities/Offer";
import { BankOffer, Variables } from "../../../../../types/types";
import { getDynamicSubsidy } from "../../../сoefficients/getDynamicSubsidy";

interface AdjustTwoContractsParams {
  offer: Offer;
  objectCost: number;
  ownFunds: number;
  mortgageAmount: number;
  secondContractAmount: number;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  isFamilyOrIt: boolean;
  actualSubsidyPercent: number;
  userDownPaymentPercent: number;
  loanTermYears: number;
  noSubsidyInflate: boolean;
  minPVPercent: number;
}

interface AdjustTwoContractsResult {
  adjustedContractAmount: number;
  adjustedDownPaymentAmount: number;
  adjustedMortgageAmount: number;
  adjustedFirstContractAmount: number;
  adjustedSecondContractAmount: number;
  adjustedClientContribution: number;
  subsidyAmount: number;
  secondContractSubsidyPercent: number;
  secondContractSubsidyAmount: number;
}

export const adjustTwoContracts = (
  params: AdjustTwoContractsParams,
): AdjustTwoContractsResult => {
  const {
    offer,
    objectCost,
    ownFunds,
    mortgageAmount,
    secondContractAmount,
    variables,
    isSpecialMortgageMode,
    isFamilyOrIt,
    actualSubsidyPercent,
    userDownPaymentPercent,
    loanTermYears,
    noSubsidyInflate,
    minPVPercent,
  } = params;

  const isIt = offer.programEntity?.type === "it";

  const limit = isIt
    ? variables.itMortgageLimit || 9000000
    : variables.familyMortgageLimit || 6000000;

  const maxLimit = isIt
    ? variables.maxItMortgageLimit || 18000000
    : variables.maxFamilyMortgageLimit || 15000000;

  let secondContract = secondContractAmount || 0;

  // ============================================================
  // 1. РАСЧЕТ СУБСИДИИ
  // ============================================================
  let secondContractSubsidyPercent = actualSubsidyPercent;

  if (offer.dynamicSubsidies && offer.dynamicSubsidies.length > 0) {
    secondContractSubsidyPercent = getDynamicSubsidy(
      offer.dynamicSubsidies,
      userDownPaymentPercent,
      secondContract,
      loanTermYears,
    );
  }

  let secondContractSubsidyAmount =
    secondContract * (secondContractSubsidyPercent / 100);
  let subsidyAmount = secondContractSubsidyAmount;

  // ============================================================
  // 2. ОПРЕДЕЛЯЕМ НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
  // ============================================================
  let newContractAmount: number;

  if (noSubsidyInflate) {
    newContractAmount = objectCost;
  } else {
    newContractAmount = objectCost + subsidyAmount;
  }

  // ============================================================
  // 3. РАСЧЕТ ПВ
  // ============================================================
  const minPVAmount = newContractAmount * (minPVPercent / 100);
  let calculatedDownPayment: number;

  if (isSpecialMortgageMode) {
    // Специальный режим (без ПВ или с частичным ПВ)
    calculatedDownPayment = newContractAmount - limit - secondContract;
  } else {
    // Обычный режим
    calculatedDownPayment = newContractAmount - limit - secondContract;
  }

  let newDownPaymentAmount = Math.max(minPVAmount, calculatedDownPayment);

  // ============================================================
  // 4. ПЕРЕСЧИТЫВАЕМ ИПОТЕКУ
  // ============================================================
  let newMortgageAmount = newContractAmount - newDownPaymentAmount;

  // ============================================================
  // 5. РАЗБИВКА ПО ДОГОВОРАМ
  // ============================================================
  let newFirstContractAmount = Math.min(newMortgageAmount, limit);
  let newSecondContractAmount = Math.max(0, newMortgageAmount - limit);

  // ============================================================
  // 6. ИТЕРАТИВНЫЙ ПЕРЕСЧЕТ
  // ============================================================
  const MAX_ITERATIONS = 10;
  let iteration = 0;
  let changed = true;

  while (changed && iteration < MAX_ITERATIONS) {
    changed = false;
    iteration++;

    if (Math.abs(newSecondContractAmount - secondContract) > 1) {
      secondContract = newSecondContractAmount;
      changed = true;

      // Пересчитываем субсидию
      if (offer.dynamicSubsidies && offer.dynamicSubsidies.length > 0) {
        secondContractSubsidyPercent = getDynamicSubsidy(
          offer.dynamicSubsidies,
          userDownPaymentPercent,
          secondContract,
          loanTermYears,
        );
      } else {
        secondContractSubsidyPercent = actualSubsidyPercent;
      }

      secondContractSubsidyAmount =
        secondContract * (secondContractSubsidyPercent / 100);
      subsidyAmount = secondContractSubsidyAmount;

      // Пересчитываем сумму договора
      if (!noSubsidyInflate) {
        newContractAmount = objectCost + subsidyAmount;
      } else {
        newContractAmount = objectCost;
      }

      // Пересчитываем ПВ
      const newMinPVAmount = newContractAmount * (minPVPercent / 100);
      const newCalculatedDownPayment =
        newContractAmount - limit - secondContract;
      newDownPaymentAmount = Math.max(newMinPVAmount, newCalculatedDownPayment);

      // Пересчитываем ипотеку
      newMortgageAmount = newContractAmount - newDownPaymentAmount;

      // Пересчитываем разбивку
      newFirstContractAmount = Math.min(newMortgageAmount, limit);
      newSecondContractAmount = Math.max(0, newMortgageAmount - limit);
    }
  }

  // ============================================================
  // 7. РАСЧЕТ ВЗНОСА ЗА КЛИЕНТА
  // ============================================================
  let newClientContribution = newDownPaymentAmount - ownFunds;
  if (newClientContribution < 0) {
    newClientContribution = 0;
  }

  // ============================================================
  // 8. РЕЗУЛЬТАТ
  // ============================================================
  return {
    adjustedContractAmount: newContractAmount,
    adjustedDownPaymentAmount: newDownPaymentAmount,
    adjustedMortgageAmount: newMortgageAmount,
    adjustedFirstContractAmount: newFirstContractAmount,
    adjustedSecondContractAmount: newSecondContractAmount,
    adjustedClientContribution: newClientContribution,
    subsidyAmount,
    secondContractSubsidyPercent,
    secondContractSubsidyAmount,
  };
};
