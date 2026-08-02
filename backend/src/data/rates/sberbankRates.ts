// src/config/rates/sberbankRates.ts

import { DynamicRateRule } from "../../types/types";

export const SBERBANK_BASE_RATES: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount) => pv >= 50.1 && amount >= 10000000,
    rate: 17.0,
    priority: 5,
    description: "ПВ ≥ 50.1% и сумма ≥ 10 млн ₽ → 17.0%",
  },
  {
    conditionFn: (pv, amount) => pv >= 30.1 && amount >= 10000000,
    rate: 17.7,
    priority: 4,
    description: "ПВ ≥ 30.1% и сумма ≥ 10 млн ₽ → 17.7%",
  },
  {
    type: "pv",
    condition: "gte",
    value: 50.1,
    rate: 17.5,
    priority: 3,
    description: "ПВ ≥ 50.1% → 17.5%",
  },
  {
    type: "pv",
    condition: "gte",
    value: 30.1,
    rate: 18.2,
    priority: 2,
    description: "ПВ ≥ 30.1% → 18.2%",
  },
  {
    type: "amount",
    condition: "gte",
    value: 10000000,
    rate: 19.2,
    priority: 1,
    description: "Сумма ≥ 10 млн ₽ → 19.2%",
  },
];

export const SBERBANK_EXCESS_RATES: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount) => amount >= 6300000 && amount <= 6500000,
    rate: 7.5,
    priority: 1,
    description: "Сумма от 6.3 до 6.8 млн → 7.5%",
  },
  {
    conditionFn: (pv, amount) => amount > 6500000 && amount <= 6800000,
    rate: 8.3,
    priority: 1,
    description: "Сумма от 6.3 до 6.8 млн → 7.5%",
  },
  // От 6.8 до 7.0 млн
  {
    conditionFn: (pv, amount) => amount > 6800000 && amount <= 7000000,
    rate: 8.8,
    priority: 1,
    description: "Сумма от 6.8 до 7.0 млн → 8.3%",
  },
  // От 7.0 до 7.5 млн
  {
    conditionFn: (pv, amount) => amount > 7000000 && amount <= 7500000,
    rate: 9.6,
    priority: 1,
    description: "Сумма от 7.0 до 7.5 млн → 8.8%",
  },
  // От 7.5 до 8.0 млн
  {
    conditionFn: (pv, amount) => amount > 7500000 && amount <= 8000000,
    rate: 10.8,
    priority: 1,
    description: "Сумма от 7.5 до 8.0 млн → 9.6%",
  },
  // От 8.0 до 8.5 млн
  {
    conditionFn: (pv, amount) => amount > 8000000 && amount <= 8500000,
    rate: 11.5,
    priority: 1,
    description: "Сумма от 8.0 до 8.5 млн → 10.8%",
  },
  // От 8.5 до 9.0 млн
  {
    conditionFn: (pv, amount) => amount > 8500000 && amount <= 9000000,
    rate: 12,
    priority: 1,
    description: "Сумма от 8.5 до 9.0 млн → 11.5%",
  },
  // От 9.0 до 9.5 млн
  {
    conditionFn: (pv, amount) => amount > 9000000 && amount <= 9500000,
    rate: 12.5,
    priority: 1,
    description: "Сумма от 9.0 до 9.5 млн → 12.0%",
  },
  // От 9.5 до 10.0 млн
  {
    conditionFn: (pv, amount) => amount > 9500000 && amount <= 10000000,
    rate: 13,
    priority: 1,
    description: "Сумма от 9.5 до 10.0 млн → 12.5%",
  },
  // От 10.0 до 10.5 млн
  {
    conditionFn: (pv, amount) => amount > 10000000 && amount <= 10500000,
    rate: 13.9,
    priority: 1,
    description: "Сумма от 10.0 до 10.5 млн → 13.0%",
  },
  // От 10.5 до 11.0 млн
  {
    conditionFn: (pv, amount) => amount > 10500000 && amount <= 11000000,
    rate: 14.2,
    priority: 1,
    description: "Сумма от 10.5 до 11.0 млн → 13.9%",
  },
  // От 11.0 до 11.5 млн
  {
    conditionFn: (pv, amount) => amount > 11000000 && amount <= 11500000,
    rate: 14.5,
    priority: 1,
    description: "Сумма от 11.0 до 11.5 млн → 14.2%",
  },
  // От 11.5 до 12.0 млн
  {
    conditionFn: (pv, amount) => amount > 11500000 && amount <= 12000000,
    rate: 14.8,
    priority: 1,
    description: "Сумма от 11.5 до 12.0 млн → 14.5%",
  },
  // От 12.0 до 12.5 млн
  {
    conditionFn: (pv, amount) => amount > 12000000 && amount <= 12500000,
    rate: 15.1,
    priority: 1,
    description: "Сумма от 12.0 до 12.5 млн → 14.8%",
  },
  // От 12.5 до 13.0 млн
  {
    conditionFn: (pv, amount) => amount > 12500000 && amount <= 13000000,
    rate: 15.4,
    priority: 1,
    description: "Сумма от 12.5 до 13.0 млн → 15.1%",
  },
  // От 13.0 до 13.5 млн
  {
    conditionFn: (pv, amount) => amount > 13000000 && amount <= 13500000,
    rate: 15.6,
    priority: 1,
    description: "Сумма от 13.0 до 13.5 млн → 15.4%",
  },
  // От 13.5 до 14.0 млн
  {
    conditionFn: (pv, amount) => amount > 13500000 && amount <= 14000000,
    rate: 15.8,
    priority: 1,
    description: "Сумма от 13.5 до 14.0 млн → 15.6%",
  },
  // От 14.0 до 14.5 млн
  {
    conditionFn: (pv, amount) => amount > 14000000 && amount <= 14500000,
    rate: 16,
    priority: 1,
    description: "Сумма от 14.0 до 14.5 млн → 15.8%",
  },
  // От 14.5 до 15.0 млн
  {
    conditionFn: (pv, amount) => amount > 14500000 && amount <= 15000000,
    rate: 16.2,
    priority: 1,
    description: "Сумма от 14.5 до 15.0 млн → 16.0%",
  },
];
