// src/hooks/payment/downPayment/calculateFamilyItDownPayment.ts

interface FamilyItDownPaymentParams {
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
export const calculateFamilyItDownPayment = (
  params: FamilyItDownPaymentParams,
): number => {
  const {
    objectCost,
    downPayment,
    contractAmount,
    //userDownPaymentPercent,
    manualDownPayment,
    mortgageWithoutDownPayment,
    contractAmountMinPV,
    downPaymentFromContract,
    minPVPercent,
    limit,
    isWithinLimit,
  } = params;

  let downPaymentAmount: number;

  // Ипотека без ПВ
  if (mortgageWithoutDownPayment) {
    downPaymentAmount = contractAmountMinPV;
  }
  // Ручной ввод ПВ
  else if (manualDownPayment > 0) {
    downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
  }
  // Вписываемся в лимит
  else if (isWithinLimit) {
    // =ЕСЛИ($B$13<$B$7*$B$8/100; C33*$B$8/100; ЕСЛИ($B$13>=C33*$B$8/100; $B$13; C33*$B$8/100))
    const minPV = objectCost * (minPVPercent / 100);

    if (downPayment < minPV) {
      // ПВ меньше минимального → берем ПВ от суммы в договоре
      downPaymentAmount = downPaymentFromContract;
    } else if (downPayment >= downPaymentFromContract) {
      // ПВ больше или равен ПВ от суммы в договоре → берем введенный ПВ
      downPaymentAmount = downPayment;
    } else {
      // Иначе → берем ПВ от суммы в договоре
      downPaymentAmount = downPaymentFromContract;
    }
  }
  // НЕ вписываемся в лимит
  else {
    // C33 - Переменные!$B$1
    downPaymentAmount = contractAmount - limit;
  }

  return Math.ceil(downPaymentAmount);
};
