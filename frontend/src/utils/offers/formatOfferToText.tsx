import { BankProgramResult } from "../types";

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

  // ============================================================
  // 1. СТАВКИ
  // ============================================================
  if (offer.type === "short" && offer.shortRate) {
    lines.push(`Ставка ${offer.shortRate}% на ${offer.durationMonths} мес.`);
  } else if (offer.subsidyPercent > 0 && offer.type === "full") {
    lines.push(`Ставка ${offer.rate}% на весь срок`);
  } else {
    lines.push(`Ставка ${offer.rate}%`);
  }

  if (offer.isTwoContracts === true) {
    lines.push(`Ставка по второму договору ${offer.twoRate}%`);
  }

  // ============================================================
  // 2. СТОИМОСТЬ
  // ============================================================
  lines.push(`Стоимость: ${formatMoney(offer.contractAmount)}`);

  // ============================================================
  // 3. ПВ И СОБСТВЕННЫЕ СРЕДСТВА
  // ============================================================
  lines.push(`ПВ: ${formatMoney(offer.downPaymentAmount)}`);

  if (mortgageWithoutDownPayment) {
    lines.push(`Собственные средства: ${formatMoney(offer.ownFunds)}`);
    lines.push(`Вносим за клиента: ${formatMoney(offer.clientContribution)}`);
  }

  // ============================================================
  // 4. ИПОТЕКА
  // ============================================================
  lines.push(`Ипотека: ${formatMoney(offer.mortgageAmount)}`);

  // ============================================================
  // 5. ДВА ДОГОВОРА (СЕМЕЙНАЯ/ИТ)
  // ============================================================
  if (offer.isTwoContracts === true) {
    lines.push(
      `1 договор: ${formatMoney(offer.firstContractAmount || offer.mortgageAmount)}`,
    );
    lines.push(`2 договор: ${formatMoney(offer.secondContractAmount || 0)}`);

    // Субсидия по второму договору
    if (offer.secondContractSubsidyPercent !== undefined) {
      lines.push(
        `Субсидия 2 договора: ${offer.secondContractSubsidyPercent}% (${formatMoney(offer.secondContractSubsidyAmount || 0)})`,
      );
    }

    // Сумма субсидии (общая)
    if (offer.subsidyAmount > 0) {
      lines.push(`Субсидия всего: ${formatMoney(offer.subsidyAmount)}`);
    }
  }

  // ============================================================
  // 6. ТРАНШЕВАЯ ИПОТЕКА
  // ============================================================
  if (offer.isTranche === true) {
    lines.push(`Траншевая ипотека`);

    if (offer.firstTrancheAmount !== undefined) {
      lines.push(`1 транш: ${formatMoney(offer.firstTrancheAmount)}`);
    }

    if (offer.secondTrancheAmount !== undefined) {
      lines.push(`2 транш: ${formatMoney(offer.secondTrancheAmount)}`);
    }

    if (offer.firstTranchePayment !== undefined) {
      lines.push(
        `Платеж до выдачи 2 транша: ${formatMoney(offer.firstTranchePayment)}`,
      );
    }

    if (offer.secondTranchePayment !== undefined) {
      lines.push(
        `Платеж после выдачи 2 транша: ${formatMoney(offer.secondTranchePayment)}`,
      );
    }

    if (offer.trancheSecondDate) {
      lines.push(`Дата выдачи 2 транша: ${offer.trancheSecondDate}`);
    }

    if (offer.monthsUntilSecondTranche !== undefined) {
      lines.push(`Месяцев до 2 транша: ${offer.monthsUntilSecondTranche}`);
    }
  }

  // ============================================================
  // 7. ЕЖЕМЕСЯЧНЫЙ ПЛАТЕЖ
  // ============================================================
  if (offer.type === "short" && offer.monthlyPaymentAfter) {
    lines.push(`Платеж: ${formatMoney(offer.monthlyPayment)}`);
    lines.push(
      `далее ставка ${offer.rate}%: ${formatMoney(offer.monthlyPaymentAfter)}`,
    );
  } else {
    lines.push(`Платеж: ${formatMoney(offer.monthlyPayment)}`);
  }

  // ============================================================
  // 8. ПЛАТЕЖИ ПО ДВУМ ДОГОВОРАМ (дополнительно)
  // ============================================================
  if (offer.isTwoContracts === true) {
    if (offer.firstContractPayment > 0) {
      lines.push(
        `Платеж по 1 договору: ${formatMoney(offer.firstContractPayment)}`,
      );
    }
    if (offer.secondContractPayment > 0) {
      lines.push(
        `Платеж по 2 договору: ${formatMoney(offer.secondContractPayment)}`,
      );
    }
    if (offer.totalMonthlyPayment && offer.totalMonthlyPayment > 0) {
      lines.push(`Итого платеж: ${formatMoney(offer.totalMonthlyPayment)}`);
    }
  }

  // ============================================================
  // 9. СРОК ИПОТЕКИ
  // ============================================================
  lines.push(`Срок(лет): ${loanTermYears}`);

  // ============================================================
  // 10. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
  // ============================================================
  if (showOverstatement && offer.overstatement > 0) {
    lines.push(`Завышение: ${formatMoney(offer.overstatement)}`);
  }

  if (offer.excessLimit && offer.excessLimit > 0) {
    lines.push(`Сверхлимит: ${formatMoney(offer.excessLimit)}`);
  }

  if (offer.isLimitExceeded) {
    lines.push(`⚠️ Превышение лимита!`);
  }

  return lines.join("\n");
};
