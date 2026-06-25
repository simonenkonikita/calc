// ========== КОНСТАНТЫ ИПОТЕКИ ==========
export const DEFAULT_MIN_PV_PERCENT = 20.1;
export const DEFAULT_LOAN_TERM_YEARS = 30;
export const PRICE_PER_SQUARE_METER_DEFAULT = 140000;

// ========== НАЦЕНКА ЗА ИПОТЕКУ БЕЗ ПВ ==========
export const MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGES: Record<string, number> =
  {
    "ЖК Сады у моря": 35000,
    "ЖК Лермонтов": 10000,
    "ЖК Горы здесь": 10000,
    "ГК Море тут": 10000,
    "ГК Морелло": 20000,
    // Добавьте остальные ЖК по мере необходимости
  };

// ========== НАЦЕНКА ЗА ИПОТЕКУ С ЧАСТИЧНЫМ ПВ ==========
export const MORTGAGE_PARTIAL_DOWN_PAYMENT_SURCHARGES: Record<string, number> =
  {
    "ЖК Сады у моря": 15000,
    "ЖК Лермонтов": 10000,
    "ЖК Горы здесь": 10000,
    "ГК Море тут": 10000,
    "ГК Морелло": 20000,
  };

// ========== ЛИМИТЫ ==========
export const MIN_AREA = 1;
export const MAX_AREA = 150;
export const MIN_DOWN_PAYMENT_PERCENT = 20.1;
export const MAX_DOWN_PAYMENT_PERCENT = 99.9;
export const MIN_LOAN_TERM = 1;
export const MAX_LOAN_TERM = 30;

// ========== БАНКИ ==========
// Порядок банков для отображения
export const BANK_ORDER = [
  "Сбербанк",
  "Альфа-Банк",
  "ВТБ",
  "Совкомбанк",
  "Уралсиб",
];

// ========== БАНКИ ДЛЯ ПРОЕКТНОГО ФИНАНСИРОВАНИЯ ==========
export const PROJECT_FINANCING_BANKS = ["Сбербанк"] as const;

export const DEFAULT_PROJECT_FINANCING_BANK = "Сбербанк";

// ========== ТИПЫ ПРОГРАММ ==========
export const PROGRAM_TYPES = {
  FULL: "full",
  SHORT: "short",
  FAMILY: "family",
  IT: "it",
} as const;

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  full: "Весь срок",
  short: "Короткий срок",
  family: "Семейная ипотека",
  it: "ИТ ипотека",
};

export const CATEGORY_ORDER = [
  { key: "base", label: "🏠 Базовая ипотека", types: ["full"] },
  { key: "long", label: "📈 Субсидии на длинный срок", types: ["full"] },
  { key: "short", label: "⚡ Субсидии на короткий срок", types: ["short"] },
  { key: "family", label: "👨‍👩‍👧‍👦 Семейная ипотека", types: ["family"] },
  { key: "it", label: "💻 ИТ ипотека", types: ["it"] },
];
