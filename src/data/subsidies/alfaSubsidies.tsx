import { DynamicRateRule } from "../../utils/types";

export const ALFA_SUBSIDIES_13_89: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount, term) => term <= 10,
    subsidyPercent: 7.74,
    priority: 4,
    description: "Срок ≤ 10 лет, продукт №1 → дисконт 5.11%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 11 && term <= 15,
    subsidyPercent: 10.54,
    priority: 3,
    description: "Срок ≤ 10 лет, продукт №2 → дисконт 6.01%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 16 && term <= 20,
    subsidyPercent: 12.96,
    priority: 2,
    description: "Срок ≤ 10 лет, продукт №3 → дисконт 7.11%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 21 && term <= 30,
    subsidyPercent: 15.01,
    priority: 1,
    description: "Срок ≤ 10 лет, продукт №3 → дисконт 7.11%",
  },
];

export const ALFA_SUBSIDIES_12_99: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount, term) => term <= 10,
    subsidyPercent: 9.11,
    priority: 4,
    description: "Срок ≤ 10 лет, продукт №1 → дисконт 5.11%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 11 && term <= 15,
    subsidyPercent: 12.44,
    priority: 3,
    description: "Срок ≤ 10 лет, продукт №2 → дисконт 6.01%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 16 && term <= 20,
    subsidyPercent: 15.3,
    priority: 2,
    description: "Срок ≤ 10 лет, продукт №3 → дисконт 7.11%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 21 && term <= 30,
    subsidyPercent: 17.7,
    priority: 1,
    description: "Срок ≤ 10 лет, продукт №3 → дисконт 7.11%",
  },
];

export const ALFA_SUBSIDIES_11_89: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount, term) => term <= 10,
    subsidyPercent: 11.38,
    priority: 4,
    description: "Срок ≤ 10 лет, продукт №1 → дисконт 5.11%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 11 && term <= 15,
    subsidyPercent: 15.63,
    priority: 3,
    description: "Срок ≤ 10 лет, продукт №2 → дисконт 6.01%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 16 && term <= 20,
    subsidyPercent: 19.18,
    priority: 2,
    description: "Срок ≤ 10 лет, продукт №3 → дисконт 7.11%",
  },
  {
    conditionFn: (pv, amount, term) => term >= 21 && term <= 30,
    subsidyPercent: 22.18,
    priority: 1,
    description: "Срок ≤ 10 лет, продукт №3 → дисконт 7.11%",
  },
];
