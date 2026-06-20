import { SubsidyPaymentResult } from "../../../utils/types";
import { calculateFutureValue } from "../calculateFutureValue";
import { calculateMonthlyPayment } from "../standartPayment/calculateMonthlyPayment";

// ==========  РАСЧЕТ ПЛАТЕЖЕЙ С СУБСИДИЕЙ НА КОРОТКИЙ СРОК ПО МЕТОДОЛОГИИ СБЕРБАНКА ==========
export const calculateOnlyPercenkSubsidy = (
  mortgageAmount: number,
  shortRate: number,
  rate: number,
  loanTermMonths: number,
  durationMonths: number,
): SubsidyPaymentResult => {
  // const monthlyRate = rate / 100 / 12;
  const monthlyShortRate = shortRate / 100 / 12;
  const annuityCoeff = calculateAnnuityCoefficient(shortRate, durationMonths);

  // 1. Аннуитетный платеж по ПОЛНОЙ ставке на весь срок
  const fullPayment = calculateMonthlyPayment(
    mortgageAmount,
    rate,
    loanTermMonths,
  );

  /*   // 2. Рассчитываем остаток долга после льготного периода,  Сумма погашения ОД, Сумма процентов за 12 мес
  let remainingDebt = mortgageAmount;
  let totalPrincipalPaid = 0; // ← Сумма погашения ОД за 12 мес
  // let totalInterestPaid = 0; // ← Сумма процентов за 12 мес

  for (let month = 1; month <= durationMonths; month++) {
    const interestPayment = remainingDebt * monthlyRate;
    let principalPayment = fullPayment - interestPayment;

    if (principalPayment > remainingDebt) {
      principalPayment = remainingDebt;
    }
    remainingDebt -= principalPayment;
    totalPrincipalPaid += principalPayment; // ← Сумма погашения ОД за 12 мес
    // totalInterestPaid += interestPayment; // ← Сумма процентов за 12 мес
  } */

  // 2. Рассчитываем остаток долга после льготного периода,  Сумма погашения ОД, Сумма процентов за 12 мес
  const remainingDebt = calculateFutureValue(
    rate, // полная ставка
    durationMonths, // количество месяцев
    fullPayment, // ежемесячный платеж
    mortgageAmount, // начальная сумма
  );
  const totalPrincipalPaid = mortgageAmount - remainingDebt;

  // 3. Платеж на льготном периоде = аннуитет по полной ставке
  const principalPaidDuringSubsidy = mortgageAmount - totalPrincipalPaid; // B3 - G3
  const part1 = principalPaidDuringSubsidy * monthlyShortRate;

  // Часть 2: аннуитетный коэффициент на остаток долга
  // = G3 * ((B5/100/12) / C5)
  const part2 = totalPrincipalPaid * (monthlyShortRate / annuityCoeff);

  // Итоговый платеж на льготном периоде
  const monthlyPaymentSubsidy = part1 + part2;

  let monthlyPaymentAfter: number | null = null;

  // 4. Если субсидия не на весь срок и остался долг
  if (durationMonths < loanTermMonths && remainingDebt > 0) {
    const remainingMonths = loanTermMonths - durationMonths;
    monthlyPaymentAfter = calculateMonthlyPayment(
      remainingDebt,
      rate,
      remainingMonths,
    );
  }

  return {
    monthlyPaymentSubsidy: Math.ceil(monthlyPaymentSubsidy),
    monthlyPaymentAfter:
      monthlyPaymentAfter !== null ? Math.ceil(monthlyPaymentAfter) : null,
  };
};

export const calculateAnnuityCoefficient = (
  shortRate: number, // B5 - льготная ставка в %
  durationMonths: number, // C7 - срок льготного периода в месяцах
): number => {
  const monthlyRate = shortRate / 100 / 12;
  return 1 - Math.pow(1 + monthlyRate, -durationMonths);
};
