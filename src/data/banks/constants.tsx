// src/config/banks/constants.ts

// Базовые ставки
export const BASE_RATES = {
  SBER: 20.7,
  ALFA: 17.99,
  SOVKOM: 19.99,
  VTB: 19.9,
  URALSIB: 18.19,
  DOMRF: 17.3,
} as const;

// Минимальный ПВ
export const MIN_PV_PERCENT = 20.1;

// Лимиты
export const LIMITS = {
  FAMILY: 6000000,
  FAMILY_MAX: 15000000,
  IT: 9000000,
  IT_MAX: 18000000,
} as const;
