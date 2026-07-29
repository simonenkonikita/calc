import { BankProgramResultWithIndex } from "../types";

// ✅ Функция для получения шильдика (бейджа) для банка
export const getBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  if (offer.bank === "Дом.РФ Банк" && offer.type === "base") {
    return {
      icon: "🎯",
      text: "При выходе на сделку за 30 дней, иначе +1%",
    };
  }
  return null;
};
