// Типы данных

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
}

// ========== ЦЕНЫ НА ЖК ==========
export interface HousingComplexPrice {
  complexName: string;
  apartmentType: string;
  pricePerSquareMeter: number;
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
}

// ========== БАНКОВСКИЕ ПРОГРАММЫ (из JSON) ==========
export type ProgramType = "full" | "short" | "family" | "it";

export interface DynamicRateRule {
  // Для простых условий (JSON-совместимые)
  type?: "pv" | "amount" | "term";
  condition?: "gte" | "lte" | "lt" | "gt" | "eq";
  value?: number;

  // Для сложных условий (функции)
  conditionFn?: (pv: number, amount: number, term: number) => boolean;
  rateFn?: (baseRate: number, pv: number, amount: number) => number;

  // Результат
  rate?: number;
  priority?: number;
  description?: string;
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
  shortRate?: number; //
  subsidyCalculationMethod?: "onlyPercent" | "standard";
  dynamicRates?: DynamicRateRule[];
}

// ========== РЕЗУЛЬТАТ РАСЧЕТА ПО ОДНОЙ ПРОГРАММЕ ==========
export interface BankProgramResult {
  bank: string;
  program: string;
  type: ProgramType;
  rate: number; // Ставка на период
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
