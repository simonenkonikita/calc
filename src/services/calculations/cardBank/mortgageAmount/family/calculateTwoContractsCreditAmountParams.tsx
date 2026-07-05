// src/hooks/payment/mortgageAmount/calculateTwoContractsCreditAmount.ts

import { BankOffer, Variables } from "../../../../../utils/types";

interface CalculateTwoContractsCreditAmountParams {
  objectCost: number;
  downPayment: number;
  userDownPaymentPercent: number;
  bankOffer: BankOffer;
  variables: Variables;
  secondContractAmount: number;
  marketCommission: number;
}

// 🔥 Коэффициенты для рыночной части (T20, T21 из Excel)
// В Excel: T20 = коэффициент для первого порога, T21 = коэффициент для второго порога
const MARKET_COEFFICIENTS = {
  // Для суммы до 8 млн используем коэффициент 0.65
  T20: 0.65,
  // Для суммы от 8 млн используем коэффициент 0.75
  T21: 0.75,
  // Порог переключения (8 млн)
  THRESHOLD: 8000000,
  // Максимальная сумма для проверки
  MAX_AMOUNT: 15000000,
};

export const calculateTwoContractsCreditAmount = (
  params: CalculateTwoContractsCreditAmountParams,
): {
  firstContractCredit: number;
  secondContractCredit: number;
  totalCredit: number;
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

  // 🔥 Льготная часть (первый договор)
  const firstContractCredit = Math.min(limit, objectCost * (1 - pvRate));

  // 🔥 РАСЧЕТ РЫНОЧНОЙ ЧАСТИ ПО ФОРМУЛЕ ИЗ EXCEL
  // ============================================================
  // Формула из Excel:
  // =ЕСЛИ(
  //   (1-E9)*((T20*(E8+K26)+(1-T20)*E7)/(1-(1-E9)*T20))-H27 > T19*10^6;
  //   (1-E9)*((T21*(E8+K26)+(1-T21)*E7)/(1-(1-E9)*T21))-H27;
  //   (1-E9)*((T20*(E8+K26)+(1-T20)*E7)/(1-(1-E9)*T20))-H27
  // )
  // ============================================================

  const E7 = objectCost; // Стоимость объекта
  const E8 = downPayment; // Первоначальный взнос
  const E9 = pvRate; // Процент ПВ
  const K26 = marketCommission / 100; // Комиссия в долях (marketCommission из матрицы)
  const H27 = 0; // В расчете пока 0 (может быть сумма комиссии)

  // T19 * 10^6 - пороговая сумма (обычно 8 млн)
  const thresholdAmount = MARKET_COEFFICIENTS.THRESHOLD;

  // 🔥 Расчет с коэффициентом T20
  const T20 = MARKET_COEFFICIENTS.T20;
  const T21 = MARKET_COEFFICIENTS.T21;

  // Часть 1: (1-E9) * ((T20 * (E8 + K26) + (1 - T20) * E7) / (1 - (1 - E9) * T20)) - H27
  const numerator1 = T20 * (E8 + K26) + (1 - T20) * E7;
  const denominator1 = 1 - (1 - E9) * T20;
  const result1 = (1 - E9) * (numerator1 / denominator1) - H27;

  // Часть 2: (1-E9) * ((T21 * (E8 + K26) + (1 - T21) * E7) / (1 - (1 - E9) * T21)) - H27
  const numerator2 = T21 * (E8 + K26) + (1 - T21) * E7;
  const denominator2 = 1 - (1 - E9) * T21;
  const result2 = (1 - E9) * (numerator2 / denominator2) - H27;

  // 🔥 Выбираем нужный результат по условию
  // Если result1 > T19*10^6, то используем result2, иначе result1
  const marketCredit = result1 > thresholdAmount ? result2 : result1;

  // 🔥 Второй договор = рыночная часть - лимит
  const secondContractCredit = Math.max(0, marketCredit - limit);

  // Общая сумма кредита
  const totalCredit = firstContractCredit + secondContractCredit;

  return {
    firstContractCredit: Math.ceil(firstContractCredit),
    secondContractCredit: Math.ceil(secondContractCredit),
    totalCredit: Math.ceil(totalCredit),
  };
};
