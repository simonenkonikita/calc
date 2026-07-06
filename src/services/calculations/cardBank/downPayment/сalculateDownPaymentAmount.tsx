import { BankOffer, Variables } from "../../../../utils/types";
import { calculateBankCoefficients } from "../../сoefficients/calculateBankCoefficients";
import { calculateFamilyDownPayment } from "./family/calculateFamilyDownPayment";
import { calculateFamilyExcessLimitDownPayment } from "./family/calculateFamilyExcessLimitDownPayment";
import { calculateFamilyTwoContractsDownPayment } from "./family/calculateFamilyTwoContractsDownPayment";
import { calculateStandardDownPayment } from "./standard/calculateStandardDownPayment";

// src/hooks/payment/downPayment/calculateDownPaymentAmount.ts
interface DownPaymentAmountParams {
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  remainingAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateDownPaymentAmount = (
  params: DownPaymentAmountParams,
): number => {
  const {
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
  } = params;

  const coefficients = calculateBankCoefficients(
    variables,
    objectCost,
    bankOffer,
    userDownPaymentPercent,
  );

  if (bankOffer.type === "family" && bankOffer.isTwoContracts === true) {
    return calculateFamilyTwoContractsDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      bankOffer,
      remainingAmount,
      noSubsidyInflate,
    });
  }

  if (bankOffer.type === "family" && bankOffer.excessLimit === true) {
    return calculateFamilyExcessLimitDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      bankOffer,
      remainingAmount,
      noSubsidyInflate,
    });
  }

  if (bankOffer.type === "family") {
    return calculateFamilyDownPayment({
      objectCost,
      downPayment,
      contractAmount,
      userDownPaymentPercent,
      manualDownPayment,
      isSpecialMortgageMode,
      coefficients,
      variables,
      bankOffer,
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
    bankOffer,
  });
};
