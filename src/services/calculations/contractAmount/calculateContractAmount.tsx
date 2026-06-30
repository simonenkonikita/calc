import {
  BankOffer,
  ContractAmountResult,
  Variables,
} from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateFamilyContractAmount } from "./family/calculateFamilyContractAmount";
import { calculateStandardContractAmount } from "./standard/calculateStandardContractAmount";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
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
): ContractAmountResult => {
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

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
