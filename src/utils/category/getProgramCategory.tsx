import { BankProgramResultWithIndex } from "../types";

// Функция для определения категории программы
export const getProgramCategory = (
  offer: BankProgramResultWithIndex,
): string => {
  if (offer.type === "base") {
    return "base";
  }
  if (offer.type === "full") {
    return "full";
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
