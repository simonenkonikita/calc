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
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  offer: Offer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
  remainingAmount: number;
  noSubsidyInflate: boolean;
  coefficients: BankCoefficients;
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
    offer,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
    coefficients,
  } = params;

  // 🔥 Получаем тип программы
  const programType = offer.programEntity?.type || "base";

  if (programType === "family" && offer.isTwoContracts === true) {
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

  if (programType === "family" && offer.excessLimit === true) {
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

  if (programType === "family") {
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
  });
};
