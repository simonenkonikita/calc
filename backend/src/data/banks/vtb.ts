import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
  PROGRAM_TYPES,
} from "./constants";

import { VTB_EXCESS_RATES } from "../rates/vtbRates";
import { COMPLEXES_FAMILY } from "../complexPrice/complexPriceData";
import { BankOffer } from "../../types/types";

export const VTB_OFFERS: BankOffer[] = [
  {
    bank: BANK_NAMES.VTB,
    program: PROGRAM_TYPES.BASE,
    type: "base",
    rate: BASE_RATES.VTB,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: BANK_NAMES.VTB,
    program: "12,89% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 12.89,
    subsidyPercent: 14.3,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: BANK_NAMES.VTB,
    program: "Семейная базовая",
    type: PROGRAM_TYPES.FAMILY,
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    complexes: COMPLEXES_FAMILY,
  },
  {
    bank: BANK_NAMES.VTB,
    program: "Семейная ипотека сверхлимит",
    type: PROGRAM_TYPES.FAMILY,
    rate: 7.17,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    excessLimit: true,
    dynamicRates: VTB_EXCESS_RATES,
    complexes: COMPLEXES_FAMILY,
  },
];
