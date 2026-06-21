import { BankOffer, BankCoefficients } from "../../utils/types";

// ========== РАСЧЕТ КОЭФФИЦИЕНТОВ БАНКА ==========
export const calculateBankCoefficients = (
  bankOffer: BankOffer,
  userDownPaymentPercent: number,
): BankCoefficients => {
  const downPaymentPercent = userDownPaymentPercent;
  const mortgagePercent = 100 - downPaymentPercent;
  const subsidyPercent = bankOffer.subsidyPercent;

  const kefDownPayment = downPaymentPercent / mortgagePercent;
  const creditFromSubsidyPercent = 100 - subsidyPercent;
  const kefSubsidy = subsidyPercent / creditFromSubsidyPercent;
  // Каэффициент ипотеки: (сумма ипотеки) / 100
  const mortgageCoefficient = (mortgagePercent * (100 - subsidyPercent)) / 100;
  // Каэффициент завышения: 100 - mortgageCoefficient * 100
  const overstatementCoefficient = 100 - mortgageCoefficient;

  // Искомый каэф с мин ПВ
  const requiredCoeffWithMinPV =
    1 - (subsidyPercent / 100) * (mortgagePercent / 100);
  // Искомый каэф с большим ПВ
  const requiredCoeffWithLargePV = 1 - subsidyPercent / 100;
  // Искомый каэф без  ПВ
  const requiredCoeffWithoutPV = overstatementCoefficient / mortgageCoefficient;

  return {
    programName: bankOffer.program,
    downPaymentPercent,
    mortgagePercent,
    kefDownPayment,
    subsidyPercent,
    creditFromSubsidyPercent,
    kefSubsidy,
    mortgageCoefficient,
    overstatementCoefficient,
    requiredCoeffWithMinPV,
    requiredCoeffWithLargePV,
    requiredCoeffWithoutPV,
  };
};
