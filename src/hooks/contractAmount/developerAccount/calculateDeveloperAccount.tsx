import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../../сoefficients/calculateBankCoefficients";

interface CalculateDeveloperAccountParams {
  objectCost: number; // $B$7 / E32
  ownFunds: number; // $B$13 / J32
  mortgageAmount: number; // $B$14 / D32
  subsidyAmount: number; // C32
  contractAmount: number; // I32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10
  downPaymentAmount: number;
  noSubsidyInflate: boolean;
}

export const calculateDeveloperAccount = (
  params: CalculateDeveloperAccountParams,
): number => {
  const {
    objectCost,
    ownFunds,
    mortgageAmount,
    subsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    mortgageWithoutDownPayment,
    downPaymentAmount,
    noSubsidyInflate,
  } = params;

  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  // ============================================================
  // ОПРЕДЕЛЯЕМ ЛИМИТ В ЗАВИСИМОСТИ ОТ ТИПА ПРОГРАММЫ
  // ============================================================
  const limit = variables.familyMortgageLimit;

  const minPVPercent = coefficients.requiredCoeffWithMinPV; // Сбербанк!J16

  // ============================================================
  // ПРОВЕРКА: ВПИСЫВАЕМСЯ ЛИ В ЛИМИТ
  // ($B$7/Сбербанк!J16)*(1-$B$8/100) <= Переменные!$B$1
  // ============================================================
  const summCredit =
    (objectCost / minPVPercent) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;

  // ============================================================
  // РАСЧЕТ СУММЫ НА СЧЕТ ЗАСТРОЙЩИКА
  // ============================================================
  let developerAccount: number;

  if (isWithinLimit) {
    // ВПИСЫВАЕМСЯ В ЛИМИТ
    if (mortgageWithoutDownPayment) {
      // Ипотека без ПВ: E32 + I32 - J32
      developerAccount = ownFunds + mortgageAmount - subsidyAmount;
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  } else {
    if (mortgageWithoutDownPayment) {
      // Ипотека без ПВ: E32 + I32 - J32
      developerAccount = ownFunds + mortgageAmount - subsidyAmount;
    } else {
      // НЕ ВПИСЫВАЕМСЯ В ЛИМИТ: D32 + I32 - J32
      developerAccount = downPaymentAmount + mortgageAmount - subsidyAmount;
    }
  }
  return Math.ceil(developerAccount);
};

/* 
  let subsidyAmount = mortgageAmount * (bankOffer.subsidyPercent / 100); */

/* // 10. На счет застройщика
let developerAccount: number;
if (mortgageWithoutDownPayment) {
  developerAccount = ownFunds + mortgageAmount - subsidyAmount;
} else {
  developerAccount = contractAmount - subsidyAmount;
} */
