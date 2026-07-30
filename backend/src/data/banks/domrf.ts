// src/config/banks/sovcombank.ts

import { BankOffer } from "../../types/types";
import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
  PROGRAM_TYPES,
} from "./constants";

export const DOMRF_OFFERS: BankOffer[] = [
  {
    bank: BANK_NAMES.DOMRF,
    program: "Базовая",
    type: PROGRAM_TYPES.BASE,
    rate: BASE_RATES.DOMRF,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: BANK_NAMES.DOMRF,
    program: "11.9% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 11.9,
    subsidyPercent: 15.46,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: BANK_NAMES.DOMRF,
    program: "0.1% на 12 мес",
    type: PROGRAM_TYPES.SHORT,
    rate: BASE_RATES.DOMRF,
    shortRate: 0.1,
    subsidyPercent: 16.31,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 12,
    minLoanTermYears: 15,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: BANK_NAMES.DOMRF,
    program: "2.8% на 24 мес",
    type: PROGRAM_TYPES.SHORT,
    rate: BASE_RATES.DOMRF,
    shortRate: 2.8,
    subsidyPercent: 23.66,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 24,
    minLoanTermYears: 15,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: BANK_NAMES.DOMRF,
    program: "10% на 60 мес",
    type: PROGRAM_TYPES.SHORT,
    rate: BASE_RATES.DOMRF,
    shortRate: 10,
    subsidyPercent: 18.54,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 60,
    minLoanTermYears: 15,
    subsidyCalculationMethod: "standard",
  },
];
