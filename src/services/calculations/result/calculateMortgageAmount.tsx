import { BankOffer, Variables } from "../../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

interface CalculateMortgageAmountParams {
  objectCost: number; // $B$7
  contractAmount: number; // C32
  downPaymentAmount: number; // D32
  userDownPaymentPercent: number; // $B$8
  bankOffer: BankOffer;
  variables: Variables;
  isFamilyOrIt: boolean;
}

export const calculateMortgageAmount = (
  params: CalculateMortgageAmountParams,
): number => {
  const {
    objectCost,
    contractAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isFamilyOrIt,
  } = params;

  // ============================================================
  // 1. ДЛЯ ОБЫЧНОЙ ИПОТЕКИ (full, short) — простая формула
  // ============================================================
  if (!isFamilyOrIt) {
    return contractAmount - downPaymentAmount;
  }

  // ============================================================
  // 2. ДЛЯ СЕМЕЙНОЙ/ИТ ИПОТЕКИ — с проверкой лимита
  // ============================================================

  // 2.1 Получаем коэффициенты
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  // 2.2 Определяем лимит в зависимости от типа программы
  const limit =
    bankOffer.type === "family"
      ? variables.familyMortgageLimit
      : bankOffer.type === "it"
        ? variables.itMortgageLimit
        : variables.familyMortgageLimit; // fallback

  const minPVPercent = coefficients.requiredCoeffWithMinPV; // Сбербанк!J16

  // 2.3 Проверяем, вписываемся ли в лимит
  // ($B$7/Сбербанк!J16)*(1-$B$8/100) <= Переменные!$B$1
  const summCredit =
    (objectCost / (minPVPercent / 100)) * (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;

  // 2.4 Расчет суммы ипотеки
  // =ЕСЛИ(...; C32-D32; Переменные!$B$1)
  if (isWithinLimit) {
    // ВПИСЫВАЕМСЯ В ЛИМИТ → C32 - D32
    return contractAmount - downPaymentAmount;
  } else {
    // НЕ ВПИСЫВАЕМСЯ В ЛИМИТ → лимит
    return limit;
  }
};
