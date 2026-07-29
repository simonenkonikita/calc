// src/config/rates/sberbankRates.ts

import { DynamicRateRule } from "../../utils/types";

export const VTB_EXCESS_RATES: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount) => amount >= 6150000 && amount < 6200000,
    rate: 7.17,
    priority: 1,
    description: "Сумма 6.15–6.2 млн → 7.17%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6200000 && amount < 6300000,
    rate: 7.55,
    priority: 1,
    description: "Сумма 6.2–6.3 млн → 7.55%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6300000 && amount < 6400000,
    rate: 7.71,
    priority: 1,
    description: "Сумма 6.3–6.4 млн → 7.71%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6400000 && amount < 6500000,
    rate: 8.06,
    priority: 1,
    description: "Сумма 6.4–6.5 млн → 8.06%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6500000 && amount < 6600000,
    rate: 8.44,
    priority: 1,
    description: "Сумма 6.5–6.6 млн → 8.44%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6600000 && amount < 6700000,
    rate: 8.8,
    priority: 1,
    description: "Сумма 6.6–6.7 млн → 8.80%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6700000 && amount < 6800000,
    rate: 9.15,
    priority: 1,
    description: "Сумма 6.7–6.8 млн → 9.15%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6800000 && amount < 6900000,
    rate: 9.5,
    priority: 1,
    description: "Сумма 6.8–6.9 млн → 9.50%",
  },
  {
    conditionFn: (pv, amount) => amount >= 6900000 && amount < 7000000,
    rate: 9.19,
    priority: 1,
    description: "Сумма 6.9–7.0 млн → 9.19%",
  },
  {
    conditionFn: (pv, amount) => amount >= 7000000 && amount < 7500000,
    rate: 9.96,
    priority: 1,
    description: "Сумма 7.0–7.5 млн → 9.96%",
  },
  {
    conditionFn: (pv, amount) => amount >= 7500000 && amount < 8000000,
    rate: 10.63,
    priority: 1,
    description: "Сумма 7.5–8.0 млн → 10.63%",
  },
  {
    conditionFn: (pv, amount) => amount >= 8000000 && amount < 8500000,
    rate: 11.24,
    priority: 1,
    description: "Сумма 8.0–8.5 млн → 11.24%",
  },
  {
    conditionFn: (pv, amount) => amount >= 8500000 && amount < 9000000,
    rate: 11.77,
    priority: 1,
    description: "Сумма 8.5–9.0 млн → 11.77%",
  },
  {
    conditionFn: (pv, amount) => amount >= 9000000 && amount < 9500000,
    rate: 12.23,
    priority: 1,
    description: "Сумма 9.0–9.5 млн → 12.23%",
  },
  {
    conditionFn: (pv, amount) => amount >= 9500000 && amount < 10000000,
    rate: 12.64,
    priority: 1,
    description: "Сумма 9.5–10.0 млн → 12.64%",
  },
  {
    conditionFn: (pv, amount) => amount >= 10000000 && amount < 10500000,
    rate: 13.03,
    priority: 1,
    description: "Сумма 10.0–10.5 млн → 13.03%",
  },
  {
    conditionFn: (pv, amount) => amount >= 10500000 && amount < 11000000,
    rate: 13.41,
    priority: 1,
    description: "Сумма 10.5–11.0 млн → 13.41%",
  },
  {
    conditionFn: (pv, amount) => amount >= 11000000 && amount < 11500000,
    rate: 13.7,
    priority: 1,
    description: "Сумма 11.0–11.5 млн → 13.70%",
  },
  {
    conditionFn: (pv, amount) => amount >= 11500000 && amount < 12000000,
    rate: 14.0,
    priority: 1,
    description: "Сумма 11.5–12.0 млн → 14.00%",
  },
  {
    conditionFn: (pv, amount) => amount >= 12000000 && amount < 12500000,
    rate: 14.27,
    priority: 1,
    description: "Сумма 12.0–12.5 млн → 14.27%",
  },
  {
    conditionFn: (pv, amount) => amount >= 12500000 && amount < 13000000,
    rate: 14.51,
    priority: 1,
    description: "Сумма 12.5–13.0 млн → 14.51%",
  },
  {
    conditionFn: (pv, amount) => amount >= 13000000 && amount < 13500000,
    rate: 14.78,
    priority: 1,
    description: "Сумма 13.0–13.5 млн → 14.78%",
  },
  {
    conditionFn: (pv, amount) => amount >= 13500000 && amount < 14000000,
    rate: 14.97,
    priority: 1,
    description: "Сумма 13.5–14.0 млн → 14.97%",
  },
  {
    conditionFn: (pv, amount) => amount >= 14000000 && amount < 14500000,
    rate: 15.14,
    priority: 1,
    description: "Сумма 14.0–14.5 млн → 15.14%",
  },
  {
    conditionFn: (pv, amount) => amount >= 14500000 && amount < 15000000,
    rate: 15.36,
    priority: 1,
    description: "Сумма 14.5–15.0 млн → 15.36%",
  },
];
