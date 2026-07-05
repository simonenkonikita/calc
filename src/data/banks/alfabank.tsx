import { BASE_RATES, MIN_PV_PERCENT } from "./constants";
import { BankOffer } from "../../utils/types";
import { ALFABANK_BASE_RATES } from "../rates/alfabankRates ";

export const ALFABANK_OFFERS: BankOffer[] = [
  {
    bank: "Альфа-Банк",
    program: "Базовая",
    type: "full",
    rate: BASE_RATES.ALFA,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicRates: ALFABANK_BASE_RATES,
  },
  {
    bank: "Альфа-Банк",
    program: "12,99% на весь срок",
    type: "full",
    rate: 12.99,
    subsidyPercent: 14,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "Альфа-Банк",
    program: "Семейная базовая",
    type: "family",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
];
