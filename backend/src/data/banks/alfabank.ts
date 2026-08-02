import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
  PROGRAM_TYPES,
} from "./constants";

import { ALFABANK_BASE_RATES } from "../rates/alfabankRates ";
import {
  ALFA_SUBSIDIES_11_89,
  ALFA_SUBSIDIES_12_99,
  ALFA_SUBSIDIES_13_89,
} from "../subsidies/alfaSubsidies";
import { BankOffer } from "../../types/types";
import { ALL_COMPLEXES, COMPLEXES_FAMILY } from "../complexPrice/CONSTRUCTION";

export const ALFABANK_OFFERS: BankOffer[] = [
  {
    bank: BANK_NAMES.ALFA,
    program: "Базовая",
    type: PROGRAM_TYPES.BASE,
    rate: BASE_RATES.ALFA,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicRates: ALFABANK_BASE_RATES,
    complexes: ALL_COMPLEXES,
  },
  {
    bank: BANK_NAMES.ALFA,
    program: "11.89% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 11.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: ALFA_SUBSIDIES_11_89,
    complexes: ALL_COMPLEXES,
  },
  {
    bank: BANK_NAMES.ALFA,
    program: "12.99% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 12.99,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: ALFA_SUBSIDIES_12_99,
    complexes: ALL_COMPLEXES,
  },
  {
    bank: BANK_NAMES.ALFA,
    program: "13.89% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 13.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: ALFA_SUBSIDIES_13_89,
    complexes: ALL_COMPLEXES,
  },
  {
    bank: BANK_NAMES.ALFA,
    program: "Семейная базовая",
    type: PROGRAM_TYPES.FAMILY,
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    complexes: COMPLEXES_FAMILY,
  },
  {
    bank: BANK_NAMES.ALFA,
    program: "Семейная ипотека 3,5%",
    type: PROGRAM_TYPES.FAMILY,
    rate: 3.5,
    subsidyPercent: 16.09,
    minPVPercent: MIN_PV_PERCENT,
    complexes: COMPLEXES_FAMILY,
  },
];
