import { BankOffer, Variables } from "../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateOwnFundsParams {
  objectCost: number; // $B$7
  downPayment: number; // $B$13 / J32 (введенный ПВ)
  downPaymentAmount: number; // D32 (рассчитанная сумма ПВ)
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10
}

/**
 * Расчет собственных средств
 *
 * Формула Excel для семейной/ИТ ипотеки:
 * =ЕСЛИ($B$7/Сбербанк!J16*(1-$B$8/100)<=Переменные!$B$1;
 *    ЕСЛИ($L$10=ИСТИНА;
 *       $B$13;
 *       D32
 *    );
 *    D32
 * )
 *
 * Где:
 * $B$7 = objectCost
 * $B$8 = userDownPaymentPercent
 * $B$13 = downPayment (введенный ПВ)
 * D32 = downPaymentAmount (рассчитанная сумма ПВ)
 * $L$10 = mortgageWithoutDownPayment
 * Сбербанк!J16 = minPVPercent
 * Переменные!$B$1 = familyMortgageLimit
 *
 * Логика:
 * 1. Если НЕ вписываемся в лимит → возвращаем downPaymentAmount
 * 2. Если вписываемся в лимит:
 *    - Если ипотека без ПВ → возвращаем downPayment (введенный ПВ)
 *    - Если с ПВ → возвращаем downPaymentAmount
 */
export const calculateOwnFunds = (params: CalculateOwnFundsParams): number => {
  const {
    objectCost,
    downPayment,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    mortgageWithoutDownPayment,
  } = params;

  // ============================================================
  // ПОЛУЧАЕМ КОЭФФИЦИЕНТЫ
  // ============================================================
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  // ============================================================
  // ОПРЕДЕЛЯЕМ ЛИМИТ
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
  // РАСЧЕТ СОБСТВЕННЫХ СРЕДСТВ
  // ============================================================
  // =ЕСЛИ($B$7/Сбербанк!J16*(1-$B$8/100)<=Переменные!$B$1;
  //    ЕСЛИ($L$10=ИСТИНА;
  //       $B$13;
  //       D32
  //    );
  //    D32
  // )
  let ownFunds: number;

  if (isWithinLimit) {
    // ВПИСЫВАЕМСЯ В ЛИМИТ
    if (mortgageWithoutDownPayment) {
      // Ипотека без ПВ → $B$13
      ownFunds = downPayment;
    } else {
      // С ПВ → D32
      ownFunds = downPaymentAmount;
    }
  } else {
    // НЕ ВПИСЫВАЕМСЯ В ЛИМИТ → D32
    ownFunds = downPaymentAmount;
  }

  return Math.ceil(ownFunds);
};
