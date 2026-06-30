import { SubsidyPaymentResult } from "../../../../utils/types";
import { calculateFutureValue } from "../calculateFutureValue";
import { calculateMonthlyPayment } from "../calculateMonthlyPayment";

// ========== РАСЧЕТ ПЛАТЕЖЕЙ С СУБСИДИЕЙ НА КОРОТКИЙ СРОК ==========
export const calculateStandardSubsidy = (
  mortgageAmount: number, // Сумма кредита
  shortRate: number, // Ставка в период субсидирования (%)
  rate: number, // Полная ставка после субсидирования (%)
  loanTermMonths: number, // Общий срок кредита (месяцы)
  durationMonths: number, // Срок субсидирования (месяцы)
): SubsidyPaymentResult => {
  // Платёж в период субсидирования (по льготной ставке на ВЕСЬ срок)
  const monthlyPaymentSubsidy = calculateMonthlyPayment(
    mortgageAmount,
    shortRate,
    loanTermMonths,
  );

  let monthlyPaymentAfter: number | null = null;

  // Если субсидия не на весь срок
  if (durationMonths < loanTermMonths) {
    // Остаток долга после окончания субсидирования
    const remainingDebt = calculateFutureValue(
      shortRate,
      durationMonths,
      monthlyPaymentSubsidy,
      mortgageAmount,
    );

    // Оставшиеся месяцы
    const remainingMonths = loanTermMonths - durationMonths;

    // Платёж после субсидирования (по полной ставке на ОСТАТОК долга)
    if (remainingMonths > 0 && remainingDebt > 0) {
      monthlyPaymentAfter = calculateMonthlyPayment(
        remainingDebt,
        rate,
        remainingMonths,
      );
    }
  }

  return {
    monthlyPaymentSubsidy: Math.ceil(monthlyPaymentSubsidy),
    monthlyPaymentAfter:
      monthlyPaymentAfter !== null ? Math.ceil(monthlyPaymentAfter) : null,
  };
};
