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

  // Динамические ставки и субсидии (связи)
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
    isActive: boolean;
  }[];

  dynamicSubsidies: {
    id: string;
    minPVPercent: number | null;
    maxPVPercent: number | null;
    minAmount: number | null;
    maxAmount: number | null;
    minTerm: number | null;
    maxTerm: number | null;
    subsidyPercent: number;
    priority: number;
    description: string;
    roundingStrategy: string | null;
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
