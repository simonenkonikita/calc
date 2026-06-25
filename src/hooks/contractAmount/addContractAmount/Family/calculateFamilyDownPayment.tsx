// src/hooks/payment/downPayment/addContractAmount/Family/calculateFamilyDownPayment.ts

interface CalculateFamilyDownPaymentParams {
  objectCost: number;
  downPayment: number;
  contractAmount: number;
  userDownPaymentPercent: number;
  manualDownPayment: number;
  mortgageWithoutDownPayment: boolean;
  contractAmountMinPV: number;
  downPaymentFromContract: number;
  minPVPercent: number;
  limit: number;
  isWithinLimit: boolean;
}

/**
 * Расчет суммы ПВ для семейной и ИТ ипотеки
 *
 * Формула Excel:
 * =ЕСЛИ($B$7/Сбербанк!J16*(1-$B$8/100)<=Переменные!$B$1;
 *    ЕСЛИ($B$13<$B$7*$B$8/100;
 *       C33*$B$8/100;
 *       ЕСЛИ($B$13>=C33*$B$8/100;
 *          $B$13;
 *          C33*$B$8/100
 *       )
 *    );
 *    C33-Переменные!$B$1
 * )
 */
export const calculateFamilyDownPayment = (
  params: CalculateFamilyDownPaymentParams,
): number => {
  const {
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    // mortgageWithoutDownPayment,
    contractAmountMinPV,
    downPaymentFromContract,
    // minPVPercent,
    limit,
    isWithinLimit,
  } = params;

  let downPaymentAmount: number;

  // ============================================================
  // 1. ИПОТЕКА БЕЗ ПВ
  // ============================================================
  /*  if (mortgageWithoutDownPayment) {
    // Если ипотека без ПВ, то ПВ = минимальный ПВ
    downPaymentAmount = contractAmountMinPV;
    return Math.ceil(downPaymentAmount);
  } */

  // ============================================================
  // 2. РУЧНОЙ ВВОД ПВ
  // ============================================================
  if (manualDownPayment > 0) {
    // Берем максимум между ручным вводом и минимальным ПВ
    downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
    return Math.ceil(downPaymentAmount);
  }

  // ============================================================
  // 3. АВТОМАТИЧЕСКИЙ РАСЧЕТ
  // ============================================================

  // =ЕСЛИ($B$7/Сбербанк!J16*(1-$B$8/100)<=Переменные!$B$1;
  if (isWithinLimit) {
    // ============================================================
    // ВЕТКА TRUE: ВПИСЫВАЕМСЯ В ЛИМИТ
    // ============================================================

    const minPV = objectCost * (userDownPaymentPercent / 100);

    // =ЕСЛИ($B$13<$B$7*$B$8/100;
    if (downPayment < minPV) {
      // C33*$B$8/100
      downPaymentAmount = downPaymentFromContract;
    } else {
      // =ЕСЛИ($B$13>=C33*$B$8/100;
      if (downPayment >= downPaymentFromContract) {
        // $B$13
        downPaymentAmount = downPayment;
      } else {
        // C33*$B$8/100
        downPaymentAmount = downPaymentFromContract;
      }
    }
  } else {
    // ============================================================
    // ВЕТКА FALSE: НЕ ВПИСЫВАЕМСЯ В ЛИМИТ
    // ============================================================
    // C33 - Переменные!$B$1
    downPaymentAmount = contractAmount - limit;
  }

  /*  // ============================================================
  // 4. ПРОВЕРКА НА МИНИМАЛЬНЫЙ ПВ
  // ============================================================
  if (downPaymentAmount < contractAmountMinPV) {
    downPaymentAmount = contractAmountMinPV;
  }

  // ============================================================
  // 5. ПРОВЕРКА НА МАКСИМАЛЬНЫЙ ПВ (79.9%)
  // ============================================================
  const maxPVAmount = contractAmount * 0.799;
  if (downPaymentAmount > maxPVAmount) {
    downPaymentAmount = maxPVAmount;
  } */

  return Math.ceil(downPaymentAmount);
};
