// ============================================================
// 🔥 СУММА БРОНИ
// ============================================================

// ============================================================
// 🔥 ПОРЯДОК БАНКОВ ДЛЯ ОТОБРАЖЕНИЯ
// ============================================================
export const BANK_ORDER = [
  "Сбербанк",
  "Дом.РФ Банк",
  "Уралсиб",
  "Альфа-Банк",
  "ВТБ",
  "Совкомбанк",
  "КП Солнечный",
];

// ============================================================
// 🔥 КОНФИГУРАЦИЯ БАНКОВ (ДОСТУМНЫЕ БАНКИ В КОМПЛЕКСЕ)
// ============================================================
export const BANKS_ALL = [
  "Сбербанк",
  "Дом.РФ Банк",
  "Уралсиб",
  "Альфа-Банк",
  "ВТБ",
  "Совкомбанк",
];

export const BANKS_V1 = ["Сбербанк", "Дом.РФ Банк", "ВТБ", "Совкомбанк"];
export const BANKS_V2 = ["Сбербанк"];

// ============================================================
// 🔥 НАЗВАНИЯ ЖК
// ============================================================
export const COMPLEX_NAMES = {
  SADY_3: "ЖК Сады у моря 3",
  SADY_2: "ЖК Сады у моря 2",
  LERMONTOV: "ЖК Лермонтов",
  GORY_ZDES: "ЖК Горы здесь",
  DVA_ADMIRALA: "ЖК Два адмирала",
  MORE_TUT: "ГК Море тут",
  MORELLO: "ГК Морелло",
  SOLAR: "КП Солнечный",
};

// ============================================================
// 🔥 ID ЖК
// ============================================================
export const COMPLEX_IDS = {
  SADY_3: "sady_3",
  SADY_2: "sady_2",
  LERMONTOV: "lermontov",
  GORY_ZDES: "gory_zdes",
  DVA_ADMIRALA: "dva_admirala",
  MORE_TUT: "more_tut",
  MORELLO: "morello",
  SOLAR: "solar",
};

// ============================================================
// 🔥 СТАТУСЫ И ИКОНКИ ЖК
// ============================================================

// Статусы
export const COMPLEX_STATUS = {
  CONSTRUCTION: "строится",
  READY: "сдан",
  PROJECT: "проект",
};

// Иконки для статусов
export const STATUS_ICONS = {
  [COMPLEX_STATUS.CONSTRUCTION]: "🏗️",
  [COMPLEX_STATUS.READY]: "🏢",
  [COMPLEX_STATUS.PROJECT]: "🏠",
};

export const ICONS = {
  CONSTRUCTION: STATUS_ICONS[COMPLEX_STATUS.CONSTRUCTION],
  READY: STATUS_ICONS[COMPLEX_STATUS.READY],
  PROJECT: STATUS_ICONS[COMPLEX_STATUS.PROJECT],
};

// ============================================================
// 🔥 ОПИСАНИЯ ЖК
// ============================================================
export const COMPLEX_DESCRIPTIONS = {
  [COMPLEX_NAMES.SADY_3]: "Строящийся дом с выгодными ценами",
  [COMPLEX_NAMES.SADY_2]: "Сданный дом с готовыми квартирами",
  [COMPLEX_NAMES.LERMONTOV]: 'ЖК с программой лояльности "ДЛЯ СВОИХ"',
  [COMPLEX_NAMES.GORY_ZDES]: "ЖК с панорамным видом на горы",
  [COMPLEX_NAMES.DVA_ADMIRALA]: "Сданный ЖК с развитой инфраструктурой",
  [COMPLEX_NAMES.MORE_TUT]: "Новый жилой комплекс у моря",
  [COMPLEX_NAMES.MORELLO]: "Жилой комплекс с современными квартирами",
  [COMPLEX_NAMES.SOLAR]: "Коттеджный поселок с земельными участками",
};

// ============================================================
// 🔥 КОНФИГУРАЦИЯ СТАТУСОВ ДЛЯ КАЖДОГО ЖК
// ============================================================
export const COMPLEX_CONFIG = {
  [COMPLEX_NAMES.SADY_3]: {
    status: COMPLEX_STATUS.CONSTRUCTION,
    statusIcon: ICONS.CONSTRUCTION,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.SADY_3],
  },
  [COMPLEX_NAMES.SADY_2]: {
    status: COMPLEX_STATUS.READY,
    statusIcon: ICONS.READY,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.SADY_2],
  },
  [COMPLEX_NAMES.LERMONTOV]: {
    status: COMPLEX_STATUS.CONSTRUCTION,
    statusIcon: ICONS.CONSTRUCTION,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.LERMONTOV],
  },
  [COMPLEX_NAMES.GORY_ZDES]: {
    status: COMPLEX_STATUS.CONSTRUCTION,
    statusIcon: ICONS.CONSTRUCTION,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.GORY_ZDES],
  },
  [COMPLEX_NAMES.DVA_ADMIRALA]: {
    status: COMPLEX_STATUS.READY,
    statusIcon: ICONS.READY,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.DVA_ADMIRALA],
  },
  [COMPLEX_NAMES.MORE_TUT]: {
    status: COMPLEX_STATUS.CONSTRUCTION,
    statusIcon: ICONS.CONSTRUCTION,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.MORE_TUT],
  },
  [COMPLEX_NAMES.MORELLO]: {
    status: COMPLEX_STATUS.CONSTRUCTION,
    statusIcon: ICONS.CONSTRUCTION,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.MORELLO],
  },
  [COMPLEX_NAMES.SOLAR]: {
    status: COMPLEX_STATUS.PROJECT,
    statusIcon: ICONS.PROJECT,
    description: COMPLEX_DESCRIPTIONS[COMPLEX_NAMES.SOLAR],
  },
};

// ============================================================
// 🔥 СПИСКИ ЖК ДЛЯ РАЗНЫХ ПРОГРАММ
// ============================================================

// Все ЖК
export const ALL_COMPLEXES = [
  COMPLEX_NAMES.SADY_3,
  COMPLEX_NAMES.SADY_2,
  COMPLEX_NAMES.LERMONTOV,
  COMPLEX_NAMES.GORY_ZDES,
  COMPLEX_NAMES.DVA_ADMIRALA,
  COMPLEX_NAMES.MORE_TUT,
  COMPLEX_NAMES.MORELLO,
  COMPLEX_NAMES.SOLAR,
];

// ЖК для семейной ипотеки
export const COMPLEXES_FAMILY = [
  COMPLEX_NAMES.SADY_3,
  COMPLEX_NAMES.SADY_2,
  COMPLEX_NAMES.DVA_ADMIRALA,
  COMPLEX_NAMES.LERMONTOV,
  COMPLEX_NAMES.GORY_ZDES,
  COMPLEX_NAMES.SOLAR,
];

// ЖК для ИТ ипотеки
export const COMPLEXES_IT = [
  COMPLEX_NAMES.SADY_3,
  COMPLEX_NAMES.SADY_2,
  COMPLEX_NAMES.DVA_ADMIRALA,
  COMPLEX_NAMES.LERMONTOV,
  COMPLEX_NAMES.GORY_ZDES,
  COMPLEX_NAMES.SOLAR,
];

// ============================================================
// 🔥 КОНФИГУРАЦИЯ ТРАНШЕЙ
// ============================================================

// Даты выдачи второго транша
export const TRANCHE_SECOND_DATE_BY_COMPLEX: Record<string, string> = {
  [COMPLEX_NAMES.GORY_ZDES]: "2027-02-01",
  [COMPLEX_NAMES.MORE_TUT]: "2027-02-01",
};

// ЖК, где траншевая ипотека НЕ доступна
export const TRANCHE_UNAVAILABLE_COMPLEXES = [
  COMPLEX_NAMES.SADY_3,
  COMPLEX_NAMES.SADY_2,
  COMPLEX_NAMES.DVA_ADMIRALA,
  COMPLEX_NAMES.LERMONTOV,
  COMPLEX_NAMES.MORELLO,
  COMPLEX_NAMES.SOLAR,
];
