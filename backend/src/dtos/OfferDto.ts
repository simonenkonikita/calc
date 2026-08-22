// backend/src/dtos/OfferDto.ts

// ============================================================
// DTO для динамических ставок (НОВАЯ СТРУКТУРА)
// ============================================================
export interface DynamicRateDTO {
  id?: string;
  conditionMetadata: {
    amountMin?: number;
    amountMax?: number;
    pvMin?: number;
    pvMax?: number;
    termMin?: number;
    termMax?: number;
  };
  rate: number;
  priority?: number;
  description?: string | null;
  isActive?: boolean;
}

// ============================================================
// DTO для динамических субсидий (НОВАЯ СТРУКТУРА)
// ============================================================
export interface DynamicSubsidyDTO {
  id?: string;
  conditionMetadata: {
    amountMin?: number;
    amountMax?: number;
    pvMin?: number;
    pvMax?: number;
    termMin?: number;
    termMax?: number;
  };
  tolerance?: number; // всегда в процентах
  subsidyPercent: number;
  priority?: number;
  description?: string | null;
  isActive?: boolean;
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

  // 🔥 Динамические ставки
  dynamicRates?: Omit<DynamicRateDTO, "id">[];

  // 🔥 Динамические субсидии
  dynamicSubsidies?: Omit<DynamicSubsidyDTO, "id">[];
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
    minPVPercent?: number;
    isActive?: boolean;
    displayOrder?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  programEntity: {
    id: string;
    type: string;
    label: string;
    icon: string;
    color: string;
    description: string;
    isActive?: boolean;
    displayOrder?: number;
    createdAt?: Date;
    updatedAt?: Date;
  };

  // 🔥 Динамические ставки (НОВАЯ СТРУКТУРА)
  dynamicRates: {
    id: string;
    conditionMetadata: {
      amountMin?: number;
      amountMax?: number;
      pvMin?: number;
      pvMax?: number;
      termMin?: number;
      termMax?: number;
    };
    rate: number;
    priority: number;
    description: string | null;
    isActive: boolean;
  }[];

  // 🔥 Динамические субсидии (НОВАЯ СТРУКТУРА)
  dynamicSubsidies: {
    id: string;
    conditionMetadata: {
      amountMin?: number;
      amountMax?: number;
      pvMin?: number;
      pvMax?: number;
      termMin?: number;
      termMax?: number;
    };
    tolerance: number;
    subsidyPercent: number;
    priority: number;
    description: string | null;
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

// ============================================================
// ⚠️ Устаревшие DTO (для обратной совместимости, можно удалить позже)
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

export interface SimpleDynamicRateDTO {
  minPVPercent: number;
  rate: number;
  description?: string;
}
