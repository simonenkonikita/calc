// src/config/rates/sberbankRates.ts

import { DynamicRateRule } from "../../types/types";

export const URALSIB_BASE_RATES: DynamicRateRule[] = [
  {
    type: "amount",
    condition: "gte",
    value: 6000000,
    rate: 17.99,
    priority: 1,
    description: "Сумма ≥ 6 млн ₽ → 17.99%",
  },
];
