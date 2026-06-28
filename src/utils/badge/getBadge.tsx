import { BankProgramResultWithIndex } from "../types";

// ✅ Функция для получения шильдика (бейджа) для банка
export const getBadge = (offer: BankProgramResultWithIndex): string | null => {
  // Альфа-Банк: базовая программа
  if (offer.bank === "Альфа-Банк" && offer.program === "Базовая") {
    return "При выходе на сделку за 30 дней, иначе +1%";
  }
  return null;
};
