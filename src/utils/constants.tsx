// ========== КОНСТАНТЫ ИПОТЕКИ ==========
export const DEFAULT_MIN_PV_PERCENT = 20.1;
export const DEFAULT_LOAN_TERM_YEARS = 30;
export const PRICE_PER_SQUARE_METER_DEFAULT = 140000;
export const MORTGAGE_WITHOUT_DOWN_PAYMENT_SURCHARGE = 10000;

// ========== ЛИМИТЫ ==========
export const MIN_AREA = 20;
export const MAX_AREA = 150;
export const MIN_DOWN_PAYMENT_PERCENT = 5;
export const MAX_DOWN_PAYMENT_PERCENT = 90;
export const MIN_LOAN_TERM = 1;
export const MAX_LOAN_TERM = 30;

// ========== БАНКИ ==========
export const BANK_ORDER = [
  "Сбербанк",
  "Альфа-Банк",
  "ВТБ",
  "Совкомбанк",
  "Уралсиб",
];

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
