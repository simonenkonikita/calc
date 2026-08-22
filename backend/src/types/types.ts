import { RefObject } from "react";
import { DynamicSubsidy } from "../entities/DynamicSubsidy";

// Расширенный тип для хранения оригинального индекса
export interface BankProgramResultWithIndex extends BankProgramResult {
  _originalIndex: number;
}

// ========== ПЕРЕМЕННЫЕ (ЛИМИТЫ) ==========
export interface Variables {
  familyMortgageLimit: number;
  maxFamilyMortgageSum: number;
  itMortgageLimit: number;
  maxItMortgageSum: number;
  deposit: number;
  minExcessAmounts?: {
    [bankName: string]: number;
  };
}

export interface ProgramInfo {
  type: string; // Тип программы: "family", "it", "base" и т.д.
  label: string; // Название: "Семейная ипотека"
  icon: string; // Иконка: "👨‍👩‍👧‍👦"
  color: string; // Цвет: "#8b5cf6"
  description: string; // Описание: "Для семей с детьми. Льготная ставка 6%"
  banks?: string[]; // Банки: ["Сбербанк", "Альфа-Банк"]
  offers?: BankOffer[]; // Все офферы по этой программе
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
  filtersRef?: RefObject<{
    selectedBankFilter: string;
    selectedProgramTypeFilter: string;
    selectedCards: Set<number>;
  }>; // ✅ полное определение
}

// ========== БАНКОВСКИЕ ПРОГРАММЫ (из JSON) ==========
export type ProgramType =
  | "base"
  | "full"
  | "short"
  | "family"
  | "it"
  | "tranche";

// ============================================================
// ТИП ДЛЯ СТАВОК
// ============================================================

/**
 * Правило для динамической ставки
 */
export interface DynamicRateRule {
  // 🔥 УСЛОВИЯ
  conditionMetadata?: {
    amountMin?: number;
    amountMax?: number;
    pvMin?: number;
    pvMax?: number;
    termMin?: number;
    termMax?: number;
  };
  // 🔥 ПОРОГОВАЯ ЛОГИКА (всегда доступна, даже без условий)
  tolerance?: number; // всегда в процентах, всегда up
  // Результат
  rate: number;
  description?: string;
  isActive?: boolean;
}

// ============================================================
// ТИП ДЛЯ СУБСИДИЙ
// ============================================================

/**
 * Правило для динамической субсидии
 */
export interface DynamicSubsidyRule {
  // 🔥 УСЛОВИЯ
  conditionMetadata?: {
    amountMin?: number;
    amountMax?: number;
    pvMin?: number;
    pvMax?: number;
    termMin?: number;
    termMax?: number;
  };
  // 🔥 ПОРОГОВАЯ ЛОГИКА (всегда доступна, даже без условий)
  tolerance?: number; // всегда в процентах, всегда up
  // Результат
  subsidyPercent: number;
  priority?: number;
  description?: string;
  isActive?: boolean;
}

export interface BankOffer {
  bank: string; // Название банка
  program: string; // Название программы
  type: ProgramType; // Тип программы
  subsidyPercent: number; // Субсидия (%)
  minPVPercent: number; // Минимальный ПВ (%)
  durationMonths?: number; // Для short программ
  isTwoContracts?: boolean; // Для Совкомбанка (2 договора)
  excessLimit?: boolean; // Сверхлимит
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
  complexes?: string[];
  minLoanTermYears?: number;
  description?: string;
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
  rate: number; // Ставка на период
  twoRate?: number;
  actualRate?: number;
  shortRate?: number;
  durationMonths?: number; // Длительность программы
  // Расчет ежемесячного платежа
  monthlyPayment: number; // Ежемесячный платёж
  // Основные параметры
  overstatement: number; // Завышение (сумма в договоре - стоимость объекта)
  contractAmount: number; // Сумма в договоре
  downPaymentAmount: number; // Сумма ПВ
  ownFunds: number; // Собственные средства
  clientContribution: number; // Вносим за клиента
  downPaymentPercent: number; // ПВ %
  minPVPercent: number; // Минимальный ПВ (%)
  excessLimit?: number; // Сверхлимит (если есть)
  mortgageAmount: number; // Ипотека
  subsidyAmount: number; // Сумма субсидии
  developerAccount: number; // На счет застройщика
  // Дополнительно для short программ
  monthlyPaymentAfter?: number; // Платёж после субсидирования
  remainingDebt?: number; // Остаток долга после субсидирования
  subsidyPercent: number;
  pricePerM2: number | null;
  // Флаги
  isLimitExceeded?: boolean;
  isTwoContracts?: boolean;
  // Для 2 договоров (Совкомбанк)
  firstContract?: number;
  secondContract?: number;
  totalMonthlyPayment?: number;
  // Платёж 2 договора
  firstContractPayment: number;
  secondContractPayment: number;
  firstContractAmount?: number; // Сумма по первому договору
  secondContractAmount?: number; // Сумма по второму договору
  secondContractSubsidyPercent?: number; // 🔥 НОВОЕ: субсидия по второму договору в %
  secondContractSubsidyAmount?: number; // 🔥 НОВОЕ: сумма субсидии по второму договору
  // ===== НОВЫЕ ПОЛЯ ДЛЯ ТРАНШЕВОЙ ИПОТЕКИ =====
  isTranche?: boolean;
  firstTrancheAmount?: number;
  secondTrancheAmount?: number;
  firstTranchePayment?: number;
  secondTranchePayment?: number;
  trancheSecondDate?: string; // ✅ ДОБАВИТЬ - дата выдачи второго транша
  monthsUntilSecondTranche?: number; // ✅ ДОБАВИТЬ - количество месяцев до второго транша
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
