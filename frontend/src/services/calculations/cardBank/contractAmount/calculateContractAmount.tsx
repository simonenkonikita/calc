import {
  BankCoefficients,
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../../utils/types";
import { calculateFamilyContractAmount } from "./family/calculateFamilyContractAmount";
import { calculateFamilyExcessLimitContractAmount } from "./family/calculateFamilyExcessLimitContractAmount";
import { calculateFamilyTwoContractAmount } from "./family/calculateFamilyTwoContractAmount";
import { calculateStandardContractAmount } from "./standard/calculateStandardContractAmount";

export const calculateContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  isSpecialMortgageMode: boolean,
  coefficients: BankCoefficients,
): ContractAmountResult => {
  if (bankOffer.type === "family" && bankOffer.isTwoContracts === true) {
    return calculateFamilyTwoContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  if (bankOffer.type === "family" && bankOffer.excessLimit === true) {
    return calculateFamilyExcessLimitContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  if (bankOffer.type === "family") {
    return calculateFamilyContractAmount(
      objectCost,
      downPayment,
      remainingAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      noSubsidyInflate,
      isSpecialMortgageMode,
      coefficients,
    );
  }

  return calculateStandardContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    coefficients,
  );
};
