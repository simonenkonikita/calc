import { BASE_RATES, MIN_PV_PERCENT } from "./constants";
import { BankOffer } from "../../utils/types";
import { VTB_EXCESS_RATES } from "../rates/vtbRates";
import { COMPLEXES_FAMILY } from "../../utils/constants";

export const VTB_OFFERS: BankOffer[] = [
  {
    bank: "ВТБ",
    program: "Базовая",
    type: "base",
    rate: BASE_RATES.VTB,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "ВТБ",
    program: "12,89% на весь срок",
    type: "full",
    rate: 12.89,
    subsidyPercent: 14.3,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "ВТБ",
    program: "Семейная базовая",
    type: "family",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    complexes: COMPLEXES_FAMILY,
  },
  {
    bank: "ВТБ",
    program: "Семейная ипотека сверхлимит",
    type: "family",
    rate: 7.17,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    excessLimit: true,
    dynamicRates: VTB_EXCESS_RATES,
    complexes: COMPLEXES_FAMILY,
  },
];
