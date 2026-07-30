// src/hooks/calculations/bankProgram/steps/calculateExcessLimit.ts

import { Variables } from "../../types/types";

interface CalculateExcessLimitParams {
  bankOffer: {
    type: string;
    excessLimit?: boolean;
  };
  variables: Variables;
  mortgageAmount: number;
  subsidyAmount: number;
  actualSubsidyPercent: number;
}

interface CalculateExcessLimitResult {
  subsidyAmount: number;
  excessLimit?: number;
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
  let excessLimit: number | undefined;

  if (bankOffer.excessLimit) {
    if (bankOffer.type === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.familyMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    } else if (bankOffer.type === "it") {
      const maxSubsidy =
        variables.itMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.itMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    }
  }

  return {
    subsidyAmount,
    excessLimit,
  };
};
