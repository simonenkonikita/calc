// src/hooks/calculations/bankProgram/calculateBankProgram.tsx

import { BankOffer, BankProgramResult, Variables } from "../../../types/types";
import { calculateExcessLimit } from "../../../utils/excessLimit/calculateExcessLimit";
import { calculateLoanTermMonths } from "../../../utils/loanTerm";
import { calculatePricePerM2 } from "../../../utils/pricePerM2/pricePerM2";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateActualRate } from "./actualRate/calculateActualRate";
import { calculateClientContribution } from "./clientContribution/calculateClientContribution";
import { calculateContractAmount } from "./contractAmount/calculateContractAmount";
import { adjustTwoContracts } from "./contractAmount/family/adjustTwoContracts";
import { calculateDeveloperAccount } from "./developerAccount/calculateDeveloperAccount";
import { calculateDownPaymentAmount } from "./downPayment/сalculateDownPaymentAmount";
import { calculateDownPaymentPercent } from "./downPaymentPercent/downPaymentPercent";
import { calculateMortgageAmount } from "./mortgageAmount/calculateMortgageAmount";
import { calculateOverstatement } from "./overstatement/overstatement";
import { calculateOwnFunds } from "./ownFunds/calculateOwnFunds";
import { calculateAllMonthlyPayment } from "./payment/calculateAllMonthlyPayment";
import { calculateSubsidyAmount } from "./subsidyAmount/calculateSubsidyAmount";

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
  // 2. КОЭФФИЦИЕНТЫ
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

  let contractAmount = contractResult.contractAmount;

  // ============================================================
  // 4. ПЕРВОНАЧАЛЬНЫЙ ВЗНОС
  // ============================================================
  let downPaymentAmount = calculateDownPaymentAmount({
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
  // 5. СУММА ИПОТЕКИ
  // ============================================================
  let mortgageAmountResult = calculateMortgageAmount({
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

  let { firstContractAmount, secondContractAmount, isLimitExceeded } =
    mortgageAmountResult;

  // ============================================================
  // 6. РАСЧЕТ СУБСИДИИ
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
  // 7. КОРРЕКТИРОВКА ДЛЯ ДВУХ ДОГОВОРОВ
  // ============================================================
  if (isTwoContracts) {
    // Временно рассчитываем собственные средства для корректировки
    const tempOwnFunds = calculateOwnFunds({
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

    const adjustmentResult = adjustTwoContracts({
      bankOffer,
      objectCost,
      ownFunds: tempOwnFunds,
      mortgageAmount: mortgageAmountResult.mortgageAmount,
      secondContractAmount: secondContractAmount || 0,
      variables,
      isSpecialMortgageMode,
      isFamilyOrIt,
      actualSubsidyPercent,
      userDownPaymentPercent,
      loanTermYears,
      noSubsidyInflate,
      minPVPercent: bankOffer.minPVPercent,
    });

    // Применяем скорректированные значения
    contractAmount = adjustmentResult.adjustedContractAmount;
    downPaymentAmount = adjustmentResult.adjustedDownPaymentAmount;
    mortgageAmountResult = {
      ...mortgageAmountResult,
      mortgageAmount: adjustmentResult.adjustedMortgageAmount,
    };
    firstContractAmount = adjustmentResult.adjustedFirstContractAmount;
    secondContractAmount = adjustmentResult.adjustedSecondContractAmount;
    // Обновляем субсидию (могла измениться)
    subsidyAmount = adjustmentResult.subsidyAmount;
    secondContractSubsidyPercent =
      adjustmentResult.secondContractSubsidyPercent;
    secondContractSubsidyAmount = adjustmentResult.secondContractSubsidyAmount;
  }

  // ============================================================
  // 8. СОБСТВЕННЫЕ СРЕДСТВА (ФИНАЛЬНЫЙ РАСЧЕТ)
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
  // 9. ВНОСИМ ЗА КЛИЕНТА
  // ============================================================
  const clientContribution = calculateClientContribution({
    objectCost,
    downPayment,
    remainingAmount,
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
  // 10. АКТУАЛЬНАЯ СТАВКА
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
  // 11. ПВ В ПРОЦЕНТАХ
  // ============================================================
  const downPaymentPercentCalc = calculateDownPaymentPercent(
    downPaymentAmount,
    contractAmount,
  );

  // ============================================================
  // 12. СВЕРХЛИМИТ
  // ============================================================
  const excessResult = calculateExcessLimit({
    bankOffer,
    variables,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    subsidyAmount,
    actualSubsidyPercent,
  });

  const finalSubsidyAmount = excessResult.subsidyAmount;
  const excessLimit = excessResult.excessLimit;

  // ============================================================
  // 13. НА СЧЕТ ЗАСТРОЙЩИКА
  // ============================================================
  const developerAccount = calculateDeveloperAccount({
    objectCost,
    ownFunds,
    downPayment,
    remainingAmount,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    subsidyAmount: finalSubsidyAmount,
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
  // 14. ЦЕНА ЗА М²
  // ============================================================
  const pricePerM2 = calculatePricePerM2(developerAccount, area);

  // ============================================================
  // 15. СРОК ИПОТЕКИ
  // ============================================================
  const loanTermMonths = calculateLoanTermMonths(loanTermYears);

  // ============================================================
  // 16. ЕЖЕМЕСЯЧНЫЙ ПЛАТЕЖ
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
  // 17. СУММА ЗАВЫШЕНИЯ
  // ============================================================
  const overstatement = calculateOverstatement(contractAmount, objectCost);

  // ============================================================
  // 18. РЕЗУЛЬТАТ
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
    minLoanTermYears: bankOffer.minLoanTermYears,

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
    subsidyAmount: Math.ceil(finalSubsidyAmount),
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
