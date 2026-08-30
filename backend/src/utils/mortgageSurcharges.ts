// src/utils/mortgageSurcharges.ts

import { AppDataSource } from "../data-source";
import { ApartmentType } from "../entities/ApartmentType";
import { Complex } from "../entities/Complex";

/**
 * Найти цену за квадратный метр для ЖК и типа квартиры из БД
 * @throws Error если данные не найдены
 */
export const findPricePerSquareMeter = async (
  complexName: string,
  apartmentType: string,
): Promise<number> => {
  const complexRepository = AppDataSource.getRepository(Complex);
  const complex = await complexRepository.findOne({
    where: { name: complexName },
    relations: ["apartmentTypes"],
  });

  if (!complex || !complex.apartmentTypes) {
    throw new Error(`Complex "${complexName}" not found`);
  }

  const found = complex.apartmentTypes.find((at) => at.type === apartmentType);

  if (!found || !found.pricePerSquareMeter) {
    throw new Error(
      `Apartment type "${apartmentType}" not found for complex "${complexName}"`,
    );
  }

  return found.pricePerSquareMeter;
};

/**
 * Получить наценку за ипотеку без ПВ для конкретного ЖК и типа квартиры из БД
 */
export const getSurchargeWithoutDownPayment = async (
  complexName: string,
  apartmentType: string,
): Promise<number> => {
  const complexRepository = AppDataSource.getRepository(Complex);
  const complex = await complexRepository.findOne({
    where: { name: complexName },
    relations: ["apartmentTypes"],
  });

  if (!complex || !complex.apartmentTypes) {
    return 0;
  }

  const found = complex.apartmentTypes.find((at) => at.type === apartmentType);

  return found?.surcharges?.withoutDownPayment ?? 0;
};

/**
 * Получить наценку за ипотеку с частичным ПВ для конкретного ЖК и типа квартиры из БД
 */
export const getSurchargePartialDownPayment = async (
  complexName: string,
  apartmentType: string,
): Promise<number> => {
  const complexRepository = AppDataSource.getRepository(Complex);
  const complex = await complexRepository.findOne({
    where: { name: complexName },
    relations: ["apartmentTypes"],
  });

  if (!complex || !complex.apartmentTypes) {
    return 0;
  }

  const found = complex.apartmentTypes.find((at) => at.type === apartmentType);

  return found?.surcharges?.partialDownPayment ?? 0;
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
 * @throws Error если данные не найдены
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
}> => {
  const complexRepository = AppDataSource.getRepository(Complex);
  const complex = await complexRepository.findOne({
    where: { name: complexName },
    relations: ["apartmentTypes"],
  });

  if (!complex || !complex.apartmentTypes) {
    throw new Error(`Complex "${complexName}" not found`);
  }

  const found = complex.apartmentTypes.find((at) => at.type === apartmentType);

  if (!found || !found.pricePerSquareMeter) {
    throw new Error(
      `Apartment type "${apartmentType}" not found for complex "${complexName}"`,
    );
  }

  return {
    pricePerSquareMeter: found.pricePerSquareMeter,
    surcharges: {
      withoutDownPayment: found.surcharges?.withoutDownPayment ?? 0,
      partialDownPayment: found.surcharges?.partialDownPayment ?? 0,
    },
  };
};
