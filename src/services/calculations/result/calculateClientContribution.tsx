import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateClientContributionParams {
  objectCost: number; // $B$7
  downPaymentAmount: number; // D32 (сумма ПВ)
  ownFunds: number; // E32 (собственные средства)
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  mortgageWithoutDownPayment: boolean; // $L$10 (не используется в расчете, но может понадобиться)
}

/**
 * Расчет суммы "Вносим за клиента"
 *
 * Формула Excel:
 * =ЕСЛИ($B$7/Сбербанк!J16*(1-$B$8/100)<=Переменные!$B$1; D32-E32; 0)
 *
 * Где:
 * $B$7 = objectCost
 * $B$8 = userDownPaymentPercent
 * D32 = downPaymentAmount (сумма ПВ)
 * E32 = ownFunds (собственные средства)
 * Сбербанк!J16 = minPVPercent
 * Переменные!$B$1 = familyMortgageLimit
 *
 * Логика:
 * - Если вписываемся в лимит → возвращаем downPaymentAmount - ownFunds
 * - Если НЕ вписываемся → возвращаем 0
 */
export const calculateClientContribution = (
  params: CalculateClientContributionParams,
): number => {
  const {
    objectCost,
    downPaymentAmount,
    ownFunds,
    userDownPaymentPercent,
    bankOffer,
    variables,
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
  const limit = bankOffer.excessLimit
    ? variables.maxFamilyMortgageSum || 15000000 // Если excessLimit true → 15 млн
    : variables.familyMortgageLimit || 6000000; // Иначе → 6 млн

  const minPVPercent = coefficients.requiredCoeffWithMinPV; // Сбербанк!J16

  // ============================================================
  // ПРОВЕРКА: ВПИСЫВАЕМСЯ ЛИ В ЛИМИТ
  // ($B$7/Сбербанк!J16)*(1-$B$8/100) <= Переменные!$B$1
  // ============================================================
  const summCredit =
    (objectCost / minPVPercent) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;

  // ============================================================
  // РАСЧЕТ ВНОСИМ ЗА КЛИЕНТА
  // ============================================================
  // =ЕСЛИ($B$7/Сбербанк!J16*(1-$B$8/100)<=Переменные!$B$1; D32-E32; 0)
  let clientContribution: number;

  if (isWithinLimit) {
    // Вписываемся в лимит → D32 - E32
    clientContribution = downPaymentAmount - ownFunds;
  } else {
    // Не вписываемся → 0
    clientContribution = 0;
  }

  return Math.ceil(clientContribution);
};
