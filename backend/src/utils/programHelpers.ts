// src/utils/programHelpers.ts

import { ProgramInfo } from "../types/types";
import {
  PROGRAM_TYPES,
  PROGRAM_TYPE_LABELS,
  PROGRAM_TYPE_ICONS,
  PROGRAM_TYPE_COLORS,
  PROGRAM_TYPE_DESCRIPTIONS,
} from "../data/banks/constants";
import { bankOffers } from "../data/banks";
import { PROGRAM_COMPLEXES } from "../data/complexPrice/CONSTRUCTION";

/**
 * 🔥 Утилита для получения программ для конкретного ЖК
 * @param complexName - название жилого комплекса
 * @returns массив программ с офферами для этого ЖК
 */
export const getProgramsForComplex = (complexName: string): ProgramInfo[] => {
  const result: ProgramInfo[] = [];

  // Фильтруем предложения для этого ЖК
  const offersForComplex = bankOffers.filter((offer) => {
    if (offer.complexes && !offer.complexes.includes(complexName)) {
      return false;
    }
    return true;
  });

  Object.keys(PROGRAM_TYPES).forEach((key) => {
    const type = PROGRAM_TYPES[key as keyof typeof PROGRAM_TYPES];
    const complexes = PROGRAM_COMPLEXES[type];

    if (complexes && complexes.includes(complexName)) {
      const matchingOffers = offersForComplex.filter(
        (offer) => offer.type === type,
      );

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

/**
 * 🔥 Получить программы для всех ЖК (кэшируется)
 */
export const getAllProgramsForComplexes = (): Record<string, ProgramInfo[]> => {
  const result: Record<string, ProgramInfo[]> = {};
  const complexNames = Object.keys(PROGRAM_COMPLEXES).flatMap(
    (type) => PROGRAM_COMPLEXES[type],
  );
  const uniqueComplexes = Array.from(new Set(complexNames));

  uniqueComplexes.forEach((complexName) => {
    result[complexName] = getProgramsForComplex(complexName);
  });

  return result;
};
