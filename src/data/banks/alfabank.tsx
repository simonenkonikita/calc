import { BASE_RATES, MIN_PV_PERCENT } from "./constants";
import { BankOffer } from "../../utils/types";
import { ALFABANK_BASE_RATES } from "../rates/alfabankRates ";
import {
  ALFA_SUBSIDIES_11_89,
  ALFA_SUBSIDIES_12_99,
  ALFA_SUBSIDIES_13_89,
} from "../subsidies/alfaSubsidies";

export const ALFABANK_OFFERS: BankOffer[] = [
  {
    bank: "Альфа-Банк",
    program: "Базовая",
    type: "base",
    rate: BASE_RATES.ALFA,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicRates: ALFABANK_BASE_RATES,
  },
  {
    bank: "Альфа-Банк",
    program: "11.89% на весь срок",
    type: "full",
    rate: 11.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: ALFA_SUBSIDIES_11_89,
  },
  {
    bank: "Альфа-Банк",
    program: "12.99% на весь срок",
    type: "full",
    rate: 12.99,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: ALFA_SUBSIDIES_12_99,
  },
  {
    bank: "Альфа-Банк",
    program: "13.89% на весь срок",
    type: "full",
    rate: 13.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: ALFA_SUBSIDIES_13_89,
  },
  {
    bank: "Альфа-Банк",
    program: "Семейная базовая",
    type: "family",
    rate: 6,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "Альфа-Банк",
    program: "Семейная ипотека 3,5%",
    type: "family",
    rate: 3.5,
    subsidyPercent: 16.09,
    minPVPercent: MIN_PV_PERCENT,
  },
];
