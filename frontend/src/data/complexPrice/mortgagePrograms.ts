// frontend/src/data/mortgagePrograms.ts

// 🔥 Конфигурация для отображения (дублируем только для UI)
export const MORTGAGE_PROGRAMS_DISPLAY = {
  family: {
    id: "family",
    label: "Семейная ипотека",
    icon: "👨‍👩‍👧‍👦",
    rate: "6%",
    color: "#8b5cf6",
  },
  it: {
    id: "it",
    label: "IT ипотека",
    icon: "💻",
    rate: "6%",
    color: "#3b82f6",
  },
  military: {
    id: "military",
    label: "Военная ипотека",
    icon: "⭐",
    rate: "от 2.7%",
    color: "#22c55e",
  },
} as const;

export type MortgageProgramKey = keyof typeof MORTGAGE_PROGRAMS_DISPLAY;
