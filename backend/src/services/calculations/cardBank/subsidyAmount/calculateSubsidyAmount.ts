// backend/src/services/calculations/bankProgram/steps/calculateSubsidyAmount.ts

import { Offer } from "../../../../entities/Offer";
import { getDynamicSubsidy } from "../../сoefficients/getDynamicSubsidy";

interface CalculateSubsidyAmountParams {
  offer: Offer;
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
    offer,
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
    const secondContract = secondContractAmount || 0;

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
  } else {
    // 🔥 Для обычных программ тоже проверяем динамические субсидии
    let effectiveSubsidyPercent = actualSubsidyPercent;

    if (offer.dynamicSubsidies && offer.dynamicSubsidies.length > 0) {
      const dynamicSubsidy = getDynamicSubsidy(
        offer.dynamicSubsidies,
        userDownPaymentPercent,
        mortgageAmount,
        loanTermYears,
      );

      // Используем динамическую субсидию, если она найдена
      if (dynamicSubsidy > 0) {
        effectiveSubsidyPercent = dynamicSubsidy;
      }
    }

    subsidyAmount = mortgageAmount * (effectiveSubsidyPercent / 100);
  }

  return {
    subsidyAmount,
    secondContractSubsidyPercent,
    secondContractSubsidyAmount,
  };
};
