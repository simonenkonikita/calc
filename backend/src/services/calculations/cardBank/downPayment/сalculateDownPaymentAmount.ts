import { Offer } from "../../../../entities/Offer";
import {
  BankOffer,
  Variables,
  BankCoefficients,
} from "../../../../types/types";
import { calculateFamilyDownPayment } from "./family/calculateFamilyDownPayment";
import { calculateFamilyExcessLimitDownPayment } from "./family/calculateFamilyExcessLimitDownPayment";
import { calculateFamilyTwoContractsDownPayment } from "./family/calculateFamilyTwoContractsDownPayment";
import { calculateStandardDownPayment } from "./standard/calculateStandardDownPayment";

// src/hooks/payment/downPayment/calculateDownPaymentAmount.ts
interface DownPaymentAmountParams {
  offer: Offer;
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  remainingAmount: number;
  noSubsidyInflate: boolean;
  coefficients: BankCoefficients;
  minDownPaymentPercent: number;
}

export const calculateDownPaymentAmount = (
  params: DownPaymentAmountParams,
): number => {
  const {
    offer,
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
    coefficients,
    minDownPaymentPercent,
  } = params;

  const programType = offer.programEntity?.type || "base";
  const isFamilyOrIt = programType === "family" || programType === "it";
  const isTwoContracts = isFamilyOrIt && offer.isTwoContracts === true;
  const isExcessLimit = isFamilyOrIt && offer.excessLimit === true;

  if (isTwoContracts) {
    return calculateFamilyTwoContractsDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      offer,
      remainingAmount,
      noSubsidyInflate,
    });
  }

  if (isExcessLimit) {
    return calculateFamilyExcessLimitDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      offer,
      remainingAmount,
      noSubsidyInflate,
    });
  }

  if (isFamilyOrIt) {
    return calculateFamilyDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      offer,
      remainingAmount,
      noSubsidyInflate,
    });
  }

  return calculateStandardDownPayment({
    contractAmount,
    downPayment,
    manualDownPayment,
    isSpecialMortgageMode,
    userDownPaymentPercent,
    objectCost,
    offer,
    minDownPaymentPercent,
  });
};
