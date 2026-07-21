// src/hooks/calculations/bankProgram/calculateBankProgram.tsx

import { BankOffer, Variables, BankProgramResult } from "../../../utils/types";
import { calculateClientContribution } from "./clientContribution/calculateClientContribution";
import { calculateContractAmount } from "./contractAmount/calculateContractAmount";
import { calculateMortgageAmount } from "./mortgageAmount/calculateMortgageAmount";
import { calculateOwnFunds } from "./ownFunds/calculateOwnFunds";
import { calculateDownPaymentAmount } from "./downPayment/сalculateDownPaymentAmount";

import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

import { calculateActualRate } from "./actualRate/calculateActualRate";
import { calculateSubsidyAmount } from "./subsidyAmount/calculateSubsidyAmount";
import { calculateExcessLimit } from "../../../utils/excessLimit/calculateExcessLimit";
import { calculateDownPaymentPercent } from "./downPaymentPercent/downPaymentPercent";
import { calculateDeveloperAccount } from "./developerAccount/calculateDeveloperAccount";
import { calculateAllMonthlyPayment } from "./payment/calculateAllMonthlyPayment";
import { calculateLoanTermMonths } from "../../../utils/loanTerm";
import { calculateOverstatement } from "./overstatement/overstatement";
import { calculatePricePerM2 } from "../../../utils/pricePerM2/pricePerM2";

export const calculateBankProgram = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  loanTermYears: number,
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  mortgagePartialDownPayment: boolean,
  area: number,
  complexName: string,
): BankProgramResult => {
  // ============================================================
  // 1. ФЛАГИ
  // ============================================================
  const isFamilyOrIt = bankOffer.type === "family" || bankOffer.type === "it";
  const isTwoContracts =
    bankOffer.type === "family" && bankOffer.isTwoContracts === true;
  const isTranche =
    bankOffer.type === "tranche" && bankOffer.isTranche === true;
  const isSpecialMortgageMode =
    mortgageWithoutDownPayment || mortgagePartialDownPayment;
  const isShortSubsidy =
    bankOffer.type === "short" && !!bankOffer.durationMonths;

  // ============================================================
  // 2. КОЭФФИЦИЕНТЫ (с динамической субсидией)
  // ============================================================
  const coefficients = calculateBankCoefficients({
    variables,
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    noSubsidyInflate,
    isSpecialMortgageMode,
    loanTermYears,
  });

  const actualSubsidyPercent = coefficients.subsidyPercent;

  // ============================================================
  // 3. СУММА В ДОГОВОРЕ
  // ============================================================
  const contractResult = calculateContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    coefficients,
  );

  const contractAmount = contractResult.contractAmount;

  // ============================================================
  // 4. ПЕРВОНАЧАЛЬНЫЙ ВЗНОС
  // ============================================================
  const downPaymentAmount = calculateDownPaymentAmount({
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
    coefficients,
  });

  // ============================================================
  // 5. СОБСТВЕННЫЕ СРЕДСТВА
  // ============================================================
  const ownFunds = calculateOwnFunds({
    objectCost,
    downPayment,
    remainingAmount,
    contractAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    coefficients,
    isFamilyOrIt,
  });

  // ============================================================
  // 6. ВНОСИМ ЗА КЛИЕНТА
  // ============================================================
  const clientContribution = calculateClientContribution({
    objectCost,
    downPaymentAmount,
    ownFunds,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    coefficients,
    isFamilyOrIt,
  });

  // ============================================================
  // 8. СУММА ИПОТЕКИ
  // ============================================================
  const mortgageAmountResult = calculateMortgageAmount({
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isFamilyOrIt,
    isSpecialMortgageMode,
    coefficients,
  });

  const { firstContractAmount, secondContractAmount, isLimitExceeded } =
    mortgageAmountResult;

  // ============================================================
  // 9. АКТУАЛЬНАЯ СТАВКА
  // ============================================================
  const actualRateResult = calculateActualRate({
    bankOffer,
    manualDownPayment,
    objectCost,
    userDownPaymentPercent,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    loanTermYears,
  });

  // ============================================================
  // 10. СУММА СУБСИДИИ
  // ============================================================
  const subsidyResult = calculateSubsidyAmount({
    bankOffer,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    secondContractAmount: mortgageAmountResult.secondContractAmount,
    isTwoContracts,
    actualSubsidyPercent,
    userDownPaymentPercent,
    loanTermYears,
  });

  let {
    subsidyAmount,
    secondContractSubsidyPercent,
    secondContractSubsidyAmount,
  } = subsidyResult;

  // ============================================================
  // 7. ПВ В ПРОЦЕНТАХ
  // ============================================================
  const downPaymentPercentCalc = calculateDownPaymentPercent(
    downPaymentAmount,
    contractAmount,
  );
  // ============================================================
  // 11. СВЕРХЛИМИТ
  // ============================================================
  const excessResult = calculateExcessLimit({
    bankOffer,
    variables,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    subsidyAmount,
    actualSubsidyPercent,
  });

  subsidyAmount = excessResult.subsidyAmount;
  const excessLimit = excessResult.excessLimit;

  // ============================================================
  // 12. НА СЧЕТ ЗАСТРОЙЩИКА
  // ============================================================
  const developerAccount = calculateDeveloperAccount({
    objectCost,
    ownFunds,
    downPayment,
    remainingAmount,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    subsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isSpecialMortgageMode,
    downPaymentAmount,
    noSubsidyInflate,
    coefficients,
    isFamilyOrIt,
  });

  // ============================================================
  // 13. ЦЕНА ЗА М²
  // ============================================================
  const pricePerM2 = calculatePricePerM2(developerAccount, area);

  // ============================================================
  // 14. СРОК ИПОТЕКИ
  // ============================================================
  const loanTermMonths = calculateLoanTermMonths(loanTermYears);

  // ============================================================
  // 15. ЕЖЕМЕСЯЧНЫЙ ПЛАТЕЖ
  // ============================================================
  const paymentResult = calculateAllMonthlyPayment({
    bankOffer,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    actualRate: actualRateResult,
    loanTermYears,
    complexName,
    isShortSubsidy,
    isTwoContracts,
    isTranche,
    firstTrancheAmount: mortgageAmountResult.firstTrancheAmount,
    secondTrancheAmount: mortgageAmountResult.secondTrancheAmount,
  });

  const {
    monthlyPayment,
    monthlyPaymentAfter,
    firstContractPayment,
    secondContractPayment,
    totalMonthlyPayment,
    trancheSchedule,
  } = paymentResult;

  // ============================================================
  // 16. СУММА ЗАВЫШЕНИЯ
  // ============================================================
  const overstatement = calculateOverstatement(contractAmount, objectCost);

  // ============================================================
  // 17. РЕЗУЛЬТАТ
  // ============================================================
  return {
    // Информация о банке и программе
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,

    // Ставки
    rate: actualRateResult,
    twoRate: bankOffer.twoRate,
    shortRate: bankOffer.shortRate,

    // Флаги
    isTwoContracts,
    isTranche,

    // Сроки
    subsidyPercent: isTwoContracts
      ? (secondContractSubsidyPercent ?? actualSubsidyPercent)
      : actualSubsidyPercent,
    durationMonths:
      bankOffer.type === "short" ? bankOffer.durationMonths : loanTermMonths,

    // Платежи
    monthlyPayment: Math.ceil(monthlyPayment),
    monthlyPaymentAfter: monthlyPaymentAfter
      ? Math.ceil(monthlyPaymentAfter)
      : undefined,
    firstContractPayment: Math.ceil(firstContractPayment),
    secondContractPayment: Math.ceil(secondContractPayment),
    totalMonthlyPayment: Math.ceil(totalMonthlyPayment),

    // Суммы
    overstatement: Math.ceil(overstatement),
    contractAmount: Math.ceil(contractAmount),
    downPaymentAmount: Math.ceil(downPaymentAmount),
    ownFunds: Math.ceil(ownFunds),
    clientContribution: Math.ceil(clientContribution),
    downPaymentPercent: Number(downPaymentPercentCalc.toFixed(1)),
    minPVPercent: bankOffer.minPVPercent,

    // Лимиты и субсидии
    excessLimit: excessLimit ? Math.ceil(excessLimit) : undefined,
    mortgageAmount: Math.ceil(mortgageAmountResult.mortgageAmount),
    subsidyAmount: Math.ceil(subsidyAmount),
    developerAccount: Math.ceil(developerAccount),
    pricePerM2: pricePerM2 !== null ? Math.ceil(pricePerM2) : null,

    // Статусы
    isLimitExceeded,
    firstContractAmount,
    secondContractAmount,

    // Субсидия по второму договору
    secondContractSubsidyPercent,
    secondContractSubsidyAmount: secondContractSubsidyAmount
      ? Math.ceil(secondContractSubsidyAmount)
      : undefined,

    // Траншевая ипотека
    firstTrancheAmount: mortgageAmountResult.firstTrancheAmount,
    secondTrancheAmount: mortgageAmountResult.secondTrancheAmount,
    firstTranchePayment: trancheSchedule.firstTranchePayment,
    secondTranchePayment: trancheSchedule.secondTranchePayment,
    trancheSecondDate: trancheSchedule.trancheSecondDate ?? undefined,
    monthsUntilSecondTranche:
      trancheSchedule.monthsUntilSecondTranche ?? undefined,
  };
};
