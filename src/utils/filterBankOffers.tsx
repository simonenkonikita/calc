// src/utils/filterBankOffers.ts

import { BankOffer, HousingComplexPrice } from "./types";

interface FilterBankOffersParams {
  bankOffers: BankOffer[];
  complexName: string;
  apartmentType: string;
  housingPrices: HousingComplexPrice[];
}

export const filterBankOffersByComplex = (
  params: FilterBankOffersParams,
): BankOffer[] => {
  const { bankOffers, complexName, apartmentType, housingPrices } = params;

  // Если ЖК не выбран - возвращаем все предложения
  if (!complexName) {
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
      if (!offer.complexes.includes(complexName)) {
        return false;
      }
    }

    // 2. Проверка по банку: если у ЖК указан список банков
    if (availableBanks && availableBanks.length > 0) {
      if (!availableBanks.includes(offer.bank)) {
        return false;
      }
    }

    return true;
  });
};

// Функция для получения причины недоступности
export const getBankUnavailableReason = (
  bankName: string,
  complexName: string,
  apartmentType: string,
  housingPrices: HousingComplexPrice[],
  offerComplexes?: string[],
): { isAvailable: boolean; reason: string | null } => {
  if (!complexName) {
    return { isAvailable: true, reason: null };
  }

  const complexData = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );

  if (!complexData) {
    return { isAvailable: true, reason: null };
  }

  // Проверка по программе
  if (offerComplexes && offerComplexes.length > 0) {
    if (!offerComplexes.includes(complexName)) {
      return {
        isAvailable: false,
        reason: `Программа недоступна для ${complexName}`,
      };
    }
  }

  // Проверка по банку
  if (complexData.banks && complexData.banks.length > 0) {
    if (!complexData.banks.includes(bankName)) {
      return {
        isAvailable: false,
        reason: `Банк не аккредитован в ${complexName}`,
      };
    }
  }

  return { isAvailable: true, reason: null };
};

// Получение доступных банков для ЖК
export const getAvailableBanksForComplex = (
  complexName: string,
  apartmentType: string,
  housingPrices: HousingComplexPrice[],
): string[] | null => {
  const complexData = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );
  return complexData?.banks || null;
};
