import { DynamicRateRule } from "../../utils/types";

export const SOVKOMBANK_SUBSIDIES_13_99: DynamicRateRule[] = [
  //Сумма кредита до 8 000  000
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount <= 8000000 && pv <= 30,
    subsidyPercent: 13.5,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount <= 8000000 && pv >= 30.01 && pv < 50,
    subsidyPercent: 12,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount <= 8000000 && pv >= 50.01,
    subsidyPercent: 13.5,
    priority: 2,
    description: "",
  },
  //Сумма кредита от 8 000  000
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount > 8000000 && pv <= 30,
    subsidyPercent: 12,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount > 8000000 && pv >= 30.01 && pv < 50,
    subsidyPercent: 10.5,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount > 8000000 && pv >= 50.01,
    subsidyPercent: 9.5,
    priority: 2,
    description: "",
  },
];

export const SOVKOMBANK_SUBSIDIES_12_49: DynamicRateRule[] = [
  //Сумма кредита до 8 000  000
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term < 20 && amount <= 8000000 && pv <= 30,
    subsidyPercent: 17.5,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term < 20 && amount <= 8000000 && pv >= 30.01 && pv < 50,
    subsidyPercent: 16,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term < 20 && amount <= 8000000 && pv >= 50.01,
    subsidyPercent: 14,
    priority: 2,
    description: "",
  },
  //Сумма кредита от 8 000  000
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term < 20 && amount > 8000000 && pv <= 30,
    subsidyPercent: 16,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term < 20 && amount > 8000000 && pv >= 30.01 && pv < 50,
    subsidyPercent: 14.5,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term > 10 && term < 20 && amount > 8000000 && pv >= 50.01,
    subsidyPercent: 13.5,
    priority: 2,
    description: "",
  },
  //Срок кредита до 10 мес
  {
    conditionFn: (pv, amount, term) => term > 10 && pv <= 30,
    subsidyPercent: 17,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && pv >= 30.01 && pv < 50,
    subsidyPercent: 15.5,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && pv >= 50.01,
    subsidyPercent: 13.5,
    priority: 2,
    description: "",
  },
];

export const SOVKOMBANK_SUBSIDIES_11_90: DynamicRateRule[] = [
  //Сумма кредита до 8 000  000
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount < 8000000 && pv <= 30,
    subsidyPercent: 25,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount < 8000000 && pv >= 30.01 && pv < 50,
    subsidyPercent: 23.5,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 20 && amount < 8000000 && pv >= 50.01,
    subsidyPercent: 20.5,
    priority: 2,
    description: "",
  },
  //Сумма кредита от 8 000  000
  {
    conditionFn: (pv, amount, term) =>
      term < 10 && amount > 8000000 && pv <= 30,
    subsidyPercent: 25.5,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 10 && amount > 8000000 && pv >= 30.01 && pv < 50,
    subsidyPercent: 25,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) =>
      term < 10 && amount > 8000000 && pv >= 50.01,
    subsidyPercent: 24.5,
    priority: 2,
    description: "",
  },
  //Срок кредита до 10 мес
  {
    conditionFn: (pv, amount, term) => term > 10 && pv <= 30,
    subsidyPercent: 17,
    priority: 4,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && pv >= 30.01 && pv < 50,
    subsidyPercent: 15.5,
    priority: 3,
    description: "",
  },
  {
    conditionFn: (pv, amount, term) => term > 10 && pv >= 50.01,
    subsidyPercent: 13.5,
    priority: 2,
    description: "",
  },
];
