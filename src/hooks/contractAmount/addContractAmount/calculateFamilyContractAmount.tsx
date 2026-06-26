import { BankCoefficients, BankOffer, Variables } from "../../../utils/types";

export const calculateFamilyContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  applyMinDownPayment: boolean,
  coefficients: BankCoefficients,
): number => {
  const limit = variables.familyMortgageLimit; // Переменные!$B$1
  const maxLimit = variables.maxFamilyMortgageSum; // Переменные!$B$2
  const subsidyPercent = bankOffer.subsidyPercent; // E
  const minPVPercent = bankOffer.minPVPercent; // J
  const maxPVPercent = 79.9; // K (из данных Сбербанка)

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const bankMinDownPayment = objectCost * (bankOffer.minPVPercent / 100);
  const actualMinDownPayment = applyMinDownPayment
    ? bankMinDownPayment
    : userDesiredDownPayment;

  // ============================================================
  // ПРОВЕРКА: ВПИСЫВАЕТСЯ ЛИ В ЛИМИТ
  // ============================================================
  // ($B$7/Сбербанк!J16)*(1-$B$8/100) <= Переменные!$B$1
  const minPVWithSubsidy =
    (objectCost / coefficients.requiredCoeffWithoutPV) *
    (1 - userDownPaymentPercent / 100);
  const isWithinLimit = minPVWithSubsidy <= limit;

  let contractAmount: number;

  if (isWithinLimit) {
    // ============================================================
    // ВЕТКА TRUE: ВПИСЫВАЕМСЯ В ЛИМИТ
    // ============================================================
    contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
  } else {
    // ============================================================
    // ВЕТКА FALSE: НЕ ВПИСЫВАЕМСЯ В ЛИМИТ (СВЕРХЛИМИТ)
    // ============================================================
    contractAmount = objectCost + limit * (subsidyPercent / 100);
  }

  return Math.ceil(contractAmount);
};
