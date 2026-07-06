import { DynamicRateRule } from "../../utils/types";

export const SOVCOMBANK_SUBSIDIES_V1: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount) => amount >= 8000000,
    subsidyPercent: 0.1,
    priority: 8,
    description: "Сумма ≥ 8 млн → 0.10%",
  },
  {
    conditionFn: (pv, amount) => amount >= 7000000 && amount < 8000000,
    subsidyPercent: 0.1,
    priority: 7,
    description: "Сумма от 7 до 8 млн → 0.10%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6000000 && amount < 7000000,
    subsidyPercent: 0.1,
    priority: 6,
    description: "Сумма от 6 до 7 млн → 0.10%",
  },
  {
    conditionFn: (pv, amount) => amount >= 5000000 && amount < 6000000,
    subsidyPercent: 0.1,
    priority: 5,
    description: "Сумма от 5 до 6 млн → 0.10%",
  },
  {
    conditionFn: (pv, amount) => amount >= 4000000 && amount < 5000000,
    subsidyPercent: 0.5,
    priority: 4,
    description: "Сумма от 4 до 5 млн → 0.50%",
  },
  {
    conditionFn: (pv, amount) => amount >= 3000000 && amount < 4000000,
    subsidyPercent: 4.0,
    priority: 3,
    description: "Сумма от 3 до 4 млн → 4.00%",
  },
  {
    conditionFn: (pv, amount) => amount >= 2000000 && amount < 3000000,
    subsidyPercent: 9.5,
    priority: 2,
    description: "Сумма от 2 до 3 млн → 9.50%",
  },
  {
    conditionFn: (pv, amount) => amount >= 1500000 && amount < 2000000,
    subsidyPercent: 16.0,
    priority: 1,
    description: "Сумма от 1.5 до 2 млн → 16.00%",
  },
];

export const SOVCOMBANK_SUBSIDIES_V2: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount) => amount >= 8000000,
    subsidyPercent: 23.5, // 0.10%
    priority: 8,
    description: "Сумма ≥ 8 млн → 0.10%",
  },
  // Сумма от 7 до 8 млн
  {
    conditionFn: (pv, amount) => amount >= 7000000 && amount < 8000000,
    subsidyPercent: 24,
    priority: 7,
    description: "Сумма от 7 до 8 млн → 0.10%",
  },
  // Сумма от 6 до 7 млн
  {
    conditionFn: (pv, amount) => amount >= 6000000 && amount < 7000000,
    subsidyPercent: 24.5,
    priority: 6,
    description: "Сумма от 6 до 7 млн → 0.10%",
  },
  // Сумма от 5 до 6 млн
  {
    conditionFn: (pv, amount) => amount >= 5000000 && amount < 6000000,
    subsidyPercent: 25.5,
    priority: 5,
    description: "Сумма от 5 до 6 млн → 0.10%",
  },
  // Сумма от 4 до 5 млн
  {
    conditionFn: (pv, amount) => amount >= 4000000 && amount < 5000000,
    subsidyPercent: 27.5, // 0.50%
    priority: 4,
    description: "Сумма от 4 до 5 млн → 0.50%",
  },
  // Сумма от 3 до 4 млн
  {
    conditionFn: (pv, amount) => amount >= 3000000 && amount < 4000000,
    subsidyPercent: 30.5, // 4.00%
    priority: 3,
    description: "Сумма от 3 до 4 млн → 4.00%",
  },
  // Сумма от 2 до 3 млн
  {
    conditionFn: (pv, amount) => amount >= 2000000 && amount < 3000000,
    subsidyPercent: 37.5, // 9.50%
    priority: 2,
    description: "Сумма от 2 до 3 млн → 9.50%",
  },
  // Сумма от 1.5 до 2 млн
  {
    conditionFn: (pv, amount) => amount >= 1500000 && amount < 2000000,
    subsidyPercent: 46, // 16.00%
    priority: 1,
    description: "Сумма от 1.5 до 2 млн → 16.00%",
  },
];
