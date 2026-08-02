// backend/src/data/complexPrice/MORTGAGE_PROGRAMS.ts

import {
  COMPLEX_NAMES,
  COMPLEXES_FAMILY,
  COMPLEXES_IT,
  COMPLEXES_MILITARY,
} from "./CONSTRUCTION";

// ============================================================
// 🔥 КОНФИГУРАЦИЯ ИПОТЕЧНЫХ ПРОГРАММ
// ============================================================

export const MORTGAGE_PROGRAMS = {
  family: {
    id: "family",
    label: "Семейная ипотека",
    icon: "👨‍👩‍👧‍👦",
    description: "Для семей с детьми",
    rate: "6%",
    maxAmount: "6 млн ₽",
    color: "#8b5cf6",

    complexes: COMPLEXES_FAMILY,
  },
  it: {
    id: "it",
    label: "IT ипотека",
    icon: "💻",
    description: "Для IT-специалистов",
    rate: "6%",
    maxAmount: "9 млн ₽",
    color: "#3b82f6",
    complexes: COMPLEXES_IT,
  },
  military: {
    id: "military",
    label: "Военная ипотека",
    icon: "⭐",
    description: "Для военнослужащих",
    rate: "от 2.7%",
    maxAmount: "до 12 млн ₽",
    color: "#22c55e",
    complexes: COMPLEXES_MILITARY,
  },
} as const;

export type MortgageProgramKey = keyof typeof MORTGAGE_PROGRAMS;

// ============================================================
// 🔥 ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ДОСТУПНЫХ ПРОГРАММ ДЛЯ ЖК
// ============================================================

export const getEligibleProgramsForComplex = (
  complexName: string,
): string[] => {
  const eligible: string[] = [];

  Object.entries(MORTGAGE_PROGRAMS).forEach(([key, program]) => {
    if (program.complexes.includes(complexName)) {
      eligible.push(key);
    }
  });

  return eligible;
};
