import { DynamicRateRule } from "../../utils/types";

export const SOVKOMBANK_BASE_RATES: DynamicRateRule[] = [
  // Сумма ≥ 8 млн ₽
  {
    conditionFn: (pv, amount) => amount >= 8000000 && pv >= 50.01,
    rate: 17.49,
    priority: 6,
    description: "Сумма ≥ 8 млн ₽ и ПВ ≥ 50.01% → 17.49%",
  },
  {
    conditionFn: (pv, amount) => amount >= 8000000 && pv >= 30.01 && pv <= 50,
    rate: 17.99,
    priority: 5,
    description: "Сумма ≥ 8 млн ₽ и ПВ 30.01-50% → 17.99%",
  },
  {
    conditionFn: (pv, amount) => amount >= 8000000 && pv >= 20.01 && pv <= 30,
    rate: 18.49,
    priority: 4,
    description: "Сумма ≥ 8 млн ₽ и ПВ 20.01-30% → 18.49%",
  },

  // Сумма до 8 млн ₽ (включительно)
  {
    conditionFn: (pv, amount) => amount < 8000000 && pv >= 50.01,
    rate: 17.99,
    priority: 3,
    description: "Сумма ≤ 8 млн ₽ и ПВ ≥ 50.01% → 17.99%",
  },
  {
    conditionFn: (pv, amount) => amount <= 8000000 && pv >= 30.01 && pv <= 50,
    rate: 18.49,
    priority: 2,
    description: "Сумма ≤ 8 млн ₽ и ПВ 30.01-50% → 18.49%",
  },
  {
    conditionFn: (pv, amount) => amount <= 8000000 && pv >= 20.01 && pv <= 30,
    rate: 18.99,
    priority: 1,
    description: "Сумма ≤ 8 млн ₽ и ПВ 20.01-30% → 18.99%",
  },
];
