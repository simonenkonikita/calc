// ========== ДИНАМИЧЕСКИЕ СУБСИДИИ ДЛЯ СОВКОМБАНКА ==========
export const getSovcombankSubsidyByDownPayment = (
  downPaymentPercent: number,
  baseSubsidy: number,
): number => {
  if (downPaymentPercent >= 50) {
    return baseSubsidy - 0.7; // Пример: 14.7 вместо 15.4
  } else if (downPaymentPercent >= 30) {
    return baseSubsidy - 0.2; // Пример: 15.2 вместо 15.4
  }
  return baseSubsidy;
};
