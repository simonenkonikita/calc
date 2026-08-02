// src/utils/mortgageSurcharges.ts

import { housingPrices } from "../data/complexPrice/complexPriceData";
import { PRICE_PER_SQUARE_METER_DEFAULT } from "../data/constants";

export const findPricePerSquareMeter = (
  complexName: string,
  apartmentType: string,
): number => {
  const found = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );
  return found?.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT;
};

/**
 * Получить наценку за ипотеку без ПВ для конкретного ЖК и типа квартиры
 */
export const getSurchargeWithoutDownPayment = (
  complexName: string,
  apartmentType: string,
): number => {
  const found = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );
  return found?.surcharges?.withoutDownPayment ?? 0;
};

/**
 * Получить наценку за ипотеку с частичным ПВ для конкретного ЖК и типа квартиры
 */
export const getSurchargePartialDownPayment = (
  complexName: string,
  apartmentType: string,
): number => {
  const found = housingPrices.find(
    (item) =>
      item.complexName === complexName && item.apartmentType === apartmentType,
  );
  return found?.surcharges?.partialDownPayment ?? 0;
};

// Получить наценку в зависимости от типа ипотеки
export const getMortgageSurcharge = (
  complexName: string,
  apartmentType: string,
  mortgageWithoutDownPayment: boolean,
  mortgagePartialDownPayment: boolean,
): number => {
  if (!complexName || !apartmentType) return 0;

  if (mortgageWithoutDownPayment) {
    return getSurchargeWithoutDownPayment(complexName, apartmentType);
  }

  if (mortgagePartialDownPayment) {
    return getSurchargePartialDownPayment(complexName, apartmentType);
  }

  return 0;
};
