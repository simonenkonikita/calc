import { BankOffer } from "../utils/types";

// Базовые ставки
const baseRateSber = 20.7;
const baseRateAlfa = 17.99;
const baseRateSovkom = 19.99;
const baseRateVTB = 19.9;
const baseRateUralsib = 18.19;
// ПВ
const minPVPercent = 20.1;

export const bankOffers: BankOffer[] = [
  // ==================== СБЕРБАНК ====================
  // Весь срок
  {
    bank: "Сбербанк",
    program: "Базовая",
    type: "full",
    rate: baseRateSber - 1, // 19.7%
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
    dynamicRates: [
      // ПРИОРИТЕТ 5 (САМЫЙ ВЫСОКИЙ): ПВ ≥ 50.1% И сумма ≥ 10 000 000 → 17.0%
      {
        conditionFn: (pv, amount) => pv >= 50.1 && amount >= 10000000,
        rate: 17.0,
        priority: 5,
        description: "ПВ ≥ 50.1% и сумма ≥ 10 млн ₽ → 17.0%",
      },
      // ПРИОРИТЕТ 4: ПВ ≥ 30.1% И сумма ≥ 10 000 000 → 17.7%
      {
        conditionFn: (pv, amount) => pv >= 30.1 && amount >= 10000000,
        rate: 17.7,
        priority: 4,
        description: "ПВ ≥ 30.1% и сумма ≥ 10 млн ₽ → 17.7%",
      },
      // ПРИОРИТЕТ 3: ПВ ≥ 50.1% → 17.5%
      {
        type: "pv",
        condition: "gte",
        value: 50.1,
        rate: 17.5,
        priority: 3,
        description: "ПВ ≥ 50.1% → 17.5%",
      },
      // ПРИОРИТЕТ 2: ПВ ≥ 30.1% → 18.2%
      {
        type: "pv",
        condition: "gte",
        value: 30.1,
        rate: 18.2,
        priority: 2,
        description: "ПВ ≥ 30.1% → 18.2%",
      },
      // ПРИОРИТЕТ 1 (САМЫЙ НИЗКИЙ): Сумма ≥ 10 000 000 → 19.2%
      {
        type: "amount",
        condition: "gte",
        value: 10000000,
        rate: 19.2,
        priority: 1,
        description: "Сумма ≥ 10 млн ₽ → 19.2%",
      },
    ],
  },
  {
    bank: "Сбербанк",
    program: "11,9% на весь срок",
    type: "full",
    rate: 11.9,
    subsidyPercent: 18.5,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Сбербанк",
    program: "12,9% на весь срок",
    type: "full",
    rate: 12.9,
    subsidyPercent: 14.5,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Сбербанк",
    program: "13,9% на весь срок",
    type: "full",
    rate: 13.9,
    subsidyPercent: 11.5,
    minPVPercent: minPVPercent,
  },

  // Короткий срок
  {
    bank: "Сбербанк",
    program: "2,5% на 12 мес",
    type: "short",
    rate: baseRateSber,
    shortRate: 2.5,
    subsidyPercent: 13,
    minPVPercent: minPVPercent,
    durationMonths: 12,
    subsidyCalculationMethod: "onlyPercent",
  },
  {
    bank: "Сбербанк",
    program: "4,9% на 24 мес",
    type: "short",
    rate: baseRateSber,
    shortRate: 4.9,
    subsidyPercent: 19,
    minPVPercent: minPVPercent,
    durationMonths: 24,
    subsidyCalculationMethod: "onlyPercent",
  },
  {
    bank: "Сбербанк",
    program: "7,9% на 24 мес",
    type: "short",
    rate: baseRateSber,
    shortRate: 7.9,
    subsidyPercent: 15.5,
    minPVPercent: minPVPercent,
    durationMonths: 24,
    subsidyCalculationMethod: "onlyPercent",
  },
  {
    bank: "Сбербанк",
    program: "9,9% на 24 мес",
    type: "short",
    rate: baseRateSber,
    shortRate: 9.9,
    subsidyPercent: 13,
    minPVPercent: minPVPercent,
    durationMonths: 24,
    subsidyCalculationMethod: "onlyPercent",
  },

  // Семейная ипотека
  {
    bank: "Сбербанк",
    program: "Семейная базовая",
    type: "family",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Сбербанк",
    program: "Семейная ипотека 3,5%",
    type: "family",
    rate: 3.5,
    subsidyPercent: 14.5,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Сбербанк",
    program: "Семейная ипотека сверхлимит",
    type: "family",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
    excessLimit: true,
  },

  // ИТ ипотека
  {
    bank: "Сбербанк",
    program: "ИТ базовая",
    type: "it",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Сбербанк",
    program: "ИТ ипотека 3,5%",
    type: "it",
    rate: 3.5,
    subsidyPercent: 14.5,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Сбербанк",
    program: "ИТ ипотека сверхлимит",
    type: "it",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
    excessLimit: true,
  },

  // ==================== АЛЬФА-БАНК ====================
  {
    bank: "Альфа-Банк",
    program: "Базовая",
    type: "full",
    rate: baseRateAlfa, // 19.09% (базовая)
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
    dynamicRates: [
      // САМЫЙ ВЫСОКИЙ ПРИОРИТЕТ: ПВ ≥ 50% И сумма ≥ 10 000 000 → 16.59%
      {
        conditionFn: (pv, amount) => pv >= 50 && amount >= 10000000,
        rate: 16.59,
        priority: 3,
        description: "ПВ ≥ 50% и сумма ≥ 10 млн ₽ → 16.59%",
      },
      // СРЕДНИЙ ПРИОРИТЕТ: ПВ ≥ 50% → 17.59%
      {
        type: "pv",
        condition: "gte",
        value: 50,
        rate: 17.59,
        priority: 2,
        description: "ПВ ≥ 50% → 17.59%",
      },
      // НИЗКИЙ ПРИОРИТЕТ: Сумма ≥ 10 000 000 → 17.09%
      {
        type: "amount",
        condition: "gte",
        value: 10000000,
        rate: 17.09,
        priority: 1,
        description: "Сумма ≥ 10 млн ₽ → 17.09%",
      },
    ],
  },
  {
    bank: "Альфа-Банк",
    program: "12,99% на весь срок",
    type: "full",
    rate: 12.99,
    subsidyPercent: 14,
    minPVPercent: minPVPercent,
  },

  // ==================== СОВКОМБАНК ====================
  {
    bank: "Совкомбанк",
    program: "Базовая",
    type: "full",
    rate: baseRateSovkom, // 19.99%
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Совкомбанк",
    program: "12,49% на весь срок",
    type: "full",
    rate: 12.49,
    subsidyPercent: 12.49,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Совкомбанк",
    program: "0,11% на 12 мес",
    type: "short",
    rate: baseRateSovkom,
    shortRate: 0.11,
    subsidyPercent: 14.7,
    minPVPercent: minPVPercent,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "Совкомбанк",
    program: "2,98% на 12 мес",
    type: "short",
    rate: baseRateSovkom,
    shortRate: 2.98,
    subsidyPercent: 12,
    minPVPercent: minPVPercent,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "Совкомбанк",
    program: "2,98% на 24 мес",
    type: "short",
    rate: baseRateSovkom,
    shortRate: 2.98,
    subsidyPercent: 24,
    minPVPercent: minPVPercent,
    durationMonths: 24,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "Совкомбанк",
    program: "8% на 24 мес",
    type: "short",
    rate: baseRateSovkom,
    shortRate: 8,
    subsidyPercent: 12,
    minPVPercent: minPVPercent,
    durationMonths: 24,
    subsidyCalculationMethod: "standard",
  },
  /*  {
    bank: "Совкомбанк",
    program: "Семейная ипотека (2 договора)",
    type: "family",
    rate: 6,
    subsidyPercent: 9.5,
    minPVPercent: minPVPercent,
    isTwoContracts: true,
  },
  {
    bank: "Совкомбанк",
    program: "Семейная ипотека сверхлимит 6%",
    type: "family",
    rate: 6,
    subsidyPercent: 65,
    minPVPercent: minPVPercent,
    excessLimit: true,
  },
  {
    bank: "Совкомбанк",
    program: "ИТ ипотека (2 договора)",
    type: "it",
    rate: 6,
    subsidyPercent: 9.5,
    minPVPercent: minPVPercent,
    isTwoContracts: true,
  },
  {
    bank: "Совкомбанк",
    program: "ИТ ипотека сверхлимит 6%",
    type: "it",
    rate: 6,
    subsidyPercent: 65,
    minPVPercent: 20.1,
    excessLimit: true,
  }, */

  // ==================== ВТБ ====================
  {
    bank: "ВТБ",
    program: "Базовая",
    type: "full",
    rate: baseRateVTB, // 19.9%
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
  },
  {
    bank: "ВТБ",
    program: "12,89% на весь срок",
    type: "full",
    rate: 12.89,
    subsidyPercent: 14.3,
    minPVPercent: minPVPercent,
  },
  {
    bank: "ВТБ",
    program: "0,11% на 12 мес",
    type: "short",
    rate: baseRateVTB,
    shortRate: 0.11,
    subsidyPercent: 18.29,
    minPVPercent: minPVPercent,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "ВТБ",
    program: "2,99% на 12 мес",
    type: "short",
    rate: baseRateVTB,
    shortRate: 2.99,
    subsidyPercent: 15.49,
    minPVPercent: minPVPercent,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },

  // ==================== УРАЛСИБ ====================
  {
    bank: "Уралсиб",
    program: "Базовая",
    type: "full",
    rate: baseRateUralsib, // 18.19%
    subsidyPercent: 0,
    minPVPercent: minPVPercent,
    dynamicRates: [
      // Сумма ≥ 6 000 000 → 17.99%
      {
        type: "amount",
        condition: "gte",
        value: 6000000,
        rate: 17.99,
        priority: 1,
        description: "Сумма ≥ 6 млн ₽ → 17.99%",
      },
    ],
  },
  {
    bank: "Уралсиб",
    program: "12,89% на весь срок",
    type: "full",
    rate: 12.89,
    subsidyPercent: 18.6,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Уралсиб",
    program: "13,89% на весь срок",
    type: "full",
    rate: 13.89,
    subsidyPercent: 13.8,
    minPVPercent: minPVPercent,
  },
  {
    bank: "Уралсиб",
    program: "7,89% на 12 мес",
    type: "short",
    rate: baseRateUralsib,
    shortRate: 8.19,
    subsidyPercent: 9.4,
    minPVPercent: minPVPercent,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "Уралсиб",
    program: "7,89% на 24 мес",
    type: "short",
    rate: baseRateUralsib,
    shortRate: 7.89,
    subsidyPercent: 15.2,
    minPVPercent: minPVPercent,
    durationMonths: 24,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "Уралсиб",
    program: "7,89% на 36 мес",
    type: "short",
    rate: baseRateUralsib,
    shortRate: 7.89,
    subsidyPercent: 19.9,
    minPVPercent: minPVPercent,
    durationMonths: 36,
    subsidyCalculationMethod: "standard",
  },
];
