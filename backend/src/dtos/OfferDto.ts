// backend/src/dtos/OfferDto.ts

// ============================================================
// DTO для динамических ставок (JSON-совместимые)
// ============================================================
export interface DynamicRateRuleDTO {
  type?: "pv" | "amount" | "term";
  condition?: "gte" | "lte" | "lt" | "gt" | "eq";
  value?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  rate?: number | null;
  subsidyPercent?: number | null;
  priority?: number;
  description?: string;
  tolerance?: number | null;
  toleranceType?: "fixed" | "percent" | null;
  roundingStrategy?: "up" | "down" | null;
}

// ============================================================
// DTO для простых динамических ставок
// ============================================================
export interface SimpleDynamicRateDTO {
  minPVPercent: number;
  rate: number;
  description?: string;
}

// ============================================================
// 🔥 НОВЫЙ DTO ДЛЯ ДИНАМИЧЕСКИХ СУБСИДИЙ (единый с DynamicRate)
// ============================================================
export interface DynamicSubsidyDTO {
  id?: string;
  conditionType: string; // "pv" | "amount" | "term"
  condition: string; // "gte" | "lte" | "between" | "lt" | "gt" | "eq"
  value: number | null;
  minValue: number | null;
  maxValue: number | null;
  rate: number; // ← было subsidyPercent
  priority: number;
  description: string | null;
  conditionMetadata: any;
  isActive: boolean;
}

// ============================================================
// DTO для создания/обновления оффера
// ============================================================
export interface CreateOfferDTO {
  // Основные поля
  program: string;
  rate: number;
  twoRate?: number | null;
  shortRate?: number | null;
  subsidyPercent?: number;
  minPVPercent: number;
  durationMonths?: number | null;

  // Флаги
  isTwoContracts?: boolean;
  excessLimit?: boolean;
  isTranche?: boolean;

  // Траншевая ипотека
  trancheFirstPercent?: number | null;
  trancheSecondDate?: string | null;

  // ЖК
  complexes?: string[] | null;

  // Связи
  bankId: string;
  programId: string;

  // Расчеты
  subsidyCalculationMethod?: string | null;

  // Настройки
  thresholdTolerance?: number | null;
  thresholdToleranceType?: string | null;
  roundingStrategy?: string | null;
  minLoanTermYears?: number | null;
  description?: string | null;
}

export interface UpdateOfferDTO extends Partial<CreateOfferDTO> {
  id: string;
}

// ============================================================
// DTO для ответа с оффером (расширенный)
// ============================================================
export interface OfferResponseDTO {
  id: string;
  program: string;
  rate: number;
  twoRate: number | null;
  shortRate: number | null;
  subsidyPercent: number;
  minPVPercent: number;
  durationMonths: number | null;
  isTwoContracts: boolean;
  excessLimit: boolean;
  isTranche: boolean;
  trancheFirstPercent: number | null;
  trancheSecondDate: string | null;
  complexes: string[] | null;
  subsidyCalculationMethod: string | null;
  thresholdTolerance: number | null;
  thresholdToleranceType: string | null;
  roundingStrategy: string | null;
  minLoanTermYears: number | null;
  description: string | null;
  isActive: boolean;

  // Связи
  bankId: string;
  programId: string;

  // Расширенные данные для отображения
  bank: {
    id: string;
    name: string;
    slug: string;
    baseRate: number;
  };
  programEntity: {
    id: string;
    type: string;
    label: string;
    icon: string;
    color: string;
    description: string;
  };

  // Динамические ставки (единая структура)
  dynamicRates: {
    id: string;
    conditionType: string;
    condition: string;
    value: number | null;
    minValue: number | null;
    maxValue: number | null;
    rate: number;
    priority: number;
    description: string;
    conditionMetadata: any;
    isActive: boolean;
  }[];

  // 🔥 Динамические субсидии (ТА ЖЕ СТРУКТУРА, ЧТО И У СТАВОК!)
  dynamicSubsidies: {
    id: string;
    conditionType: string; // ← было minPVPercent
    condition: string; // ← было maxPVPercent
    value: number | null; // ← было minAmount
    minValue: number | null; // ← было maxAmount
    maxValue: number | null; // ← было minTerm
    rate: number; // ← было subsidyPercent
    priority: number;
    description: string;
    conditionMetadata: any;
    isActive: boolean;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// DTO для списка офферов (краткий)
// ============================================================
export interface OfferListDTO {
  id: string;
  program: string;
  rate: number;
  twoRate: number | null;
  shortRate: number | null;
  subsidyPercent: number;
  minPVPercent: number;
  durationMonths: number | null;
  isTwoContracts: boolean;
  excessLimit: boolean;
  isTranche: boolean;
  complexes: string[] | null;
  isActive: boolean;
  bank: {
    id: string;
    name: string;
    slug: string;
  };
  programEntity: {
    id: string;
    type: string;
    label: string;
    icon: string;
    color: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// DTO для фильтрации офферов
// ============================================================
export interface OfferFiltersDTO {
  bankId?: string;
  programId?: string;
  programType?: string;
  complexName?: string;
  isActive?: boolean;
  minRate?: number;
  maxRate?: number;
  minPVPercent?: number;
  maxPVPercent?: number;
  search?: string;
}
