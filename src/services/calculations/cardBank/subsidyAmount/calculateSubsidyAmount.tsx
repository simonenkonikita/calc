// src/hooks/calculations/bankProgram/steps/calculateSubsidyAmount.ts

import { BankOffer } from "../../../../utils/types";
import { getDynamicSubsidy } from "../../сoefficients/getDynamicSubsidy";

interface CalculateSubsidyAmountParams {
  bankOffer: BankOffer;
  mortgageAmount: number;
  secondContractAmount?: number;
  isTwoContracts: boolean;
  actualSubsidyPercent: number;
  userDownPaymentPercent: number;
  loanTermYears: number;
}

interface CalculateSubsidyAmountResult {
  subsidyAmount: number;
  secondContractSubsidyPercent?: number;
  secondContractSubsidyAmount?: number;
}

export const calculateSubsidyAmount = (
  params: CalculateSubsidyAmountParams,
): CalculateSubsidyAmountResult => {
  const {
    bankOffer,
    mortgageAmount,
    secondContractAmount,
    isTwoContracts,
    actualSubsidyPercent,
    userDownPaymentPercent,
    loanTermYears,
  } = params;

  let subsidyAmount: number;
  let secondContractSubsidyPercent: number | undefined;
  let secondContractSubsidyAmount: number | undefined;

  if (isTwoContracts) {
    // Для двух договоров субсидия считается от суммы ВТОРОГО договора
    const secondContract = secondContractAmount || 0;

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
  } else {
    subsidyAmount = mortgageAmount * (actualSubsidyPercent / 100);
  }

  return {
    subsidyAmount,
    secondContractSubsidyPercent,
    secondContractSubsidyAmount,
  };
};
