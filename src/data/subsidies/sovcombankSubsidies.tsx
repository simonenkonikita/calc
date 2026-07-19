// src/config/subsidies/sovcombankSubsidies.ts

import { DynamicRateRule } from "../../utils/types";

export const SOVKOMBANK_SUBSIDIES_11_9: DynamicRateRule[] = [
  // ============================================================
  // ОТ 5 ДО 10 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 17,
    priority: 10,
    description: "Срок 5-10 лет, ПВ 20-30% → 17%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 15.5,
    priority: 9,
    description: "Срок 5-10 лет, ПВ 30-50% → 15.5%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 5 && term <= 10 && pv >= 50.01,
    subsidyPercent: 13.5,
    priority: 8,
    description: "Срок 5-10 лет, ПВ ≥ 50% → 13.5%",
  },

  // ============================================================
  // ОТ 10 ДО 15 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 19.5,
    priority: 7,
    description: "Срок 10-15 лет, ПВ 20-30% → 19.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 18,
    priority: 6,
    description: "Срок 10-15 лет, ПВ 30-50% → 18%",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && term <= 15 && pv >= 50.01,
    subsidyPercent: 15.5,
    priority: 5,
    description: "Срок 10-15 лет, ПВ ≥ 50% → 15.5%",
  },

  // ============================================================
  // ОТ 15 ДО 20 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 22.5,
    priority: 4,
    description: "Срок 15-20 лет, ПВ 20-30% → 22.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 20.5,
    priority: 3,
    description: "Срок 15-20 лет, ПВ 30-50% → 20.5%",
  },
  {
    conditionFn: (pv, term) => term > 15 && term <= 20 && pv >= 50.01,
    subsidyPercent: 19.0,
    priority: 2,
    description: "Срок 15-20 лет, ПВ ≥ 50% → 19%",
  },

  // ============================================================
  // ОТ 20 ДО 30 ЛЕТ (ПРИОРИТЕТ: СНАЧАЛА ДО 8 МЛН, ПОТОМ ОТ 8 МЛН)
  // ============================================================
  // Сумма до 8 000 000 (проверяется ПЕРВОЙ, приоритет ВЫШЕ)
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount < 8000000,
    subsidyPercent: 25,
    priority: 20,
    description: "Срок 20-30 лет, ПВ 20-30%, сумма < 8 млн → 25%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount < 8000000,
    subsidyPercent: 23.5,
    priority: 19,
    description: "Срок 20-30 лет, ПВ 30-50%, сумма < 8 млн → 23.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount < 8000000,
    subsidyPercent: 20.5,
    priority: 18,
    description: "Срок 20-30 лет, ПВ ≥ 50%, сумма < 8 млн → 20.5%",
  },

  // Сумма от 8 000 000 (проверяется ВТОРОЙ, приоритет НИЖЕ)
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount >= 8000000,
    subsidyPercent: 25.5,
    priority: 17,
    description: "Срок 20-30 лет, ПВ 20-30%, сумма ≥ 8 млн → 25.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount >= 8000000,
    subsidyPercent: 25,
    priority: 16,
    description: "Срок 20-30 лет, ПВ 30-50%, сумма ≥ 8 млн → 25%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount >= 8000000,
    subsidyPercent: 24,
    priority: 15,
    description: "Срок 20-30 лет, ПВ ≥ 50%, сумма ≥ 8 млн → 24%",
  },
];

export const SOVKOMBANK_SUBSIDIES_12_49: DynamicRateRule[] = [
  // ============================================================
  // ОТ 5 ДО 20 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 20 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 12.49,
    priority: 10,
    description: "Срок 5-20 лет, ПВ 20-30% → 12.49%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 20 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 12.49,
    priority: 9,
    description: "Срок 5-20 лет, ПВ 30-50% → 12.49%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 5 && term <= 20 && pv >= 50.01,
    subsidyPercent: 12.49,
    priority: 8,
    description: "Срок 5-20 лет, ПВ ≥ 50% → 12.49%",
  },

  // ============================================================
  // ОТ 20 ДО 30 ЛЕТ (ПРИОРИТЕТ: СНАЧАЛА ДО 8 МЛН, ПОТОМ ОТ 8 МЛН)
  // ============================================================
  // Сумма до 8 000 000 (проверяется ПЕРВОЙ, приоритет ВЫШЕ)
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount < 8000000,
    subsidyPercent: 17.5,
    priority: 7,
    description: "Срок 20-30 лет, ПВ 20-30%, сумма < 8 млн → 17.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount < 8000000,
    subsidyPercent: 16,
    priority: 6,
    description: "Срок 20-30 лет, ПВ 30-50%, сумма < 8 млн → 16%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount < 8000000,
    subsidyPercent: 14.5,
    priority: 5,
    description: "Срок 20-30 лет, ПВ ≥ 50%, сумма < 8 млн → 14.5%",
  },

  // Сумма от 8 000 000 (проверяется ВТОРОЙ, приоритет НИЖЕ)
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount >= 8000000,
    subsidyPercent: 16,
    priority: 4,
    description: "Срок 20-30 лет, ПВ 20-30%, сумма ≥ 8 млн → 16%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount >= 8000000,
    subsidyPercent: 14.5,
    priority: 3,
    description: "Срок 20-30 лет, ПВ 30-50%, сумма ≥ 8 млн → 14.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount >= 8000000,
    subsidyPercent: 13.5,
    priority: 2,
    description: "Срок 20-30 лет, ПВ ≥ 50%, сумма ≥ 8 млн → 13.5%",
  },
];

export const SOVKOMBANK_SUBSIDIES_13_99: DynamicRateRule[] = [
  // ============================================================
  // ОТ 5 ДО 10 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 9,
    priority: 10,
    description: "Срок 5-10 лет, ПВ 20-30% → 9%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 8,
    priority: 9,
    description: "Срок 5-10 лет, ПВ 30-50% → 8%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 5 && term <= 10 && pv >= 50.01,
    subsidyPercent: 6,
    priority: 8,
    description: "Срок 5-10 лет, ПВ ≥ 50% → 6%",
  },

  // ============================================================
  // ОТ 10 ДО 15 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 10,
    priority: 7,
    description: "Срок 10-15 лет, ПВ 20-30% → 10%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 8.5,
    priority: 6,
    description: "Срок 10-15 лет, ПВ 30-50% → 8.5%",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && term <= 15 && pv >= 50.01,
    subsidyPercent: 6,
    priority: 5,
    description: "Срок 10-15 лет, ПВ ≥ 50% → 6%",
  },

  // ============================================================
  // ОТ 15 ДО 20 ЛЕТ
  // ============================================================
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 12.5,
    priority: 4,
    description: "Срок 15-20 лет, ПВ 20-30% → 12.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 11,
    priority: 3,
    description: "Срок 15-20 лет, ПВ 30-50% → 11%",
  },
  {
    conditionFn: (pv, amount, term) => term > 15 && term <= 20 && pv >= 50.01,
    subsidyPercent: 9,
    priority: 2,
    description: "Срок 15-20 лет, ПВ ≥ 50% → 9%",
  },

  // ============================================================
  // ОТ 20 ДО 30 ЛЕТ (ПРИОРИТЕТ: СНАЧАЛА ДО 8 МЛН, ПОТОМ ОТ 8 МЛН)
  // ============================================================
  // Сумма до 8 000 000 (проверяется ПЕРВОЙ, приоритет ВЫШЕ)
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount < 8000000,
    subsidyPercent: 13.5,
    priority: 20,
    description: "Срок 20-30 лет, ПВ 20-30%, сумма < 8 млн → 13.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount < 8000000,
    subsidyPercent: 12,
    priority: 19,
    description: "Срок 20-30 лет, ПВ 30-50%, сумма < 8 млн → 12%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount < 8000000,
    subsidyPercent: 10.5,
    priority: 18,
    description: "Срок 20-30 лет, ПВ ≥ 50%, сумма < 8 млн → 10.5%",
  },

  // Сумма от 8 000 000 (проверяется ВТОРОЙ, приоритет НИЖЕ)
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount >= 8000000,
    subsidyPercent: 12,
    priority: 17,
    description: "Срок 20-30 лет, ПВ 20-30%, сумма ≥ 8 млн → 12%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount >= 8000000,
    subsidyPercent: 10.5,
    priority: 16,
    description: "Срок 20-30 лет, ПВ 30-50%, сумма ≥ 8 млн → 10.5%",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount >= 8000000,
    subsidyPercent: 9.5,
    priority: 15,
    description: "Срок 20-30 лет, ПВ ≥ 50%, сумма ≥ 8 млн → 9.5%",
  },
];
