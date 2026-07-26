import { HousingComplexPrice } from "../utils/types";

const BANKS_ALL = [
  "Сбербанк",
  "Дом.РФ Банк",
  "Уралсиб",
  "Альфа-Банк",
  "ВТБ",
  "Совкомбанк",
];

const BANKS_V1 = ["Сбербанк", "Дом.РФ Банк", "ВТБ", "Совкомбанк"];

export const housingPrices: HousingComplexPrice[] = [
  {
    complexName: "ЖК Сады у моря 3",
    apartmentType: "Студия",
    pricePerSquareMeter: 140000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Сады у моря 3",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 140000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Сады у моря 3",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 140000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Сады у моря 2 (Акция 130 000)",
    apartmentType: "Студия",
    pricePerSquareMeter: 130000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Сады у моря 2 (Акция 130 000)",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 130000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Сады у моря 2 (Акция 130 000)",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 130000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Лермонтов",
    apartmentType: "Студия",
    pricePerSquareMeter: 160000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Лермонтов",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 160000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Лермонтов",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 160000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Горы здесь",
    apartmentType: "Студия",
    pricePerSquareMeter: 474000,
    banks: BANKS_V1,
  },
  {
    complexName: "ЖК Горы здесь",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 474000,
    banks: BANKS_V1,
  },
  {
    complexName: "ЖК Горы здесь",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 474000,
    banks: BANKS_V1,
  },
  {
    complexName: "ЖК Два адмирала",
    apartmentType: "Студия",
    pricePerSquareMeter: 200000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Два адмирала",
    apartmentType: "Однокомнатная квартира",
    pricePerSquareMeter: 200000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ЖК Два адмирала",
    apartmentType: "Двухкомнатная квартира",
    pricePerSquareMeter: 200000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ГК Море тут",
    apartmentType: "Однокомнатные номера",
    pricePerSquareMeter: 270000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ГК Море тут",
    apartmentType: "Двухкомнатные номера",
    pricePerSquareMeter: 270000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ГК Морелло",
    apartmentType: "Однокомнатные номера до 39 м2",
    pricePerSquareMeter: 355000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ГК Морелло",
    apartmentType: "Однокомнатные номера от 39 м2",
    pricePerSquareMeter: 300000,
    banks: BANKS_ALL,
  },
  {
    complexName: "ГК Морелло",
    apartmentType: "Двухкомнатные номера от 50 м2",
    pricePerSquareMeter: 290000,
    banks: BANKS_ALL,
  },
];
