// backend/src/services/calculations/coefficients/calculateContractAmountWithSubsidy.ts

import { Offer } from "../../../entities/Offer";
import { BankCoefficients, Variables } from "../../../types/types";
import { calculateContractAmount } from "../cardBank/contractAmount/calculateContractAmount";


const createUpdatedCoefficients = (
  coefficients: BankCoefficients,
  subsidyPercent: number,
  userDownPaymentPercent: number,
  variables: Variables,
  objectCost: number,
): BankCoefficients => {
  const downPaymentPercent = userDownPaymentPercent || 0;
  const mortgagePercent = Math.max(1, 100 - downPaymentPercent);
  const pvRate = downPaymentPercent / 100;

  const subsidyRate = subsidyPercent / 100;
  const m10 = variables.familyMortgageLimit / objectCost;
  const denominator = 1 - (1 - pvRate) * subsidyRate;

  let requiredCoeffFamilyTwo = 1;
  if (denominator !== 0 && subsidyRate > 0) {
    requiredCoeffFamilyTwo =
      subsidyRate *
        (((1 - pvRate) * (1 - subsidyRate * m10)) / denominator - m10) +
      1;
  }

  return {
    ...coefficients,
    subsidyPercent: subsidyPercent,
    creditFromSubsidyPercent: Math.max(0, 100 - subsidyPercent),
    kefSubsidy: subsidyPercent > 0 ? subsidyPercent / (100 - subsidyPercent) : 0,
    mortgageCoefficient: (mortgagePercent * (100 - subsidyPercent)) / 100,
    overstatementCoefficient: 100 - (mortgagePercent * (100 - subsidyPercent)) / 100,
    requiredCoeffWithMinPV: 1 - (subsidyPercent / 100) * (mortgagePercent / 100),
    requiredCoeffWithLargePV: 1 - subsidyPercent / 100,
    requiredCoeffWithoutPV: (mortgagePercent * (100 - subsidyPercent)) / 100 > 0
      ? (100 - (mortgagePercent * (100 - subsidyPercent)) / 100) /
        ((mortgagePercent * (100 - subsidyPercent)) / 100)
      : 0,
    requiredCoeffFamilyTwo: requiredCoeffFamilyTwo,
  };
};

export const calculateContractAmountWithSubsidy = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  offer: Offer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
  subsidyPercent: number,
): number => {
  const updatedCoefficients = createUpdatedCoefficients(
    coefficients,
    subsidyPercent,
    userDownPaymentPercent,
    variables,
    objectCost,
  );

  const result = calculateContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    offer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    updatedCoefficients,
  );

  return result.contractAmount;
};