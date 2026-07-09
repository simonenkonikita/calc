// src/hooks/calculations/bankProgram/payment/tranche/calculateTranchePayments.ts

import { BankOffer, TranchePaymentsResult } from "../../../../../utils/types";
import { calculateMonthlyPayment } from "../calculateMonthlyPayment";

export const calculateTranchePayments = (
  bankOffer: BankOffer,
  firstTrancheAmount: number,
  secondTrancheAmount: number,
  mortgageAmount: number,
  loanTermMonths: number,
): TranchePaymentsResult => {
  console.log("🏦 Расчет платежей по траншевой ипотеке:", {
    firstTrancheAmount,
    secondTrancheAmount,
    mortgageAmount,
    loanTermMonths,
    trancheSecondDate: bankOffer.trancheSecondDate,
    rate: bankOffer.rate,
  });

  // 1. Проверяем наличие даты второго транша
  if (!bankOffer.trancheSecondDate) {
    console.warn(
      "⚠️ Дата второго транша не указана, используем стандартную (через 12 месяцев)",
    );
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 12);
    bankOffer.trancheSecondDate = defaultDate.toISOString().split("T")[0];
  }

  // 2. Дата начала (сегодня)
  const startDate = new Date().toISOString().split("T")[0];

  // 3. Количество месяцев до выдачи второго транша
  const monthsUntilSecondTranche = Math.max(
    0,
    calculateMonthsBetweenDates(startDate, bankOffer.trancheSecondDate),
  );

  // 4. Годовая ставка
  const annualRate = bankOffer.rate || 0;
  const monthlyRate = annualRate / 100 / 12;

  // 5. Расчет платежа по первому траншу
  const firstTranchePayment = calculateMonthlyPayment(
    firstTrancheAmount,
    annualRate,
    loanTermMonths,
  );

  // 6. Расчет процентов по первому траншу до выдачи второго
  // ❌ УДАЛЯЕМ ЭТУ ПЕРЕМЕННУЮ, ТАК КАК ОНА НЕ ИСПОЛЬЗУЕТСЯ
  // let interestAccruedFirstTranche = 0;
  let remainingFirstTranche = firstTrancheAmount;

  for (let i = 0; i < monthsUntilSecondTranche && i < loanTermMonths; i++) {
    const interest = remainingFirstTranche * monthlyRate;
    // ❌ УДАЛЯЕМ
    // interestAccruedFirstTranche += interest;
    const principalPayment = firstTranchePayment - interest;
    remainingFirstTranche -= principalPayment;

    if (remainingFirstTranche < 0) {
      remainingFirstTranche = 0;
      break;
    }
  }

  // 7. Остаток по первому траншу после периода
  const remainingAfterFirstPeriod = Math.max(0, remainingFirstTranche);

  // 8. Общая сумма после выдачи второго транша
  const totalRemaining = remainingAfterFirstPeriod + secondTrancheAmount;

  // 9. Пересчитываем платеж на оставшийся срок
  const remainingMonths = Math.max(
    1,
    loanTermMonths - monthsUntilSecondTranche,
  );

  const paymentAfterSecondTranche = calculateMonthlyPayment(
    totalRemaining,
    annualRate,
    remainingMonths,
  );

  // ✅ Возвращаем только нужные поля
  const result: TranchePaymentsResult = {
    firstTranchePayment,
    secondTranchePayment: paymentAfterSecondTranche,
    monthlyPayment: firstTranchePayment,
  };

  console.log("✅ Результат расчета траншевой ипотеки:", {
    firstTranchePayment,
    paymentAfterSecondTranche,
    monthsUntilSecondTranche,
  });

  return result;
};

// Вспомогательная функция для расчета месяцев между датами
const calculateMonthsBetweenDates = (date1: string, date2: string): number => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.warn("⚠️ Некорректные даты:", { date1, date2 });
      return 0;
    }

    const yearsDiff = d2.getFullYear() - d1.getFullYear();
    const monthsDiff = d2.getMonth() - d1.getMonth();
    const daysDiff = d2.getDate() - d1.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    if (daysDiff < 0) {
      totalMonths -= 1;
    }

    return Math.max(0, totalMonths);
  } catch (error) {
    console.error("❌ Ошибка при расчете месяцев между датами:", error);
    return 0;
  }
};
