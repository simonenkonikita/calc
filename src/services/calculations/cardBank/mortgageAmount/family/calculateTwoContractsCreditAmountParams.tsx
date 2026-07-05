// src/hooks/payment/mortgageAmount/calculateTwoContractsCreditAmount.ts

import { BankOffer, Variables } from "../../../../../utils/types";

interface CalculateTwoContractsCreditAmountParams {
  objectCost: number;
  downPayment: number;
  userDownPaymentPercent: number;
  bankOffer: BankOffer;
  variables: Variables;
  secondContractAmount: number;
  marketCommission: number; // КВ из матрицы
}

export const calculateTwoContractsCreditAmount = (
  params: CalculateTwoContractsCreditAmountParams,
): {
  firstContractCredit: number; // Сумма по льготному договору
  secondContractCredit: number; // Сумма по рыночному договору
  totalCredit: number; // Общая сумма кредита
} => {
  const {
    objectCost,
    downPayment,
    userDownPaymentPercent,
    bankOffer,
    variables,
    secondContractAmount,
    marketCommission,
  } = params;

  const limit = variables.familyMortgageLimit || 6000000;
  const maxLimit = variables.maxFamilyMortgageSum || 15000000;
  const pvRate = userDownPaymentPercent / 100;

  // 🔥 Льготная часть (первый договор) - всегда лимит или меньше
  const firstContractCredit = Math.min(limit, objectCost * (1 - pvRate));

  // 🔥 Рыночная часть (второй договор) - остаток
  // В Excel: Сумма рыночного кредита = (1 - ПВ%) * (Стоимость + Комиссия) - Лимит
  // Но с учетом удорожания и сохранения ПВ в %
  const baseCredit = objectCost * (1 - pvRate);
  const excessOverLimit = Math.max(0, baseCredit - limit);

  // Рыночная часть с учетом комиссии
  const secondContractCredit = excessOverLimit * (1 + marketCommission / 100);

  // Общая сумма кредита
  const totalCredit = firstContractCredit + secondContractCredit;

  return {
    firstContractCredit: Math.ceil(firstContractCredit),
    secondContractCredit: Math.ceil(secondContractCredit),
    totalCredit: Math.ceil(totalCredit),
  };
};
