// src/utils/filterBankOffers.ts

import { BankOffer, HousingComplexPrice } from "../types/types";

interface FilterBankOffersParams {
  bankOffers: BankOffer[];
  complexName: string;
  apartmentType: string;
  housingPrices: HousingComplexPrice[];
}

/**
 * Фильтрует банковские предложения по доступности для ЖК
 * Возвращает только те предложения, которые доступны для выбранного ЖК
 */
export const filterBankOffersByComplex = (
  params: FilterBankOffersParams,
): BankOffer[] => {
  const { bankOffers, complexName, apartmentType, housingPrices } = params;

  // Если ЖК или тип квартиры не выбраны - возвращаем все предложения
  if (!complexName || !apartmentType) {
    return bankOffers;
  }

  // Находим данные по ЖК и типу квартиры
  const complexData = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );

  // Если данных нет - возвращаем все предложения
  if (!complexData) {
    return bankOffers;
  }

  // Получаем список доступных банков для этого ЖК
  const availableBanks = complexData.banks;

  return bankOffers.filter((offer) => {
    // 1. Проверка по программе: если у программы указан список ЖК
    if (offer.complexes && offer.complexes.length > 0) {
      // Программа доступна только если ЖК есть в списке
      if (!offer.complexes.includes(complexName)) {
        return false;
      }
    }

    // 2. Проверка по банку: если у ЖК указан список банков
    if (availableBanks && availableBanks.length > 0) {
      // Банк доступен только если он есть в списке
      if (!availableBanks.includes(offer.bank)) {
        return false;
      }
    }

    // Все проверки пройдены - доступно
    return true;
  });
};

/**
 * Проверяет, доступен ли банк для конкретного ЖК
 */
export const isBankAvailableForComplex = (
  bankName: string,
  complexName: string,
  apartmentType: string,
  housingPrices: HousingComplexPrice[],
): boolean => {
  if (!complexName || !apartmentType) return true;

  const complexData = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );

  if (!complexData) return true;
  if (!complexData.banks) return true;

  return complexData.banks.includes(bankName);
};

/**
 * Проверяет, доступна ли программа для конкретного ЖК
 */
export const isProgramAvailableForComplex = (
  offer: BankOffer,
  complexName: string,
): boolean => {
  if (!complexName) return true;
  if (!offer.complexes || offer.complexes.length === 0) return true;
  return offer.complexes.includes(complexName);
};

/**
 * Получает список доступных банков для ЖК
 */
export const getAvailableBanksForComplex = (
  complexName: string,
  apartmentType: string,
  housingPrices: HousingComplexPrice[],
): string[] | null => {
  if (!complexName || !apartmentType) return null;

  const complexData = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );

  return complexData?.banks || null;
};
