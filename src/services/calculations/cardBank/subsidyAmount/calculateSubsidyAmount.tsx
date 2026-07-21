// src/hooks/calculations/bankProgram/steps/calculateSubsidyAmount.ts

import { variables } from "../../../../data/limitdDate";
import { BankOffer, Variables } from "../../../../utils/types";
import { getDynamicSubsidy } from "../../сoefficients/getDynamicSubsidy";

interface CalculateSubsidyAmountParams {
  bankOffer: BankOffer;
  objectCost: number;
  mortgageAmount: number;
  secondContractAmount?: number;
  variables: Variables;
  isTwoContracts: boolean;
  actualSubsidyPercent: number;
  userDownPaymentPercent: number;
  loanTermYears: number;
  noSubsidyInflate: boolean;
  minPVPercent: number;
}

interface CalculateSubsidyAmountResult {
  subsidyAmount: number;
  secondContractSubsidyPercent?: number;
  secondContractSubsidyAmount?: number;

  adjustedContractAmount?: number;
  adjustedDownPaymentAmount?: number;
  adjustedMortgageAmount?: number;
  adjustedFirstContractAmount?: number;
  adjustedSecondContractAmount?: number;
}

export const calculateSubsidyAmount = (
  params: CalculateSubsidyAmountParams,
): CalculateSubsidyAmountResult => {
  const {
    bankOffer,
    objectCost,
    mortgageAmount,
    secondContractAmount,
    isTwoContracts,
    actualSubsidyPercent,
    userDownPaymentPercent,
    loanTermYears,
    noSubsidyInflate,
    minPVPercent,
  } = params;

  let subsidyAmount: number;
  let secondContractSubsidyPercent: number | undefined;
  let secondContractSubsidyAmount: number | undefined;

  let adjustedContractAmount: number | undefined;
  let adjustedDownPaymentAmount: number | undefined;
  let adjustedMortgageAmount: number | undefined;
  let adjustedFirstContractAmount: number | undefined;
  let adjustedSecondContractAmount: number | undefined;

  // ============================================================
  // 1. РАСЧЕТ СУБСИДИИ
  // ============================================================
  if (isTwoContracts) {
    let secondContract = secondContractAmount || 0;

    // Получаем субсидию для второго договора
    if (
      bankOffer.dynamicSubsidyPercent &&
      bankOffer.dynamicSubsidyPercent.length > 0
    ) {
      secondContractSubsidyPercent = getDynamicSubsidy(
        bankOffer,
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

    // ============================================================
    // 1.2 КОРРЕКТИРОВКА ДЛЯ ДВУХ ДОГОВОРОВ С УЧЕТОМ noSubsidyInflate
    // ============================================================

    let newContractAmount: number;

    if (noSubsidyInflate) {
      newContractAmount = objectCost;
    } else {
      newContractAmount = objectCost + subsidyAmount;
    }

    // Шаг 2: Пересчитываем ПВ
    const minPVAmount = newContractAmount * (minPVPercent / 100);
    const calculatedDownPayment =
      newContractAmount - variables.familyMortgageLimit - secondContract;
    let newDownPaymentAmount = Math.max(minPVAmount, calculatedDownPayment);

    // Шаг 3: Пересчитываем ипотеку
    let newMortgageAmount = newContractAmount - newDownPaymentAmount;

    // Шаг 4: Пересчитываем разбивку по договорам
    let newFirstContractAmount = Math.min(
      newMortgageAmount,
      variables.familyMortgageLimit,
    );
    let newSecondContractAmount = Math.max(
      0,
      newMortgageAmount - variables.familyMortgageLimit,
    );

    // ============================================================
    // 1.3 ИТЕРАТИВНЫЙ ПЕРЕСЧЕТ (ЕСЛИ ВТОРОЙ ДОГОВОР ИЗМЕНИЛСЯ)
    // ============================================================
    const MAX_ITERATIONS = 10;
    let iteration = 0;
    let changed = true;

    while (changed && iteration < MAX_ITERATIONS) {
      changed = false;
      iteration++;

      // Если второй договор изменился - пересчитываем субсидию
      if (Math.abs(newSecondContractAmount - secondContract) > 1) {
        secondContract = newSecondContractAmount;
        changed = true;

        // Пересчитываем субсидию для нового второго договора
        if (
          bankOffer.dynamicSubsidyPercent &&
          bankOffer.dynamicSubsidyPercent.length > 0
        ) {
          secondContractSubsidyPercent = getDynamicSubsidy(
            bankOffer,
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

        // Пересчитываем сумму договора (если не noSubsidyInflate)
        if (!noSubsidyInflate) {
          newContractAmount = objectCost + subsidyAmount;
        } else {
          newContractAmount = objectCost;
        }

        // Пересчитываем ПВ
        const newMinPVAmount = newContractAmount * (minPVPercent / 100);
        const newCalculatedDownPayment =
          newContractAmount - variables.familyMortgageLimit - secondContract;
        newDownPaymentAmount = Math.max(
          newMinPVAmount,
          newCalculatedDownPayment,
        );

        // Пересчитываем ипотеку
        newMortgageAmount = newContractAmount - newDownPaymentAmount;

        // Пересчитываем разбивку по договорам
        newFirstContractAmount = Math.min(
          newMortgageAmount,
          variables.familyMortgageLimit,
        );
        newSecondContractAmount = Math.max(
          0,
          newMortgageAmount - variables.familyMortgageLimit,
        );
      }
    }

    // Сохраняем скорректированные значения
    adjustedContractAmount = newContractAmount;
    adjustedDownPaymentAmount = newDownPaymentAmount;
    adjustedMortgageAmount = newMortgageAmount;
    adjustedFirstContractAmount = newFirstContractAmount;
    adjustedSecondContractAmount = newSecondContractAmount;
  } else {
    // ============================================================
    // 2. ОБЫЧНАЯ ЛОГИКА ДЛЯ НЕ-ДВУХДОГОВОРНЫХ ПРОГРАММ
    // ============================================================
    subsidyAmount = mortgageAmount * (actualSubsidyPercent / 100);
  }
  // ============================================================
  // 3. РЕЗУЛЬТАТ
  // ============================================================
  return {
    subsidyAmount,
    secondContractSubsidyPercent,
    secondContractSubsidyAmount,
    adjustedContractAmount,
    adjustedDownPaymentAmount,
    adjustedMortgageAmount,
    adjustedFirstContractAmount,
    adjustedSecondContractAmount,
  };
};
