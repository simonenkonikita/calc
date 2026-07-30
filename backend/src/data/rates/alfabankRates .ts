// src/config/rates/sberbankRates.ts

import { DynamicRateRule } from "../../types/types";

export const ALFABANK_BASE_RATES: DynamicRateRule[] = [
  {
    conditionFn: (pv, amount) => pv >= 50 && amount >= 10000000,
    rate: 16.59,
    priority: 3,
    description: "ПВ ≥ 50% и сумма ≥ 10 млн ₽ → 16.59%",
  },
  {
    type: "pv",
    condition: "gte",
    value: 50,
    rate: 17.59,
    priority: 2,
    description: "ПВ ≥ 50% → 17.59%",
  },
  {
    type: "amount",
    condition: "gte",
    value: 10000000,
    rate: 17.09,
    priority: 1,
    description: "Сумма ≥ 10 млн ₽ → 17.09%",
  },
];
