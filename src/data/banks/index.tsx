// src/config/banks/index.ts

import { BankOffer } from "../../utils/types";
import { SBERBANK_OFFERS } from "./sberbank";
import { SOVCOMBANK_OFFERS } from "./sovcombank";
import { VTB_OFFERS } from "./vtb";
import { ALFABANK_OFFERS } from "./alfabank";
import { URALSIB_OFFERS } from "./uralsib";
import { DOMRF_OFFERS } from "./domrf";

export const bankOffers: BankOffer[] = [
  ...SBERBANK_OFFERS,
  ...SOVCOMBANK_OFFERS,
  ...VTB_OFFERS,
  ...ALFABANK_OFFERS,
  ...URALSIB_OFFERS,
  ...DOMRF_OFFERS,
];
