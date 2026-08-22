// src/utils/mortgageSurcharges.ts

import { AppDataSource } from "../data-source";
import { ApartmentType } from "../entities/ApartmentType";
import { Complex } from "../entities/Complex";
import { PRICE_PER_SQUARE_METER_DEFAULT } from "../data/constants";

/**
 * Найти цену за квадратный метр для ЖК и типа квартиры из БД
 */
export const findPricePerSquareMeter = async (
  complexName: string,
  apartmentType: string,
): Promise<number> => {
  try {
    const complexRepository = AppDataSource.getRepository(Complex);
    const complex = await complexRepository.findOne({
      where: { name: complexName },
      relations: ["apartmentTypes"],
    });

    if (!complex || !complex.apartmentTypes) {
      return PRICE_PER_SQUARE_METER_DEFAULT;
    }

    const found = complex.apartmentTypes.find(
      (at) => at.type === apartmentType,
    );

    return found?.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT;
  } catch (error) {
    console.error("Error finding price per square meter:", error);
    return PRICE_PER_SQUARE_METER_DEFAULT;
  }
};

/**
 * Получить наценку за ипотеку без ПВ для конкретного ЖК и типа квартиры из БД
 */
export const getSurchargeWithoutDownPayment = async (
  complexName: string,
  apartmentType: string,
): Promise<number> => {
  try {
    const complexRepository = AppDataSource.getRepository(Complex);
    const complex = await complexRepository.findOne({
      where: { name: complexName },
      relations: ["apartmentTypes"],
    });

    if (!complex || !complex.apartmentTypes) {
      return 0;
    }

    const found = complex.apartmentTypes.find(
      (at) => at.type === apartmentType,
    );

    return found?.surcharges?.withoutDownPayment ?? 0;
  } catch (error) {
    console.error("Error getting surcharge without down payment:", error);
    return 0;
  }
};

/**
 * Получить наценку за ипотеку с частичным ПВ для конкретного ЖК и типа квартиры из БД
 */
export const getSurchargePartialDownPayment = async (
  complexName: string,
  apartmentType: string,
): Promise<number> => {
  try {
    const complexRepository = AppDataSource.getRepository(Complex);
    const complex = await complexRepository.findOne({
      where: { name: complexName },
      relations: ["apartmentTypes"],
    });

    if (!complex || !complex.apartmentTypes) {
      return 0;
    }

    const found = complex.apartmentTypes.find(
      (at) => at.type === apartmentType,
    );

    return found?.surcharges?.partialDownPayment ?? 0;
  } catch (error) {
    console.error("Error getting surcharge partial down payment:", error);
    return 0;
  }
};

/**
 * Получить наценку в зависимости от типа ипотеки из БД
 */
export const getMortgageSurcharge = async (
  complexName: string,
  apartmentType: string,
  mortgageWithoutDownPayment: boolean,
  mortgagePartialDownPayment: boolean,
): Promise<number> => {
  if (!complexName || !apartmentType) return 0;

  if (mortgageWithoutDownPayment) {
    return await getSurchargeWithoutDownPayment(complexName, apartmentType);
  }

  if (mortgagePartialDownPayment) {
    return await getSurchargePartialDownPayment(complexName, apartmentType);
  }

  return 0;
};

/**
 * Получить полную информацию о цене для ЖК и типа квартиры из БД
 */
export const getPriceInfo = async (
  complexName: string,
  apartmentType: string,
): Promise<{
  pricePerSquareMeter: number;
  surcharges: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
} | null> => {
  try {
    const complexRepository = AppDataSource.getRepository(Complex);
    const complex = await complexRepository.findOne({
      where: { name: complexName },
      relations: ["apartmentTypes"],
    });

    if (!complex || !complex.apartmentTypes) {
      return null;
    }

    const found = complex.apartmentTypes.find(
      (at) => at.type === apartmentType,
    );

    if (!found) {
      return null;
    }

    return {
      pricePerSquareMeter:
        found.pricePerSquareMeter || PRICE_PER_SQUARE_METER_DEFAULT,
      surcharges: {
        withoutDownPayment: found.surcharges?.withoutDownPayment ?? 0,
        partialDownPayment: found.surcharges?.partialDownPayment ?? 0,
      },
    };
  } catch (error) {
    console.error("Error getting price info:", error);
    return null;
  }
};
