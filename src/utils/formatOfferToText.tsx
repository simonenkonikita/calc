import { BankProgramResult } from "./types";

// Форматирование предложения в текст
export const formatOfferToText = (
  offer: BankProgramResult,
  formatMoney: (amount: number) => string,
  showOverstatement: boolean,
  mortgageWithoutDownPayment: boolean,
  loanTermYears: number,
): string => {
  const lines: string[] = [];

  lines.push(``);
  // Банк
  lines.push(`${offer.bank}`);

  // Формируем строку со ставкой
  if (offer.type === "short" && offer.shortRate) {
    lines.push(`Ставка ${offer.shortRate}% на ${offer.durationMonths} мес.`);
  } else if (offer.subsidyPercent > 0 && offer.type === "full") {
    lines.push(`Ставка ${offer.rate}% на весь срок`);
  } else {
    lines.push(`Ставка ${offer.rate}%`);
  }

  lines.push(`Стоимость: ${formatMoney(offer.contractAmount)}`);

  lines.push(`ПВ: ${formatMoney(offer.downPaymentAmount)}`);
  if (mortgageWithoutDownPayment) {
    lines.push(`Собственные средства: ${formatMoney(offer.ownFunds)}`);
    lines.push(`Вносим за клиента: ${formatMoney(offer.clientContribution)}`);
  }

  lines.push(`Ипотека: ${formatMoney(offer.mortgageAmount)}`);

  // Платеж
  if (offer.type === "short" && offer.monthlyPaymentAfter) {
    lines.push(`Платеж: ${formatMoney(offer.monthlyPayment)}`);
    lines.push(
      `далее ставка ${offer.rate}%: ${formatMoney(offer.monthlyPaymentAfter)}`,
    );
  } else {
    lines.push(`Платеж: ${formatMoney(offer.monthlyPayment)}`);
  }

  // ✅ Срок ипотеки из формы (loanTermYears)
  lines.push(`Срок(лет): ${loanTermYears} `);

  return lines.join("\n");
};
