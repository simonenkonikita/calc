// src/config/banks/sovcombank.ts

import { BankOffer } from "../../types/types";
import { URALSIB_BASE_RATES } from "../rates/uralsib";
import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
  PROGRAM_TYPES,
} from "./constants";

export const URALSIB_OFFERS: BankOffer[] = [
  {
    bank: BANK_NAMES.URALSIB,
    program: "Базовая",
    type: PROGRAM_TYPES.BASE,
    rate: BASE_RATES.URALSIB,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicRates: URALSIB_BASE_RATES,
  },
  {
    bank: BANK_NAMES.URALSIB,
    program: "12,89% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 12.89,
    subsidyPercent: 18.6,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: BANK_NAMES.URALSIB,
    program: "13,89% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 13.89,
    subsidyPercent: 13.8,
    minPVPercent: MIN_PV_PERCENT,
  },
  /*  {
    bank: "Уралсиб",
    program: "Семейная ипотека (2 договора)",
    type: "family",
    rate: 6,
    twoRate: 19.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    isTwoContracts: true,
  }, */
];
