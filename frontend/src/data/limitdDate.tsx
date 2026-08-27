import { Variables } from "../utils/types";

export const variables: Variables = {
  familyMortgageLimit: 6000000,
  maxFamilyMortgageSum: 15000000,
  itMortgageLimit: 9000000,
  maxItMortgageSum: 18000000,
  deposit: 30000,
  minExcessAmountsFamily: {
    Сбербанк: 6300000,
    ВТБ: 6150000,
    "Альфа-Банк": 6000000,
    Совкомбанк: 7500000,
    Уралсиб: 6000000,
    "Дом.РФ Банк": 6000000,
  },
  minExcessAmountsIt: {
    Сбербанк: 9300000,
    ВТБ: 9150000,
    "Альфа-Банк": 9000000,
    Совкомбанк: 10500000,
    Уралсиб: 9000000,
    "Дом.РФ Банк": 9000000,
  },
};
