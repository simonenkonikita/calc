import { BankProgramResultWithIndex } from "../types";

export const getTermYearsBadge = (
  offer: BankProgramResultWithIndex,
): { text: string; icon: string } | null => {
  if (offer.bank === "Совкомбанк" && offer.program === "12,49% на весь срок") {
    return {
      icon: "⏰",
      text: `Максимальный срок ипотеки 20 лет`,
    };
  }
  return null;
};
