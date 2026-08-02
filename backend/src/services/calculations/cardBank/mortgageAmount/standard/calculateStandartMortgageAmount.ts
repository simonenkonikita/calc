import {
  BankOffer,
  Variables,
  MortgageAmountResult,
} from "../../../../../types/types";

interface calculateStandartMortgageAmount {
  objectCost: number; // $B$7
  contractAmount: number; // C32
  downPayment: number;
  remainingAmount: number;
  downPaymentAmount: number; // D32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isSpecialMortgageMode: boolean;
}

export const calculateStandartMortgageAmount = (
  params: calculateStandartMortgageAmount,
): MortgageAmountResult => {
  const { contractAmount, downPaymentAmount } = params;

  return {
    mortgageAmount: contractAmount - downPaymentAmount,
    isLimitExceeded: false,
  };
};
