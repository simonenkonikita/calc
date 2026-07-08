import { Variables } from "../utils/types";

export const variables: Variables = {
  familyMortgageLimit: 6000000,
  maxFamilyMortgageSum: 15000000,
  itMortgageLimit: 9000000,
  maxItMortgageSum: 18000000,
  deposit: 30000,
  minExcessAmounts: {
    Сбербанк: 6300000, // 6.3 млн
    "ВТБ": 6150000, // 6.15 млн
    "Альфа-Банк": 6000000, // 6 млн (можно не указывать, будет дефолт)
    "Совкомбанк": 6000000, // 6 млн
    "Уралсиб": 6000000, // 6 млн
    "Дом.РФ Банк": 6000000, // 6 млн
  },
};
