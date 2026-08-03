// ============================================================
// 🔥 ПОЛУЧИТЬ ПОЛНУЮ ИНФОРМАЦИЮ О ПРОГРАММАХ ДЛЯ ЖК
// ============================================================

import { bankOffers } from "..";
import { ProgramInfo } from "../../../types/types";
import { PROGRAM_COMPLEXES } from "../../complexPrice/CONSTRUCTION";
import {
  PROGRAM_TYPES,
  PROGRAM_TYPE_LABELS,
  PROGRAM_TYPE_ICONS,
  PROGRAM_TYPE_COLORS,
  PROGRAM_TYPE_DESCRIPTIONS,
} from "../constants";

export const getEligibleProgramsForComplex = (
  complexName: string,
): ProgramInfo[] => {
  const result: ProgramInfo[] = [];

  // 🔥 ФИЛЬТРУЕМ ПРЕДЛОЖЕНИЯ БАНКОВ ДЛЯ ЭТОГО ЖК
  const offersForComplex = bankOffers.filter((offer) => {
    // Проверяем, доступна ли программа для этого ЖК
    if (offer.complexes && !offer.complexes.includes(complexName)) {
      return false;
    }
    return true;
  });

  Object.keys(PROGRAM_TYPES).forEach((key) => {
    const type = PROGRAM_TYPES[key as keyof typeof PROGRAM_TYPES];
    const complexes = PROGRAM_COMPLEXES[type];

    // Проверяем, есть ли ЖК в списке программы
    if (complexes && complexes.includes(complexName)) {
      // 🔥 ПОЛУЧАЕМ ОФФЕРЫ ДЛЯ ЭТОГО ТИПА ПРОГРАММЫ
      const matchingOffers = offersForComplex.filter(
        (offer) => offer.type === type,
      );

      // 🔥 ПОЛУЧАЕМ УНИКАЛЬНЫЕ БАНКИ
      const uniqueBanks = Array.from(
        new Set(matchingOffers.map((offer) => offer.bank)),
      );

      result.push({
        type,
        label: PROGRAM_TYPE_LABELS[key as keyof typeof PROGRAM_TYPE_LABELS],
        icon: PROGRAM_TYPE_ICONS[key as keyof typeof PROGRAM_TYPE_ICONS],
        color: PROGRAM_TYPE_COLORS[key as keyof typeof PROGRAM_TYPE_COLORS],
        description:
          PROGRAM_TYPE_DESCRIPTIONS[
            key as keyof typeof PROGRAM_TYPE_DESCRIPTIONS
          ],
        banks: uniqueBanks,
        offers: matchingOffers,
      });
    }
  });

  return result;
};
