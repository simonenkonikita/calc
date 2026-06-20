// ========== РАСЧЕТ КОЭФФИЦИЕНТОВ ДЛЯ СЕМЕЙНОЙ/ИТ ИПОТЕКИ ==========
export const calculateFamilyItCoefficients = (
  downPaymentPercent: number, // B - Сумма ПВ (%)
  mortgagePercent: number, // C - Сумма ипотеки (%)
  subsidyPercent: number, // E - Сумма субсидии (%)
): {
  kefDownPayment: number; // D - Кайф ПВ
  creditFromSubsidyPercent: number; // F - Сумма кредита от субсидии
  kefSubsidy: number; // G - Кайф субсидии
  mortgageCoefficient: number; // H - Каэф ипотеки
  overstatementCoefficient: number; // I - Каэф завышения
  requiredCoeffWithMinPV: number; // J - Искомый каэф с мин ПВ
  requiredCoeffWithLargePV: number; // K - Искомый каэф с большим ПВ
  requiredCoeffWithoutPV: number; // L - Искомый каэф без ПВ
} => {
  const kefDownPayment = downPaymentPercent / mortgagePercent;
  const creditFromSubsidyPercent = 100 - subsidyPercent;
  const kefSubsidy = subsidyPercent / creditFromSubsidyPercent;
  const mortgageCoefficient =
    (mortgagePercent * creditFromSubsidyPercent) / 100;
  const overstatementCoefficient = 100 - mortgageCoefficient;

  const requiredCoeffWithMinPV =
    1 - (subsidyPercent / 100) * (mortgagePercent / 100);
  const requiredCoeffWithLargePV = 1 - subsidyPercent / 100;
  const requiredCoeffWithoutPV = overstatementCoefficient / mortgageCoefficient;

  return {
    kefDownPayment,
    creditFromSubsidyPercent,
    kefSubsidy,
    mortgageCoefficient,
    overstatementCoefficient,
    requiredCoeffWithMinPV,
    requiredCoeffWithLargePV,
    requiredCoeffWithoutPV,
  };
};
