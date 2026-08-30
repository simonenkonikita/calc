// src/utils/badge/getTrancheBadge.ts

import { BankProgramResultWithIndex } from "../types";

export const getTrancheBadge = (
  offer: BankProgramResultWithIndex,
  complexName: string,
): { text: string; icon: string } | null => {
  if (!offer.isTranche) {
    return null;
  }

  // ✅ Проверяем, что для этого ЖК есть дата в офере
  if (!offer.trancheSecondDate) {
    return {
      icon: "❌",
      text: "Траншевая ипотека недопустима",
    };
  }

  // ✅ Проверяем, что ЖК есть в списке комплексов офера
  if (offer.complexes && !offer.complexes.includes(complexName)) {
    return {
      icon: "❌",
      text: "Траншевая ипотека недоступна для этого ЖК",
    };
  }

  return {
    icon: "📅",
    text: `Траншевая ипотека до`,
  };
};
