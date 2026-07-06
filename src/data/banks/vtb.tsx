import { BASE_RATES, MIN_PV_PERCENT } from "./constants";
import { BankOffer } from "../../utils/types";
import { VTB_EXCESS_RATES } from "../rates/vtbRates";

export const VTB_OFFERS: BankOffer[] = [
  {
    bank: "ВТБ",
    program: "Базовая",
    type: "full",
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
    program: "0,11% на 12 мес",
    type: "short",
    rate: BASE_RATES.VTB,
    shortRate: 0.11,
    subsidyPercent: 18.29,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "ВТБ",
    program: "2,99% на 12 мес",
    type: "short",
    rate: BASE_RATES.VTB,
    shortRate: 2.99,
    subsidyPercent: 15.49,
    minPVPercent: MIN_PV_PERCENT,
    durationMonths: 12,
    subsidyCalculationMethod: "standard",
  },
  {
    bank: "ВТБ",
    program: "Семейная базовая",
    type: "family",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
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
  },
];
