// ============================================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================================

import {
  TRANCHE_SECOND_DATE_BY_COMPLEX,
  TRANCHE_UNAVAILABLE_COMPLEXES,
} from "../../data/complexPrice/complexPriceData";

// Проверка доступности траншевой ипотеки для ЖК
export const isTrancheAvailable = (complexName: string): boolean => {
  // Проверяем, что ЖК не в списке недоступных
  if (TRANCHE_UNAVAILABLE_COMPLEXES.includes(complexName)) {
    return false;
  }

  // Проверяем, что для ЖК есть дата
  const date = TRANCHE_SECOND_DATE_BY_COMPLEX[complexName];
  return date !== undefined && date !== null && date !== "";
};

// Получение даты второго транша для ЖК
export const getTrancheSecondDate = (complexName: string): string | null => {
  if (!isTrancheAvailable(complexName)) {
    return null;
  }
  return TRANCHE_SECOND_DATE_BY_COMPLEX[complexName] || null;
};

// Получение количества месяцев до выдачи второго транша
export const getMonthsUntilTranche = (complexName: string): number | null => {
  const secondDate = getTrancheSecondDate(complexName);
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

// Расчет количества месяцев между двумя датами
const calculateMonthsBetweenDates = (date1: string, date2: string): number => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Проверка на корректность дат
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      console.warn("⚠️ Некорректные даты:", { date1, date2 });
      return 0;
    }

    const yearsDiff = d2.getFullYear() - d1.getFullYear();
    const monthsDiff = d2.getMonth() - d1.getMonth();
    const daysDiff = d2.getDate() - d1.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    // Если день месяца меньше, чем день начала, месяц еще не полный
    if (daysDiff < 0) {
      totalMonths -= 1;
    }

    return Math.max(0, totalMonths);
  } catch (error) {
    console.error("❌ Ошибка при расчете месяцев между датами:", error);
    return 0;
  }
};

// Получение текстового описания даты второго транша
export const getTrancheDateDescription = (complexName: string): string => {
  if (!isTrancheAvailable(complexName)) {
    return "❌ Траншевая ипотека недоступна";
  }

  const date = getTrancheSecondDate(complexName);
  if (!date) {
    return "📅 Дата не определена";
  }

  const months = getMonthsUntilTranche(complexName);
  if (months === null) {
    return `📅 ${formatDate(date)}`;
  }

  if (months === 0) {
    return `📅 ${formatDate(date)} (выдача сейчас)`;
  }

  return `📅 ${formatDate(date)} (через ${months} ${declensionMonths(months)})`;
};

// Форматирование даты для отображения
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

// Склонение слова "месяц" в зависимости от числа
const declensionMonths = (n: number): string => {
  if (n % 10 === 1 && n % 100 !== 11) return "месяц";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "месяца";
  return "месяцев";
};

// ============================================================
// ФУНКЦИИ ДЛЯ ФИЛЬТРАЦИИ И ГРУППИРОВКИ
// ============================================================

// Получение списка всех ЖК с траншевой ипотекой
export const getTrancheAvailableComplexes = (): string[] => {
  return Object.keys(TRANCHE_SECOND_DATE_BY_COMPLEX).filter((name) =>
    isTrancheAvailable(name),
  );
};

export const getTrancheUnavailableComplexes = (): string[] => {
  return TRANCHE_UNAVAILABLE_COMPLEXES;
};

//Получение даты второго транша с проверкой на актуальность
export const getTrancheStatus = (
  complexName: string,
): {
  available: boolean;
  date: string | null;
  monthsUntil: number | null;
  isExpired: boolean;
} => {
  const available = isTrancheAvailable(complexName);

  if (!available) {
    return {
      available: false,
      date: null,
      monthsUntil: null,
      isExpired: false,
    };
  }

  const date = getTrancheSecondDate(complexName);
  const monthsUntil = getMonthsUntilTranche(complexName);

  return {
    available: true,
    date,
    monthsUntil,
    isExpired: monthsUntil !== null && monthsUntil < 0,
  };
};
