// backend/src/services/calculations/bankProgram/steps/calculateExcessLimit.ts

import { Offer } from "../../entities/Offer";
import { Variables } from "../../types/types";

interface CalculateExcessLimitParams {
  offer: Offer;
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
    offer,
    variables,
    mortgageAmount,
    subsidyAmount: initialSubsidyAmount,
    actualSubsidyPercent,
  } = params;

  let subsidyAmount = initialSubsidyAmount;
  let excessLimit: number | undefined;

  const programType = offer.programEntity?.type || "base";

  if (offer.excessLimit) {
    if (programType === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.familyMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    } else if (programType === "it") {
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
