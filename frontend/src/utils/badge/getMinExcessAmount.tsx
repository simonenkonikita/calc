// src/utils/badge/getMinExcessAmount.ts

import { BankProgramResultWithIndex } from "../types";

export const getMinExcessAmount = (
  offer: BankProgramResultWithIndex,
): number => {
  if (offer.minLoanAmount) {
    return offer.minLoanAmount;
  }

  const isIt = offer.type === "it";
  return isIt ? 9000000 : 6000000;
};

export const getMaxExcessAmount = (
  offer: BankProgramResultWithIndex,
): number => {
  if (offer.maxLoanAmount) {
    return offer.maxLoanAmount;
  }

  const isIt = offer.type === "it";
  return isIt ? 18000000 : 15000000;
};
