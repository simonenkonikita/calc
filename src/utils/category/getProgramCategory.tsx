import { BankProgramResultWithIndex } from "../types";

// Функция для определения категории программы
export const getProgramCategory = (
  offer: BankProgramResultWithIndex,
): string => {
  if (offer.type === "full" && offer.subsidyAmount === 0) {
    return "base";
  }
  if (offer.type === "full" && offer.subsidyAmount > 0) {
    return "long";
  }
  if (offer.type === "short") {
    return "short";
  }
  if (offer.type === "family") {
    return "family";
  }
  if (offer.type === "it") {
    return "it";
  }
  if (offer.type === "tranche") {
    return "tranche";
  }
  return "base";
};
