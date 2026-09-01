// Типы данных

// Расширенный тип для хранения оригинального индекса
export interface BankProgramResultWithIndex extends BankProgramResult {
  _originalIndex: number;
}

export interface ProgramInfo {
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  banks: string[];
  offers: BankOffer[];
}

// ========== ПЕРЕМЕННЫЕ (ЛИМИТЫ) ==========
export interface Variables {
  // Государственные лимиты
  familyMortgageLimit: number;
  maxFamilyMortgageLimit: number;
  itMortgageLimit: number;
  maxItMortgageLimit: number;

  // Границы для калькулятора
  minArea: number;
  maxArea: number;
  minDownPaymentPercent: number;
  maxDownPaymentPercent: number;
  minLoanTerm: number;
  maxLoanTerm: number;

  // Дополнительные настройки
  deposit: number;
  bankOrder: BankOrderItem[];
}

// ========== ЦЕНЫ НА ЖК ==========
export interface HousingComplexPrice {
  id: string;
  complexName: string;
  status: string;
  apartmentType: string;
  statusIcon: string;
  description?: string;
  pricePerSquareMeter: number;
  banks?: string[];
  surcharges?: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  paymentTerms: string[];
  promotions: string[];
  specialOffers?: string[];
  materialsLink?: string;
  eligiblePrograms?: ProgramInfo[];
}

export interface ApartmentType {
  type: string;
  pricePerSquareMeter: number;
  surcharges?: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
}

export interface ProjectInfo {
  id: string;
  name: string;
  status: string;
  statusIcon: string;
  description?: string;
  priceInfo: string;
  paymentTerms: string[];
  promotions: string[];
  banks: string[];
  specialOffers?: string[];
  materialsLink?: string;
  apartmentTypes: ApartmentType[];
  eligiblePrograms?: ProgramInfo[];
}

export interface RawProjectData {
  id: string;
  complexName: string;
  status: string;
  statusIcon: string;
  description?: string;
  priceInfo: string;
  paymentTerms: string[];
  promotions: string[];
  banks: string[];
  specialOffers?: string[];
  apartmentType: string;
  pricePerSquareMeter: number;
  surcharges?: {
    withoutDownPayment: number;
    partialDownPayment: number;
  };
  eligiblePrograms?: ProgramInfo[];
  materialsLink?: string;
}

// ========== ВХОДНЫЕ ПАРАМЕТРЫ КАЛЬКУЛЯТОРА ==========
export interface CalculatorFormData {
  // Параметры объекта
  complex: string; // ЖК/ГК
  apartmentType: string; // Тип квартиры
  area: number; // Площадь объекта
  manualObjectCost: number | null; // Стоимость объекта (в ручную)
  considerDepositInCost: boolean; // Учитывать бронь в стоимости
  // Параметры ипотеки
  downPaymentPercent: number; // Значение ПВ (%)
  manualDownPayment: number; // Ввести ПВ (часть ПВ) вручную
  loanTerm: number; // срок ипотеки
  // Другие параметры
  projectFinancingBank: string;
  noSubsidyInflate: boolean; // Не завышать на субсидию
  mortgageWithoutDownPayment: boolean; // Ипотека без ПВ
  mortgagePartialDownPayment: boolean; // Ипотека с частичным ПВ
}

// ========== РЕЗУЛЬТАТЫ РАСЧЕТА ОБЪЕКТА ==========
export interface ObjectCalculationResult {
  objectCost: number; // Стоимость объекта
  downPayment: number; // ПВ (рассчитанный)
  remainingAmount: number; // Сумма для расчета (objectCost - downPayment)
  pricePerSquareMeter: number; // Цена за м2 (из справочника)
  area: number;
}

export interface OfferBankSectionProps {
  bankResults: BankProgramResult[];
  onSelectOffer: (index: number) => void;
  formatMoney: (amount: number) => string;
  mortgageWithoutDownPayment?: boolean;
  mortgagePartialDownPayment?: boolean;
  loanTermYears: number;
  area: number;
  complexName: string;

  // 🔥 Фильтры
  selectedBankFilter: string;
  selectedProgramTypeFilter: string;
  showOverstatement: boolean;
  onBankFilterChange: (filter: string) => void;
  onProgramTypeFilterChange: (filter: string) => void;
  onToggleOverstatement: (value: boolean) => void;
  onResetFilters: () => void;
  filtersRef?: React.RefObject<{
    selectedBankFilter: string;
    selectedProgramTypeFilter: string;
    selectedCards: Set<number>;
    showOverstatement?: boolean;
  }>;
}

// ========== БАНКОВСКИЕ ПРОГРАММЫ (из JSON) ==========
export type ProgramType =
  | "base"
  | "full"
  | "short"
  | "family"
  | "it"
  | "tranche";

export interface DynamicRateRule {
  // Для простых условий (JSON-совместимые)
  type?: "pv" | "amount" | "term";
  condition?: "gte" | "lte" | "lt" | "gt" | "eq";
  value?: number;
  // Для сложных условий (функции)
  conditionFn?: (pv: number, amount: number, term: number) => boolean;
  rateFn?: (baseRate: number, pv: number, amount: number) => number;
  // Результат
  subsidyPercent?: number;
  rate?: number;
  priority?: number;
  description?: string;
  // 🔥 НОВЫЕ ПОЛЯ ДЛЯ ПОРОГОВОЙ ЛОГИКИ
  minAmount?: number;
  /** Максимальная сумма для диапазона (для пороговой логики) */
  maxAmount?: number;
  tolerance?: number;
  /** Коэффициент погрешности для этого правила (переопределяет глобальный) */
  toleranceType?: "fixed" | "percent";
  /** Стратегия округления для этого правила */
  roundingStrategy?: "up" | "down";
}

// 🔥 НОВЫЙ ТИП для простых динамических ставок (только ПВ -> ставка)
export interface SimpleDynamicRate {
  minPVPercent: number; // Минимальный ПВ для этой ставки
  rate: number; // Ставка при этом ПВ
  description?: string; // Описание условия
}

export interface BankOffer {
  bank: string; // Название банка
  program: string; // Название программы
  type: ProgramType; // Тип программы
  subsidyPercent: number; // Субсидия (%)
  minPVPercent: number; // Минимальный ПВ (%)
  durationMonths?: number; // Для short программ
  isTwoContracts?: boolean; // Для Совкомбанка (2 договора)
  isExcessLimit?: boolean; // Сверхлимит
  rate: number; // Процентная ставка (%)
  twoRate?: number;
  shortRate?: number; //
  subsidyCalculationMethod?: "onlyPercent" | "standard";
  dynamicRates?: DynamicRateRule[];
  dynamicSubsidies?: DynamicRateRule[];
  isTranche?: boolean;
  trancheFirstPercent?: number; // % от стоимости объекта для первого транша (например, 19.9%)
  trancheSecondDate?: string; // дата выдачи второго транша (например, "2027-02-01")
  /** Глобальный коэффициент погрешности (по умолчанию 100000) */
  thresholdTolerance?: number;
  thresholdToleranceType?: "fixed" | "percent";
  /** Глобальная стратегия округления (по умолчанию 'up') */
  roundingStrategy?: "up" | "down";
  complexes?: string[];
  minLoanTermYears?: number;
}

export interface TranchePaymentsResult {
  firstTranchePayment: number;
  secondTranchePayment: number;
  monthlyPayment: number;
  trancheSecondDate?: string | null;
  monthsUntilSecondTranche?: number;
}

// ========== РЕЗУЛЬТАТ РАСЧЕТА ПО ОДНОЙ ПРОГРАММЕ ==========
export interface BankProgramResult {
  bank: string;
  program: string;
  type: ProgramType;
  offerId?: string;
  rate: number;
  twoRate?: number;
  actualRate?: number;
  shortRate?: number;
  durationMonths?: number;

  // ✅ ЛИМИТЫ ОФЕРА (добавляем)
  minLoanAmount?: number; // Минимальная сумма кредита
  maxLoanAmount?: number; // Максимальная сумма кредита
  minLoanTerm?: number; // Минимальный срок (в годах)
  maxLoanTerm?: number; // Максимальный срок (в годах)

  // ✅ ДОБАВЛЯЕМ complexes
  complexes?: string[];
  area?: number;

  // Расчет ежемесячного платежа
  monthlyPayment: number;

  // Основные параметры
  overstatement: number;
  contractAmount: number;
  downPaymentAmount: number;
  ownFunds: number;
  clientContribution: number;
  downPaymentPercent: number;
  minPVPercent: number;
  excessLimitAmount?: number;
  mortgageAmount: number;
  subsidyAmount: number;
  developerAccount: number;

  // Дополнительно для short программ
  monthlyPaymentAfter?: number;
  remainingDebt?: number;
  subsidyPercent: number;
  pricePerM2: number | null;

  // Флаги
  isTwoContracts?: boolean;
  isExcessLimit?: boolean;
  isLimitExceeded?: boolean;

  // Для 2 договоров (Совкомбанк)
  firstContract?: number;
  secondContract?: number;
  totalMonthlyPayment?: number;
  firstContractPayment: number;
  secondContractPayment: number;
  firstContractAmount?: number;
  secondContractAmount?: number;
  secondContractSubsidyPercent?: number;
  secondContractSubsidyAmount?: number;

  // Для траншевой ипотеки
  isTranche?: boolean;
  firstTrancheAmount?: number;
  secondTrancheAmount?: number;
  firstTranchePayment?: number;
  secondTranchePayment?: number;
  trancheSecondDate?: string;
  monthsUntilSecondTranche?: number;
  minLoanTermYears?: number;
}

// ========== ПОЛНЫЙ РЕЗУЛЬТАТ КАЛЬКУЛЯТОРА ==========
export interface CalculatorResult {
  objectResult: {
    objectCost: number;
    downPayment: number;
    pricePerSquareMeter: number;
  };
  bankResults: BankProgramResult[];
}

export interface ContractAmountResult {
  contractAmount: number;
  subsidyAmount?: number;
  // Для 2 договоров
  firstContractAmount?: number;
  secondContractAmount?: number;
}

// ========== КОЭФФИЦИЕНТЫ БАНКОВ (для внутренних расчетов) ==========
export interface BankCoefficients {
  programName: string;
  downPaymentPercent: number; // Сумма ПВ (% от стоимости)
  mortgagePercent: number; // Сумма ипотеки (% от стоимости)
  kefDownPayment: number; // Кайф ПВ (ПВ / стоимость)
  subsidyPercent: number; // Сумма субсидии (%)
  creditFromSubsidyPercent: number; // Сумма кредита от субсидии (%)
  kefSubsidy: number; // Кайф субсидии
  mortgageCoefficient: number; // Каэф ипотеки
  overstatementCoefficient: number; // Каэф завышения
  requiredCoeffWithMinPV: number; // Искомый каэф с мин ПВ
  requiredCoeffWithLargePV: number; // Искомый каэф с большим ПВ
  requiredCoeffWithoutPV: number; // Искомый каэф без ПВ
  requiredCoeffFamilyTwo: number;
}

// Для динамических субсидий (как в Совкомбанке)
export interface DynamicSubsidyRule {
  minPVPercent: number; // Минимальный ПВ для применения
  subsidyPercent: number; // Субсидия при таком ПВ
}

export interface BankOfferWithDynamicSubsidy extends BankOffer {
  dynamicSubsidyRules?: DynamicSubsidyRule[]; // Например: ПВ > 30% → субсидия 12.5%
}

// ========== РЕЗУЛЬТАТ РАСЧЕТА СУБСИДИИ НА КОРОТКИЙ СРОК ==========
export interface SubsidyPaymentResult {
  monthlyPaymentSubsidy: number; // Платёж в период субсидирования
  monthlyPaymentAfter: number | null; // Платёж после субсидирования (если есть)
}

export interface MortgageAmountResult {
  mortgageAmount: number;
  firstTrancheAmount?: number;
  secondTrancheAmount?: number;
  firstContractAmount?: number;
  secondContractAmount?: number;
  isLimitExceeded?: boolean;
}
export interface DownAmountResult {
  downPaymentAmount: number;
  isNoSpecialMortgageMode: boolean;
}

export interface ThresholdAdjustmentResult {
  /** Скорректированная сумма кредита */
  adjustedAmount: number;
  /** Скорректированный ПВ */
  adjustedDownPayment: number;
  /** Итоговая сумма в договоре */
  contractAmount: number;
  /** Название диапазона */
  rangeName: string;
  /** Была ли применена корректировка */
  wasAdjusted: boolean;
  /** Причина корректировки */
  adjustmentReason?: string;
}

export interface ProgramConfig {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramCategory {
  key: string;
  label: string;
  type: string;
  icon: string;
  color: string;
  description: string;
  displayOrder: number;
}

export interface ProgramsResponse {
  success: boolean;
  data?: ProgramConfig[];
  error?: string;
}

export interface Limits {
  familyMortgageLimit: number;
  maxFamilyMortgageSum: number;
  itMortgageLimit: number;
  maxItMortgageSum: number;
  deposit: number;
  minExcessAmounts: Record<string, number>;
}

export interface BankOrderItem {
  name: string;
  displayOrder: number;
}

export interface ConfigData {
  id: string;
  familyMortgageLimit: number;
  maxFamilyMortgageLimit: number;
  itMortgageLimit: number;
  maxItMortgageLimit: number;
  minArea: number;
  maxArea: number;
  minDownPaymentPercent: number; // ✅ Добавляем правильное имя
  maxDownPaymentPercent: number;
  minLoanTerm: number;
  maxLoanTerm: number;
  deposit: number;
  bankOrder: BankOrderItem[];
  createdAt: string;
  updatedAt: string;
}
