import { BankCoefficients, BankOffer, Variables } from "../../utils/types";

export const calculateItContractAmount = (
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
  const limit = variables.itMortgageLimit; // Переменные!$B$3
  const maxAmount = variables.maxItMortgageSum; // Переменные!$B$4
  const subsidyPercent = bankOffer.subsidyPercent; // E
  const minPVPercent = bankOffer.minPVPercent; // J
  const maxPVPercent = 79.9; // K (из данных)

  // ============================================================
  // ПРОВЕРКА: ВПИСЫВАЕТСЯ ЛИ В ЛИМИТ
  // ============================================================
  const minPVWithSubsidy =
    (objectCost / (minPVPercent / 100)) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = minPVWithSubsidy <= limit;

  console.log("🏦 ИТ ипотека - проверка лимита:", {
    objectCost,
    minPVWithSubsidy,
    limit,
    isWithinLimit,
  });

  let contractAmount: number;

  if (isWithinLimit) {
    // ============================================================
    // ВЕТКА TRUE: ВПИСЫВАЕМСЯ В ЛИМИТ
    // ============================================================
    const isNoSubsidyCondition =
      mortgageWithoutDownPayment &&
      downPayment <
        (remainingAmount * coefficients.requiredCoeffWithoutPV +
          objectCost -
          downPayment) *
          (userDownPaymentPercent / 100);

    if (isNoSubsidyCondition && mortgageWithoutDownPayment) {
      contractAmount =
        remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment;
    } else if (downPayment <= objectCost * (minPVPercent / 100)) {
      contractAmount = objectCost / (minPVPercent / 100);
    } else {
      contractAmount = remainingAmount / (maxPVPercent / 100) + downPayment;
    }
  } else {
    // ============================================================
    // ВЕТКА FALSE: НЕ ВПИСЫВАЕМСЯ В ЛИМИТ
    // ============================================================
    contractAmount = objectCost + limit * (subsidyPercent / 100);
  }

  // Проверка на максимальную сумму
  if (contractAmount > maxAmount) {
    contractAmount = maxAmount;
  }

  console.log("🏦 ИТ ипотека - результат:", {
    contractAmount,
    isWithinLimit,
    limit,
    maxAmount,
  });

  return Math.ceil(contractAmount);
};
