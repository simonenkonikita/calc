import { HousingComplexPrice } from "../../utils/types";

// ============================================================
// 🔥 СУММА БРОНИ
// ============================================================
export const DEPOSIT_AMOUNT = 30000;

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
const BANKS_ALL = [
  "Сбербанк",
  "Дом.РФ Банк",
  "Уралсиб",
  "Альфа-Банк",
  "ВТБ",
  "Совкомбанк",
];

const BANKS_V1 = ["Сбербанк", "Дом.РФ Банк", "ВТБ", "Совкомбанк"];

const BANKS_V2 = ["Сбербанк"];

// ============================================================
// 🔥 СПИСКИ ЖК ДЛЯ РАЗНЫХ ПРОГРАММ
// ============================================================

// Все ЖК
export const ALL_COMPLEXES = [
  "ЖК Сады у моря 3",
  "ЖК Сады у моря 2",
  "ЖК Лермонтов",
  "ЖК Горы здесь",
  "ЖК Два адмирала",
  "ГК Море тут",
  "ГК Морелло",
  "КП Солнечный",
];

// ЖК для семейной ипотеки
export const COMPLEXES_FAMILY = [
  "ЖК Сады у моря 3",
  "ЖК Сады у моря 2",
  "ЖК Два адмирала",
  "ЖК Лермонтов",
  "ЖК Горы здесь",
  "КП Солнечный",
];

// ЖК для ИТ ипотеки
export const COMPLEXES_IT = [
  "ЖК Сады у моря 3",
  "ЖК Сады у моря 2",
  "ЖК Два адмирала",
  "ЖК Лермонтов",
  "ЖК Горы здесь",
  "КП Солнечный",
];

// ============================================================
// 🔥 КОНФИГУРАЦИЯ ТРАНШЕЙ
// ============================================================

// Даты выдачи второго транша
export const TRANCHE_SECOND_DATE_BY_COMPLEX: Record<string, string> = {
  "ЖК Горы здесь": "2027-02-01",
  "ГК Море тут": "2027-02-01",
};

// ЖК, где траншевая ипотека НЕ доступна
export const TRANCHE_UNAVAILABLE_COMPLEXES = [
  "ЖК Сады у моря 3",
  "ЖК Сады у моря 2",
  "ЖК Два адмирала",
  "ЖК Лермонтов",
  "ГК Морелло",
  "КП Солнечный",
];

// ============================================================
// 🔥 ЕДИНАЯ КОНФИГУРАЦИЯ ЖК (ЦЕНЫ + НАЦЕНКИ + БАНКИ)
// ============================================================
export const housingPrices: HousingComplexPrice[] = [
  // ============================================================
  // ЖК Сады у моря 3
  // ============================================================
  {
    complexName: "ЖК Сады у моря 3",
    apartmentType: "Студия",
    pricePerSquareMeter: 140000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 40000, // 🔥 НАЦЕНКИ ЗА ИПОТЕКУ БЕЗ ПВ
      partialDownPayment: 15000, // 🔥 НАЦЕНКИ ЗА ИПОТЕКУ С ЧАСТИЧНЫМ ПВ
    },
  },
  {
    complexName: "ЖК Сады у моря 3",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 140000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 40000,
      partialDownPayment: 15000,
    },
  },
  {
    complexName: "ЖК Сады у моря 3",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 140000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 40000,
      partialDownPayment: 15000,
    },
  },

  // ============================================================
  // ЖК Сады у моря 2 (Акция 130 000)
  // ============================================================
  {
    complexName: "ЖК Сады у моря 2",
    apartmentType: "Студия",
    pricePerSquareMeter: 130000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Сады у моря 2",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 130000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Сады у моря 2",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 130000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },

  // ============================================================
  // ЖК Лермонтов
  // ============================================================
  {
    complexName: "ЖК Лермонтов",
    apartmentType: "Студия",
    pricePerSquareMeter: 160000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Лермонтов",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 160000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Лермонтов",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 160000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },

  // ============================================================
  // ЖК Горы здесь
  // ============================================================
  {
    complexName: "ЖК Горы здесь",
    apartmentType: "Студия",
    pricePerSquareMeter: 474000,
    banks: BANKS_V1,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Горы здесь",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 474000,
    banks: BANKS_V1,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Горы здесь",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 474000,
    banks: BANKS_V1,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },

  // ============================================================
  // ЖК Два адмирала
  // ============================================================
  {
    complexName: "ЖК Два адмирала",
    apartmentType: "Студия",
    pricePerSquareMeter: 200000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Два адмирала",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 200000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ЖК Два адмирала",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 200000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },

  // ============================================================
  // ГК Море тут
  // ============================================================
  {
    complexName: "ГК Море тут",
    apartmentType: "Однокомнатные номера",
    pricePerSquareMeter: 270000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
  {
    complexName: "ГК Море тут",
    apartmentType: "Двухкомнатные номера",
    pricePerSquareMeter: 270000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },

  // ============================================================
  // ГК Морелло
  // ============================================================
  {
    complexName: "ГК Морелло",
    apartmentType: "Однокомнатные номера до 39 м2",
    pricePerSquareMeter: 355000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 25000,
      partialDownPayment: 10000,
    },
  },
  {
    complexName: "ГК Морелло",
    apartmentType: "Однокомнатные номера от 39 м2",
    pricePerSquareMeter: 300000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 30000,
      partialDownPayment: 10000,
    },
  },
  {
    complexName: "ГК Морелло",
    apartmentType: "Двухкомнатные номера от 50 м2",
    pricePerSquareMeter: 290000,
    banks: BANKS_ALL,
    surcharges: {
      withoutDownPayment: 40000,
      partialDownPayment: 10000,
    },
  },
  // ============================================================
  // КП Солнечный
  // ============================================================
  {
    complexName: "КП Солнечный",
    apartmentType: "Дом с земельным участком",
    pricePerSquareMeter: 90000,
    banks: BANKS_V2,
    surcharges: {
      withoutDownPayment: 0,
      partialDownPayment: 0,
    },
  },
];
