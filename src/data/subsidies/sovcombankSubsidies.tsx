import { DynamicRateRule } from "../../utils/types";

export const SOVKOMBANK_SUBSIDIES_11_9: DynamicRateRule[] = [
  // от 5 до 10 лет
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 17,
    priority: 1,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 15.5,
    priority: 2,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term >= 5 && term <= 10 && pv >= 50.01,
    subsidyPercent: 13.5,
    priority: 3,
    description: "",
  },
  // от 10 до 15 лет
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 19.5,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 18,
    priority: 5,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && term <= 15 && pv >= 50.01,
    subsidyPercent: 15.5,
    priority: 6,
    description: "",
  },
  // от  15 до 20 лет
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 22.5,
    priority: 7,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 20.5,
    priority: 8,
    description: "",
  },
  {
    conditionFn: (pv, term) => term > 15 && term <= 20 && pv >= 50.01,
    subsidyPercent: 19.0,
    priority: 9,
    description: "",
  },
  // от  20 до 30 лет при сумме кредита до 8 000 000
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount < 8000000,
    subsidyPercent: 25,
    priority: 10,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount < 8000000,
    subsidyPercent: 23.5,
    priority: 11,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount < 8000000,
    subsidyPercent: 20.5,
    priority: 12,
    description: "",
  },
  // от  20 до 30 лет при сумме кредита от 8 000 000
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount >= 8000000,
    subsidyPercent: 25.5,
    priority: 13,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount >= 8000000,
    subsidyPercent: 25,
    priority: 14,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount >= 8000000,
    subsidyPercent: 24,
    priority: 15,
    description: "",
  },
];

export const SOVKOMBANK_SUBSIDIES_12_49: DynamicRateRule[] = [
  // от  5 до 20 лет
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 20 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 12.49,
    priority: 1,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 20 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 12.49,
    priority: 2,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term >= 5 && term <= 20 && pv >= 50.01,
    subsidyPercent: 12.49,
    priority: 3,
    description: "",
  },
  // от  20 до 30 лет при сумме кредита до 8 000 000
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount < 8000000,
    subsidyPercent: 17.5,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount < 8000000,
    subsidyPercent: 16,
    priority: 5,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount < 8000000,
    subsidyPercent: 14.5,
    priority: 6,
    description: "",
  },
  // от  20 до 30 лет при сумме кредита от 8 000 000
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount >= 8000000,
    subsidyPercent: 16,
    priority: 7,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount >= 8000000,
    subsidyPercent: 14.5,
    priority: 8,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount >= 8000000,
    subsidyPercent: 13.5,
    priority: 9,
    description: "",
  },
];

export const SOVKOMBANK_SUBSIDIES_13_99: DynamicRateRule[] = [
  // от 5 до 10 лет
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 9,
    priority: 1,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term >= 5 && term <= 10 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 8,
    priority: 2,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term >= 5 && term <= 10 && pv >= 50.01,
    subsidyPercent: 6,
    priority: 3,
    description: "",
  },
  // от 10 до 15 лет
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 10,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term <= 15 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 8.5,
    priority: 5,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && term <= 15 && pv >= 50.01,
    subsidyPercent: 6,
    priority: 6,
    description: "",
  },

  // от  15 до 20 лет
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 20.01 && pv <= 30,
    subsidyPercent: 12.5,
    priority: 7,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 15 && term <= 20 && pv >= 30.01 && pv <= 50,
    subsidyPercent: 11,
    priority: 8,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 15 && term <= 20 && pv >= 50.01,
    subsidyPercent: 9,
    priority: 9,
    description: "",
  },
  // от  20 до 30 лет при сумме кредита до 8 000 000
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount < 8000000,
    subsidyPercent: 13.5,
    priority: 10,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount < 8000000,
    subsidyPercent: 12,
    priority: 11,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount < 8000000,
    subsidyPercent: 10.5,
    priority: 12,
    description: "",
  },
  // от  20 до 30 лет при сумме кредита от 8 000 000
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 20.01 && pv <= 30 && amount >= 8000000,
    subsidyPercent: 12,
    priority: 13,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 30.01 && pv <= 50 && amount >= 8000000,
    subsidyPercent: 10.5,
    priority: 14,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 20 && term <= 30 && pv >= 50.01 && amount >= 8000000,
    subsidyPercent: 9.5,
    priority: 15,
    description: "",
  },
];
