// src/config/banks/sovcombank.ts

import { BankOffer } from "../../utils/types";
import { URALSIB_BASE_RATES } from "../rates/uralsib";
import { BASE_RATES, MIN_PV_PERCENT } from "./constants";

export const URALSIB_OFFERS: BankOffer[] = [
  {
    bank: "Уралсиб",
    program: "Базовая",
    type: "full",
    rate: BASE_RATES.URALSIB,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicRates: URALSIB_BASE_RATES,
  },
  {
    bank: "Уралсиб",
    program: "12,89% на весь срок",
    type: "full",
    rate: 12.89,
    subsidyPercent: 18.6,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "Уралсиб",
    program: "13,89% на весь срок",
    type: "full",
    rate: 13.89,
    subsidyPercent: 13.8,
    minPVPercent: MIN_PV_PERCENT,
  },
];
