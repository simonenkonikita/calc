import { BankProgramResult } from "../../../utils/types";

// Форматирование предложения в текст
export const formatOfferToText = (
  offer: BankProgramResult,
  formatMoney: (amount: number) => string,
  showOverstatement: boolean,
  mortgageWithoutDownPayment: boolean,
): string => {
  const lines: string[] = [];

  lines.push(`🏦 ${offer.bank}`);
  lines.push(`📋 Программа: ${offer.program}`);
  lines.push(`📊 Ставка: ${offer.rate}%`);
  lines.push(`💰 Ежемесячный платёж: ${formatMoney(offer.monthlyPayment)}`);
  lines.push(`📄 Сумма в договоре: ${formatMoney(offer.contractAmount)}`);
  lines.push(
    `💵 Первоначальный взнос: ${formatMoney(offer.downPaymentAmount)} (${offer.downPaymentPercent.toFixed(1)}%)`,
  );
  lines.push(`🏠 Ипотека: ${formatMoney(offer.mortgageAmount)}`);
  lines.push(`🏗️ На счёт застройщика: ${formatMoney(offer.developerAccount)}`);
  lines.push(`📅 Срок: ${offer.durationMonths || 360} месяцев`);

  if (showOverstatement) {
    lines.push(`📈 Завышение: ${formatMoney(offer.overstatement)}`);
    lines.push(`📈 Сумма субсидии: ${formatMoney(offer.subsidyAmount)}`);
  }

  if (mortgageWithoutDownPayment) {
    lines.push(`💳 Собственные средства: ${formatMoney(offer.ownFunds)}`);
    lines.push(
      `💳 Вносим за клиента: ${formatMoney(offer.clientContribution)}`,
    );
  }

  if (offer.excessLimit && offer.excessLimit > 0) {
    lines.push(`⚡ Сверхлимит: ${formatMoney(offer.excessLimit)}`);
  }

  return lines.join("\n");
};
