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
  excessLimitAmount?: number;
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
  let excessLimitAmount: number | undefined;

  const programType = offer.programEntity?.type || "base";

  if (offer.isExcessLimit) {
    if (programType === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimitAmount = mortgageAmount - variables.familyMortgageLimit;
        if (excessLimitAmount < 0) excessLimitAmount = 0;
      }
    } else if (programType === "it") {
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
