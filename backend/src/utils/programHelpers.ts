// backend/src/utils/programHelpers.ts

import { Offer } from "../entities/Offer";
import { BankOffer, ProgramInfo } from "../types/types";

/**
 * Получить все банки из офферов
 */
const getUniqueBanks = (offers: Offer[]): string[] => {
  const banks = new Set<string>();
  for (const offer of offers) {
    if (offer.bank && offer.bank.name) {
      banks.add(offer.bank.name);
    }
  }
  return Array.from(banks).sort();
};

/**
 * Получить программы для конкретного ЖК
 */
export const getProgramsForComplex = (
  offers: Offer[],
  complexName?: string,
): ProgramInfo[] => {
  // Фильтруем офферы по ЖК
  const filteredOffers = complexName
    ? offers.filter((offer) => {
        if (!offer.complexes || offer.complexes.length === 0) {
          return true;
        }
        return offer.complexes.includes(complexName);
      })
    : offers;

  // Группируем по типу программы
  const programMap = new Map<string, Offer[]>();

  for (const offer of filteredOffers) {
    const type = offer.programEntity?.type || "unknown";
    if (!programMap.has(type)) {
      programMap.set(type, []);
    }
    programMap.get(type)!.push(offer);
  }

  // Преобразуем в ProgramInfo[]
  const result: ProgramInfo[] = [];

  for (const [type, typeOffers] of programMap) {
    const firstOffer = typeOffers[0];
    const programEntity = firstOffer?.programEntity;
    const banks = getUniqueBanks(typeOffers);

    result.push({
      type: type,
      label: programEntity?.label || type,
      icon: programEntity?.icon || "📋",
      color: programEntity?.color || "#6b7280",
      description: programEntity?.description || "",
      banks: banks,
      offers: typeOffers.map((offer) => ({
        bank: offer.bank?.name || "Неизвестный банк",
        program: offer.program,
        type: type as any,
        rate: offer.rate,
        twoRate: offer.twoRate,
        shortRate: offer.shortRate,
        subsidyPercent: offer.subsidyPercent,
        minPVPercent: offer.minPVPercent,
        durationMonths: offer.durationMonths,
        isTwoContracts: offer.isTwoContracts,
        excessLimit: offer.excessLimit,
        isTranche: offer.isTranche,
        trancheFirstPercent: offer.trancheFirstPercent,
        trancheSecondDate: offer.trancheSecondDate,
        subsidyCalculationMethod: offer.subsidyCalculationMethod,
        dynamicRates: offer.dynamicRates?.map((rate) => ({
          id: rate.id,
          conditionType: rate.conditionType,
          condition: rate.condition,
          value: rate.value,
          minValue: rate.minValue,
          maxValue: rate.maxValue,
          rate: rate.rate,
          priority: rate.priority,
          description: rate.description,
          isActive: rate.isActive,
          conditionMetadata: rate.conditionMetadata,
        })),
        dynamicSubsidies: offer.dynamicSubsidies?.map((subsidy) => ({
          id: subsidy.id,
          minPVPercent: subsidy.minPVPercent,
          maxPVPercent: subsidy.maxPVPercent,
          minAmount: subsidy.minAmount,
          maxAmount: subsidy.maxAmount,
          minTerm: subsidy.minTerm,
          maxTerm: subsidy.maxTerm,
          subsidyPercent: subsidy.subsidyPercent,
          priority: subsidy.priority,
          description: subsidy.description,
          roundingStrategy: subsidy.roundingStrategy,
          conditionMetadata: subsidy.conditionMetadata,
          isActive: subsidy.isActive,
        })),
        thresholdTolerance: offer.thresholdTolerance,
        thresholdToleranceType: offer.thresholdToleranceType,
        roundingStrategy: offer.roundingStrategy,
        complexes: offer.complexes,
        minLoanTermYears: offer.minLoanTermYears,
        description: offer.description,
        isActive: offer.isActive,
      })),
    });
  }

  return result;
};

/**
 * Получить офферы для конкретной программы
 */
export const getOffersByProgramType = (
  offers: Offer[],
  programType: string,
): Offer[] => {
  return offers.filter((offer) => offer.programEntity?.type === programType);
};

/**
 * Получить уникальные типы программ
 */
export const getUniqueProgramTypes = (offers: Offer[]): string[] => {
  const types = new Set<string>();
  for (const offer of offers) {
    if (offer.programEntity?.type) {
      types.add(offer.programEntity.type);
    }
  }
  return Array.from(types).sort();
};

/**
 * Получить банки для конкретной программы
 */
export const getBanksByProgramType = (
  offers: Offer[],
  programType: string,
): string[] => {
  const filteredOffers = offers.filter(
    (offer) => offer.programEntity?.type === programType,
  );
  return getUniqueBanks(filteredOffers);
};

/**
 * Проверить, доступна ли программа для ЖК
 */
export const isProgramAvailableForComplex = (
  offer: Offer,
  complexName: string,
): boolean => {
  if (!offer.complexes || offer.complexes.length === 0) {
    return true;
  }
  return offer.complexes.includes(complexName);
};
