// backend/src/utils/tranche/trancheDates.ts

import { Offer } from "../../entities/Offer";

// ============================================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================================

/**
 * Проверка доступности траншевой ипотеки для ЖК
 * Проверяет, есть ли в оферах дата второго транша для этого ЖК
 */
export const isTrancheAvailable = (
  offer: Offer,
  complexName: string,
): boolean => {
  // Проверяем, что офер траншевый и есть дата
  if (!offer.isTranche) {
    return false;
  }

  // Проверяем, что комплекс есть в списке комплексов офера
  if (!offer.complexes || !offer.complexes.includes(complexName)) {
    return false;
  }

  // Проверяем, что дата второго транша есть
  const date = offer.trancheSecondDate;
  return date !== undefined && date !== null && date !== "";
};

/**
 * Получение даты второго транша для ЖК из офера
 */
export const getTrancheSecondDate = (offer: Offer): string | null => {
  if (!offer.isTranche) {
    return null;
  }
  return offer.trancheSecondDate || null;
};

/**
 * Получение количества месяцев до выдачи второго транша
 */
export const getMonthsUntilTranche = (offer: Offer): number | null => {
  const secondDate = getTrancheSecondDate(offer);
  if (!secondDate) {
    return null;
  }

  const startDate = new Date().toISOString().split("T")[0];
  const months = calculateMonthsBetweenDates(startDate, secondDate);

  // Если дата уже прошла, возвращаем 0 (немедленная выдача)
  return Math.max(0, months);
};

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

/**
 * Расчет количества месяцев между двумя датами
 */
const calculateMonthsBetweenDates = (date1: string, date2: string): number => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.warn("⚠️ Некорректные даты:", { date1, date2 });
      return 0;
    }

    const yearsDiff = d2.getFullYear() - d1.getFullYear();
    const monthsDiff = d2.getMonth() - d1.getMonth();
    const daysDiff = d2.getDate() - d1.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    if (daysDiff < 0) {
      totalMonths -= 1;
    }

    return Math.max(0, totalMonths);
  } catch (error) {
    console.error("❌ Ошибка при расчете месяцев между датами:", error);
    return 0;
  }
};

/**
 * Получение текстового описания даты второго транша
 */
export const getTrancheDateDescription = (offer: Offer): string => {
  if (!offer.isTranche) {
    return "❌ Траншевая ипотека недоступна";
  }

  const date = getTrancheSecondDate(offer);
  if (!date) {
    return "📅 Дата не определена";
  }

  const months = getMonthsUntilTranche(offer);
  if (months === null) {
    return `📅 ${formatDate(date)}`;
  }

  if (months === 0) {
    return `📅 ${formatDate(date)} (выдача сейчас)`;
  }

  return `📅 ${formatDate(date)} (через ${months} ${declensionMonths(months)})`;
};

/**
 * Форматирование даты для отображения
 */
export const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Склонение слова "месяц" в зависимости от числа
 */
const declensionMonths = (n: number): string => {
  if (n % 10 === 1 && n % 100 !== 11) return "месяц";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "месяца";
  return "месяцев";
};

// ============================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ СО СПИСКАМИ ОФЕРОВ
// ============================================================

/**
 * Получить все траншевые оферы из списка
 */
export const getTrancheOffers = (offers: Offer[]): Offer[] => {
  return offers.filter((offer) => offer.isTranche === true);
};

/**
 * Получить оферы с траншевой ипотекой для конкретного ЖК
 */
export const getTrancheOffersByComplex = (
  offers: Offer[],
  complexName: string,
): Offer[] => {
  return offers.filter(
    (offer) =>
      offer.isTranche === true &&
      offer.complexes &&
      offer.complexes.includes(complexName),
  );
};

/**
 * Получение статуса транша для офера
 */
export const getTrancheStatus = (
  offer: Offer,
): {
  available: boolean;
  date: string | null;
  monthsUntil: number | null;
  isExpired: boolean;
} => {
  if (!offer.isTranche) {
    return {
      available: false,
      date: null,
      monthsUntil: null,
      isExpired: false,
    };
  }

  const date = getTrancheSecondDate(offer);
  const monthsUntil = getMonthsUntilTranche(offer);

  return {
    available: true,
    date,
    monthsUntil,
    isExpired: monthsUntil !== null && monthsUntil < 0,
  };
};

/**
 * Проверить, что траншевая ипотека доступна для офера и ЖК
 */
export const isTrancheAvailableForComplex = (
  offer: Offer,
  complexName: string,
): boolean => {
  if (!offer.isTranche) {
    return false;
  }
  if (!offer.complexes || !offer.complexes.includes(complexName)) {
    return false;
  }
  return !!offer.trancheSecondDate;
};
