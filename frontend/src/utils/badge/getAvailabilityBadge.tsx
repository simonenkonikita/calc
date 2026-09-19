// src/utils/badge/getAvailabilityBadge.ts

import { BankProgramResultWithIndex } from "../types";

export interface AvailabilityMetric {
  label: string;
  value: string;
  variant?: "danger" | "neutral";
}

export interface AvailabilityIssue {
  icon: string;
  title: string;
  metrics: AvailabilityMetric[];
  recommendation: string;
}

const formatMoney = (amount: number): string =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/** 🔥 Склонение слова «год/года/лет» */
const pluralYears = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "год";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "года";
  return "лет";
};

const formatYears = (years: number): string => `${years} ${pluralYears(years)}`;

interface GetAvailabilityParams {
  offer: BankProgramResultWithIndex;
  loanTermMonths: number;
}

export const getAvailabilityIssues = ({
  offer,
  loanTermMonths,
}: GetAvailabilityParams): AvailabilityIssue[] => {
  const issues: AvailabilityIssue[] = [];

  // ============================================================
  // 🔥 СУММА КРЕДИТА
  // ============================================================
  const mortgageAmount = offer.mortgageAmount ?? 0;

  if (mortgageAmount > 0) {
    // МИНИМУМ не достигнут
    if (offer.minLoanAmount != null && mortgageAmount < offer.minLoanAmount) {
      const diff = offer.minLoanAmount - mortgageAmount;
      issues.push({
        icon: "💰",
        title: "Сумма кредита не подходит",
        metrics: [
          {
            label: "Минимальная сумма кредита",
            value: formatMoney(offer.minLoanAmount),
          },
          {
            label: "Ваша сумма меньше на",
            value: formatMoney(diff),
            variant: "danger",
          },
        ],
        recommendation:
          "Увеличьте сумму кредита или уменьшите первоначальный взнос.",
      });
    }
    // МАКСИМУМ превышен
    else if (
      offer.maxLoanAmount != null &&
      mortgageAmount > offer.maxLoanAmount
    ) {
      const diff = mortgageAmount - offer.maxLoanAmount;

      // 🔥 Проверяем, есть ли субсидия у оффера
      const subsidyAmount = offer.subsidyAmount ?? 0;
      const hasSubsidy = subsidyAmount > 0;

      // 🔥 Формируем строку с превышением и субсидией
      const exceedValue = hasSubsidy
        ? `${formatMoney(diff)} из них ${formatMoney(subsidyAmount)} — субсидия`
        : formatMoney(diff);

      issues.push({
        icon: "💰",
        title: "Сумма кредита не подходит",
        metrics: [
          {
            label: "Максимальная сумма кредита",
            value: formatMoney(offer.maxLoanAmount),
          },
          {
            label: "Ваша сумма превышена на",
            value: exceedValue,
            variant: "danger",
          },
        ],
        recommendation: hasSubsidy
          ? "Уменьшите сумму кредита, увеличьте первоначальный взнос или отключите субсидию."
          : "Уменьшите сумму кредита или увеличьте первоначальный взнос.",
      });
    }
  }

  // ============================================================
  // 🔥 СРОК КРЕДИТА
  // ============================================================
  if (offer.minLoanTerm != null && loanTermMonths < offer.minLoanTerm) {
    const minYears = Math.ceil(offer.minLoanTerm / 12);
    const diffMonths = offer.minLoanTerm - loanTermMonths;
    const diffYears = Math.ceil(diffMonths / 12);

    issues.push({
      icon: "⏳",
      title: "Срок ипотеки не подходит",
      metrics: [
        { label: "Минимальный срок", value: formatYears(minYears) },
        {
          label: "Ваш срок меньше на",
          value: formatYears(diffYears),
          variant: "danger",
        },
      ],
      recommendation: "Увеличьте срок ипотеки.",
    });
  } else if (offer.maxLoanTerm != null && loanTermMonths > offer.maxLoanTerm) {
    const maxYears = Math.floor(offer.maxLoanTerm / 12);
    const diffMonths = loanTermMonths - offer.maxLoanTerm;
    const diffYears = Math.ceil(diffMonths / 12);

    issues.push({
      icon: "⏳",
      title: "Срок ипотеки не подходит",
      metrics: [
        { label: "Максимальный срок", value: formatYears(maxYears) },
        {
          label: "Ваш срок больше на",
          value: formatYears(diffYears),
          variant: "danger",
        },
      ],
      recommendation: "Уменьшите срок ипотеки.",
    });
  }

  return issues;
};
