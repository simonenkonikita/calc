import { BankOffer, Variables } from "../../../../../utils/types";

export interface TrancheMortgageResult {
  mortgageAmount: number; // Общая сумма ипотеки
  firstTrancheAmount: number; // Сумма первого транша
  secondTrancheAmount: number; // Сумма второго транша
  isLimitExceeded: boolean;
}

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

export const calculateTrancheMortgageAmount = (
  params: calculateStandartMortgageAmount,
): TrancheMortgageResult => {
  const { contractAmount, downPaymentAmount, bankOffer } = params;

  const mortgageAmount = contractAmount - downPaymentAmount;
  const tranchePercent = bankOffer.trancheFirstPercent || 0;
  const firstTrancheAmount = contractAmount * (tranchePercent / 100);
  const secondTrancheAmount = mortgageAmount - firstTrancheAmount;

  console.log(1, mortgageAmount, firstTrancheAmount, secondTrancheAmount);

  return {
    mortgageAmount,
    firstTrancheAmount,
    secondTrancheAmount,
    isLimitExceeded: false,
  };
};
