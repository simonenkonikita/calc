// src/config/banks/sovcombank.ts

import { BankOffer } from "../../utils/types";
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
import { BASE_RATES, MIN_PV_PERCENT } from "./constants";

export const SOVCOMBANK_OFFERS: BankOffer[] = [
  {
    bank: "Совкомбанк",
    program: "Базовая",
    type: "base",
    rate: BASE_RATES.SOVKOM,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
  },
  {
    bank: "Совкомбанк",
    program: "11.9% на весь срок",
    type: "full",
    rate: 11.9,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: SOVKOMBANK_SUBSIDIES_11_9,
  },
  {
    bank: "Совкомбанк",
    program: "12.49% на весь срок",
    type: "full",
    rate: 12.49,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: SOVKOMBANK_SUBSIDIES_12_49,
  },
  {
    bank: "Совкомбанк",
    program: "13.99% на весь срок",
    type: "full",
    rate: 13.99,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    dynamicSubsidyPercent: SOVKOMBANK_SUBSIDIES_13_99,
  },
  {
    bank: "Совкомбанк",
    program: "Семейная ипотека (2 договора)",
    type: "family",
    rate: 6,
    twoRate: 19.89,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    isTwoContracts: true,
    dynamicSubsidyPercent: SOVCOMBANK_SUBSIDIES_19_89,
  },
  {
    bank: "Совкомбанк",
    program: "Семейная ипотека (2 договора)",
    type: "family",
    rate: 6,
    twoRate: 11.9,
    subsidyPercent: 0,
    minPVPercent: MIN_PV_PERCENT,
    isTwoContracts: true,
    dynamicSubsidyPercent: SOVCOMBANK_SUBSIDIES_11_9,
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
