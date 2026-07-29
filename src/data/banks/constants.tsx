// Базовые ставки
export const BASE_RATES = {
  SBER: 20.7,
  ALFA: 19.09,
  SOVKOM: 19.99,
  VTB: 19.9,
  URALSIB: 18.19,
  DOMRF: 17.3,
} as const;

// Минимальный ПВ
export const MIN_PV_PERCENT = 20.1;

export const BANK_NAMES = {
  SBER: "Сбербанк",
  ALFA: "Альфа-Банк",
  SOVKOM: "Совкомбанк",
  VTB: "ВТБ",
  URALSIB: "Уралсиб",
  DOMRF: "Дом.РФ Банк",
} as const;

export const PROGRAM_TYPES = {
  BASE: "base",
  FULL: "full",
  SHORT: "short",
  FAMILY: "family",
  IT: "it",
  TRANCHE: "tranche",
} as const;

export const PROGRAM_TYPE_LABELS = {
  BASE: "Базовая ипотека",
  FULL: "Субсидии на длинный срок",
  SHORT: "Субсидии на короткий срок",
  FAMILY: "Семейная ипотека",
  IT: "ИТ ипотека",
  TRANCHE: "Траншевая ипотека",
} as const;

export const PROGRAM_TYPE_ICONS = {
  BASE: "🏠",
  FULL: "📈",
  SHORT: "⚡",
  FAMILY: "👨‍👩‍👧‍👦",
  IT: "💻",
  TRANCHE: "📊",
};

export const CATEGORY_ORDER = [
  {
    key: PROGRAM_TYPES.BASE,
    label: `${PROGRAM_TYPE_ICONS.BASE} ${PROGRAM_TYPE_LABELS.BASE}`,
    types: [PROGRAM_TYPES.BASE],
  },
  {
    key: PROGRAM_TYPES.FULL,
    label: `${PROGRAM_TYPE_ICONS.FULL} ${PROGRAM_TYPE_LABELS.FULL}`,
    types: [PROGRAM_TYPES.FULL],
  },
  {
    key: PROGRAM_TYPES.SHORT,
    label: `${PROGRAM_TYPE_ICONS.SHORT} ${PROGRAM_TYPE_LABELS.SHORT}`,
    types: [PROGRAM_TYPES.SHORT],
  },
  {
    key: PROGRAM_TYPES.FAMILY,
    label: `${PROGRAM_TYPE_ICONS.FAMILY} ${PROGRAM_TYPE_LABELS.FAMILY}`,
    types: [PROGRAM_TYPES.FAMILY],
  },
  {
    key: PROGRAM_TYPES.IT,
    label: `${PROGRAM_TYPE_ICONS.IT} ${PROGRAM_TYPE_LABELS.IT}`,
    types: [PROGRAM_TYPES.IT],
  },
  {
    key: PROGRAM_TYPES.TRANCHE,
    label: `${PROGRAM_TYPE_ICONS.TRANCHE} ${PROGRAM_TYPE_LABELS.TRANCHE}`,
    types: [PROGRAM_TYPES.TRANCHE],
  },
];
