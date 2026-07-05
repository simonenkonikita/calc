// src/config/banks/sovcombank.ts

import { BankOffer } from "../../utils/types";
import { BASE_RATES, MIN_PV_PERCENT } from "./constants";

export const DOMRF_OFFERS: BankOffer[] = [
  {
    bank: "Дом.РФ Банк",
    program: "Базовая",
    type: "full",
    rate: BASE_RATES.DOMRF,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "Дом.РФ Банк",
    program: "11.9% на весь срок",
    type: "full",
    rate: 11.9,
    subsidyPercent: 15.46,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "Дом.РФ Банк",
    program: "0.1% на 12 мес",
    type: "short",
    rate: BASE_RATES.DOMRF,
    shortRate: 0.1,
    subsidyPercent: 16.31,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "Дом.РФ Банк",
    program: "2.8% на 24 мес",
    type: "short",
    rate: BASE_RATES.DOMRF,
    shortRate: 2.8,
    subsidyPercent: 23.66,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 24,
    subsidyCalculationMethod: "standard",
  },
];
