// src/hooks/calculations/bankProgram/steps/calculateExcessLimit.ts

import { Variables } from "../types";

interface CalculateExcessLimitParams {
  bankOffer: {
    type: string;
    excessLimitAmount?: boolean;
  };
  variables: Variables;
  mortgageAmount: number;
  subsidyAmount: number;
  actualSubsidyPercent: number;
}

interface CalculateExcessLimitResult {
  subsidyAmount: number;
  excessLimitAmount?: number;
}

export const calculateExcessLimit = (
  params: CalculateExcessLimitParams,
): CalculateExcessLimitResult => {
  const {
    bankOffer,
    variables,
    mortgageAmount,
    subsidyAmount: initialSubsidyAmount,
    actualSubsidyPercent,
  } = params;

  let subsidyAmount = initialSubsidyAmount;
  let excessLimitAmount: number | undefined;

  if (bankOffer.excessLimitAmount) {
    if (bankOffer.type === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimitAmount = mortgageAmount - variables.familyMortgageLimit;
        if (excessLimitAmount < 0) excessLimitAmount = 0;
      }
    } else if (bankOffer.type === "it") {
      const maxSubsidy =
        variables.itMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimitAmount = mortgageAmount - variables.itMortgageLimit;
        if (excessLimitAmount < 0) excessLimitAmount = 0;
      }
    }
  }

  return {
    subsidyAmount,
    excessLimitAmount,
  };
};
