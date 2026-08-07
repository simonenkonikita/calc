// src/config/banks/sovcombank.ts

import { BankOffer } from "../../types/types";
import { COMPLEXES_FAMILY } from "../complexPrice/CONSTRUCTION";
import { SOVKOMBANK_BASE_RATES } from "../rates/sovkombankRates";
import {
  SOVKOMBANK_SUBSIDIES_11_9,
  SOVKOMBANK_SUBSIDIES_12_49,
  SOVKOMBANK_SUBSIDIES_13_99,
} from "../subsidies/sovcombankSubsidies";
import {
  SOVCOMBANK_SUBSIDIES_11_9,
  SOVCOMBANK_SUBSIDIES_19_89,
} from "../subsidies/sovcombankTwoContractSubsidies";
/* import {
  SOVCOMBANK_SUBSIDIES_V1,
  SOVCOMBANK_SUBSIDIES_V2,
} from "../subsidies/sovcombankSubsidies"; */
import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
  PROGRAM_TYPES,
} from "./constants";

export const SOVCOMBANK_OFFERS: BankOffer[] = [
  {
    bank: BANK_NAMES.SOVKOM,
    program: PROGRAM_TYPES.BASE,
    type: "base",
    rate: BASE_RATES.SOVKOM,
    dynamicRates: SOVKOMBANK_BASE_RATES,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: BANK_NAMES.SOVKOM,
    program: "11.9% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 11.9,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: SOVKOMBANK_SUBSIDIES_11_9,
  },
  {
    bank: BANK_NAMES.SOVKOM,
    program: "12.49% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 12.49,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: SOVKOMBANK_SUBSIDIES_12_49,
  },
  {
    bank: BANK_NAMES.SOVKOM,
    program: "13.99% на весь срок",
    type: PROGRAM_TYPES.FULL,
    rate: 13.99,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: SOVKOMBANK_SUBSIDIES_13_99,
  },
  {
    bank: BANK_NAMES.SOVKOM,
    program: "Семейная ипотека (2 договора)",
    type: PROGRAM_TYPES.FAMILY,
    rate: 6,
    twoRate: 19.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    isTwoContracts: true,
    dynamicSubsidyPercent: SOVCOMBANK_SUBSIDIES_19_89,
    thresholdTolerance: 0.5,
    thresholdToleranceType: "percent",
    roundingStrategy: "up",
    complexes: COMPLEXES_FAMILY,
  },
  {
    bank: BANK_NAMES.SOVKOM,
    program: "Семейная ипотека (2 договора)",
    type: PROGRAM_TYPES.FAMILY,
    rate: 6,
    twoRate: 11.9,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    isTwoContracts: true,
    dynamicSubsidyPercent: SOVCOMBANK_SUBSIDIES_11_9,
    thresholdTolerance: 0.5,
    thresholdToleranceType: "percent",
    roundingStrategy: "up",
    complexes: COMPLEXES_FAMILY,
  },
  /*   {
    bank: "Совкомбанк",
    program: "Семейная ипотека сверхлимит 6%",
    type: "family",
    rate: 6,
    subsidyPercent: 65,
    minPVPercent: minPVPercent,
    excessLimit: true,
  }, */
  /*  {
    bank: "Совкомбанк",
    program: "ИТ ипотека (2 договора)",
    type: "it",
    rate: 6,
    subsidyPercent: 9.5,
    minPVPercent: minPVPercent,
    excessLimit: true,
    isTwoContracts: true,
  },
  {
    bank: "Совкомбанк",
    program: "ИТ ипотека сверхлимит 6%",
    type: "it",
    rate: 6,
    subsidyPercent: 65,
    minPVPercent: minPVPercent,
    excessLimit: true,
  }, */
];
