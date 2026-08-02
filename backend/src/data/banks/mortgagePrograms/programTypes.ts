// ============================================================
// 🔥 КОНФИГУРАЦИЯ ПРОГРАММ И ИХ СПИСКИ ЖК
// ============================================================

import { ProgramInfo } from "../../../types/types";
import { PROGRAM_COMPLEXES } from "../../complexPrice/CONSTRUCTION";
import {
  PROGRAM_TYPES,
  PROGRAM_TYPE_LABELS,
  PROGRAM_TYPE_ICONS,
  PROGRAM_TYPE_COLORS,
  PROGRAM_TYPE_DESCRIPTIONS,
} from "../constants";

// ============================================================
// 🔥 ПОЛУЧИТЬ ПОЛНУЮ ИНФОРМАЦИЮ О ПРОГРАММАХ ДЛЯ ЖК
// ============================================================

export const getEligibleProgramsForComplex = (
  complexName: string,
): ProgramInfo[] => {
  const result: ProgramInfo[] = [];

  Object.keys(PROGRAM_TYPES).forEach((key) => {
    const type = PROGRAM_TYPES[key as keyof typeof PROGRAM_TYPES];
    const complexes = PROGRAM_COMPLEXES[type];

    // Проверяем, есть ли ЖК в списке программы
    if (complexes && complexes.includes(complexName)) {
      result.push({
        type,
        label: PROGRAM_TYPE_LABELS[key as keyof typeof PROGRAM_TYPE_LABELS],
        icon: PROGRAM_TYPE_ICONS[key as keyof typeof PROGRAM_TYPE_ICONS],
        color: PROGRAM_TYPE_COLORS[key as keyof typeof PROGRAM_TYPE_COLORS],
        description:
          PROGRAM_TYPE_DESCRIPTIONS[
            key as keyof typeof PROGRAM_TYPE_DESCRIPTIONS
          ],
        banks: [],
        offers: [],
      });
    }
  });

  return result;
};

// ============================================================
// 🔥 ПОЛНЫЙ СПИСОК ПРОГРАММ ДЛЯ ОТПРАВКИ НА ФРОНТЕНД
// ============================================================

export const getProgramsConfig = () => {
  const programs = Object.keys(PROGRAM_TYPES).map((key) => {
    const type = PROGRAM_TYPES[key as keyof typeof PROGRAM_TYPES];
    return {
      type,
      label: PROGRAM_TYPE_LABELS[key as keyof typeof PROGRAM_TYPE_LABELS],
      icon: PROGRAM_TYPE_ICONS[key as keyof typeof PROGRAM_TYPE_ICONS],
      color: PROGRAM_TYPE_COLORS[key as keyof typeof PROGRAM_TYPE_COLORS],
      description:
        PROGRAM_TYPE_DESCRIPTIONS[
          key as keyof typeof PROGRAM_TYPE_DESCRIPTIONS
        ],
    };
  });

  const orderMap: Record<string, number> = {
    base: 0,
    full: 1,
    short: 2,
    family: 3,
    it: 4,
    tranche: 5,
  };

  return programs.sort(
    (a, b) => (orderMap[a.type] || 999) - (orderMap[b.type] || 999),
  );
};
