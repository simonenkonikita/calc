// src/hooks/calculations/bankProgram/calculateBankProgram.tsx

import {
  BankOffer,
  Variables,
  BankProgramResult,
  TranchePaymentsResult,
} from "../../../utils/types";
import { calculateClientContribution } from "./clientContribution/calculateClientContribution";
import { calculateContractAmount } from "./contractAmount/calculateContractAmount";
import { calculateMortgageAmount } from "./mortgageAmount/calculateMortgageAmount";
import { calculateOwnFunds } from "./ownFunds/calculateOwnFunds";
import { calculateDeveloperAccount } from "./developerAccount/calculateDeveloperAccount";
import { calculateDownPaymentAmount } from "./downPayment/сalculateDownPaymentAmount";
import { getDynamicRate } from "../сoefficients/getDynamicRate";
import { calculateMonthlyPayment } from "./payment/calculateMonthlyPayment";
import { calculateSubsidyPayments } from "./payment/subsidy/calculateSubsidyPayments";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateTwoContractsMonthlyPayment } from "./payment/family/calculateTwoContractsMonthlyPayment";
import { calculateTranchePayments } from "./payment/tranche/calculateTranchePayments";
import { getDynamicSubsidy } from "../сoefficients/getDynamicSubsidy";

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
  // 5. СОБСТВЕННЫЕ СРЕДСТВА
  // ============================================================
  let ownFunds: number;

  if (isFamilyOrIt) {
    ownFunds = calculateOwnFunds({
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
    });
  } else {
    ownFunds = isSpecialMortgageMode ? downPayment : downPaymentAmount;
  }

  // ============================================================
  // 6. ВНОСИМ ЗА КЛИЕНТА
  // ============================================================
  let clientContribution: number;

  if (isFamilyOrIt) {
    clientContribution = calculateClientContribution({
      objectCost,
      downPaymentAmount,
      ownFunds,
      userDownPaymentPercent,
      bankOffer,
      variables,
      mortgageWithoutDownPayment: isSpecialMortgageMode,
      coefficients,
    });
  } else {
    clientContribution = downPaymentAmount - ownFunds;
  }

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

  // 8.1 Для 2 договоров
  let firstContractAmount: number | undefined;
  let secondContractAmount: number | undefined;

  if (isTwoContracts) {
    firstContractAmount = Math.min(
      mortgageAmountResult.mortgageAmount,
      6000000,
    );
    secondContractAmount = Math.max(
      0,
      mortgageAmountResult.mortgageAmount - 6000000,
    );
  }

  const isLimitExceeded = mortgageAmountResult.isLimitExceeded;

  // ============================================================
  // 9. АКТУАЛЬНАЯ СТАВКА
  // ============================================================
  const pvForRate =
    manualDownPayment > 0 && objectCost > 0
      ? (manualDownPayment / objectCost) * 100
      : userDownPaymentPercent;

  const actualRate = getDynamicRate(
    bankOffer,
    pvForRate,
    mortgageAmountResult.mortgageAmount,
    loanTermYears,
  );

  // ============================================================
  // 10. СУММА СУБСИДИИ (ОСНОВНАЯ ЛОГИКА)
  // ============================================================
  let subsidyAmount: number;
  let secondContractSubsidyPercent: number | undefined;
  let secondContractSubsidyAmount: number | undefined;
  let finalContractAmount = contractAmount;
  let finalDownPaymentAmount = downPaymentAmount;

  if (isTwoContracts) {
    // 🔥 ДЛЯ ДВУХ ДОГОВОРОВ: субсидия считается от суммы ВТОРОГО договора
    const secondContract = secondContractAmount || 0;

    // Получаем субсидию для второго договора из динамических правил
    // Используем dynamicSubsidyPercent из банковского оффера
    if (
      bankOffer.dynamicSubsidyPercent &&
      bankOffer.dynamicSubsidyPercent.length > 0
    ) {
      secondContractSubsidyPercent = getDynamicSubsidy(
        bankOffer,
        userDownPaymentPercent,
        secondContract,
        loanTermYears,
      );
    } else {
      // Fallback: используем базовую субсидию
      secondContractSubsidyPercent = actualSubsidyPercent;
    }

    // Сумма субсидии по второму договору
    secondContractSubsidyAmount =
      secondContract * (secondContractSubsidyPercent / 100);
    subsidyAmount = secondContractSubsidyAmount;

    // 🔥 ПЕРЕСЧИТЫВАЕМ СУММУ В ДОГОВОРЕ
    // contractAmount = objectCost + subsidyAmount
    finalContractAmount = objectCost + subsidyAmount;

    // 🔥 ПЕРЕСЧИТЫВАЕМ ПВ
    // ПВ = contractAmount - 6 000 000 - secondContractAmount
    // Но также нужно учитывать минимальный ПВ
    const minPVAmount = finalContractAmount * (bankOffer.minPVPercent / 100);
    const calculatedDownPayment =
      finalContractAmount - 6000000 - secondContract;
    finalDownPaymentAmount = Math.max(minPVAmount, calculatedDownPayment);

    // Обновляем значения для дальнейших расчетов
    contractAmount = finalContractAmount;
    downPaymentAmount = finalDownPaymentAmount;

    // Обновляем mortgageAmount с новыми значениями
    // mortgageAmount = contractAmount - downPaymentAmount
    // Но для двух договоров mortgageAmount уже рассчитан выше

    // Пересчитываем firstContractAmount и secondContractAmount с новым contractAmount
    const newMortgageAmount = contractAmount - downPaymentAmount;
    firstContractAmount = Math.min(newMortgageAmount, 6000000);
    secondContractAmount = Math.max(0, newMortgageAmount - 6000000);

    // Обновляем mortgageAmountResult
    mortgageAmountResult.mortgageAmount = newMortgageAmount;
  } else {
    // Обычная логика для не-двухдоговорных программ
    subsidyAmount =
      mortgageAmountResult.mortgageAmount * (actualSubsidyPercent / 100);
  }

  // ============================================================
  // 7. ПВ В ПРОЦЕНТАХ
  // ============================================================
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // ============================================================
  // 11. СВЕРХЛИМИТ
  // ============================================================
  let excessLimit: number | undefined;

  if (bankOffer.excessLimit) {
    if (bankOffer.type === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit =
          mortgageAmountResult.mortgageAmount - variables.familyMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    } else if (bankOffer.type === "it") {
      const maxSubsidy =
        variables.itMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit =
          mortgageAmountResult.mortgageAmount - variables.itMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    }
  }

  // ============================================================
  // 12. НА СЧЕТ ЗАСТРОЙЩИКА
  // ============================================================
  let developerAccount: number;

  if (isFamilyOrIt) {
    developerAccount = calculateDeveloperAccount({
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
    });
  } else {
    if (isSpecialMortgageMode) {
      developerAccount =
        ownFunds + mortgageAmountResult.mortgageAmount - subsidyAmount;
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  }

  // ============================================================
  // 13. ЦЕНА ЗА М²
  // ============================================================
  let pricePerM2: number | null = null;
  if (area > 0) {
    pricePerM2 = developerAccount / area;
  }

  // ============================================================
  // 14. ЕЖЕМЕСЯЧНЫЙ ПЛАТЕЖ
  // ============================================================
  const loanTermMonths = loanTermYears * 12;
  const isShortSubsidy = bankOffer.type === "short" && bankOffer.durationMonths;
  const method = bankOffer.subsidyCalculationMethod || "standard";

  let monthlyPayment = 0;
  let monthlyPaymentAfter: number | null = null;
  let firstContractPayment = 0;
  let secondContractPayment = 0;
  let totalMonthlyPayment = 0;

  let trancheSchedule: TranchePaymentsResult = {
    firstTranchePayment: 0,
    secondTranchePayment: 0,
    monthlyPayment: 0,
  };

  if (isShortSubsidy && bankOffer.shortRate !== undefined) {
    const result = calculateSubsidyPayments(
      mortgageAmountResult.mortgageAmount,
      bankOffer.shortRate,
      actualRate,
      loanTermMonths,
      bankOffer.durationMonths || 12,
      method,
    );
    monthlyPayment = result.monthlyPaymentSubsidy;
    monthlyPaymentAfter = result.monthlyPaymentAfter;
  } else if (isTwoContracts && bankOffer.twoRate !== undefined) {
    // Для двух договоров используем ставку 6% на первый договор и twoRate на второй
    const result = calculateTwoContractsMonthlyPayment(
      mortgageAmountResult.mortgageAmount,
      bankOffer.twoRate,
      actualRate, // 6% для первого договора
      loanTermMonths,
    );
    firstContractPayment = result.firstContractPayment;
    secondContractPayment = result.secondContractPayment;
    totalMonthlyPayment = result.totalMonthlyPayment;
    monthlyPayment = totalMonthlyPayment;
  } else if (isTranche) {
    const trancheResult = calculateTranchePayments(
      actualRate,
      bankOffer,
      mortgageAmountResult.firstTrancheAmount || 0,
      mortgageAmountResult.secondTrancheAmount || 0,
      mortgageAmountResult.mortgageAmount,
      loanTermMonths,
      complexName,
    );
    firstContractPayment = trancheResult.firstTranchePayment;
    secondContractPayment = trancheResult.secondTranchePayment;
    monthlyPayment = trancheResult.monthlyPayment;
    totalMonthlyPayment = trancheResult.monthlyPayment;

    trancheSchedule = {
      firstTranchePayment: trancheResult.firstTranchePayment,
      secondTranchePayment: trancheResult.secondTranchePayment,
      monthlyPayment: trancheResult.monthlyPayment,
      monthsUntilSecondTranche: trancheResult.monthsUntilSecondTranche,
      trancheSecondDate: trancheResult.trancheSecondDate,
    };
  } else {
    monthlyPayment = calculateMonthlyPayment(
      mortgageAmountResult.mortgageAmount,
      actualRate,
      loanTermMonths,
    );
  }

  const overstatement = contractAmount - objectCost;

  // ============================================================
  // 15. РЕЗУЛЬТАТ
  // ============================================================
  return {
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,

    rate: actualRate,
    twoRate: bankOffer.twoRate,
    shortRate: bankOffer.shortRate,

    isTwoContracts,
    isTranche,

    subsidyPercent: isTwoContracts
      ? (secondContractSubsidyPercent ?? actualSubsidyPercent)
      : actualSubsidyPercent,

    durationMonths:
      bankOffer.type === "short" ? bankOffer.durationMonths : loanTermMonths,

    monthlyPayment: Math.ceil(monthlyPayment),
    monthlyPaymentAfter: monthlyPaymentAfter
      ? Math.ceil(monthlyPaymentAfter)
      : undefined,
    firstContractPayment: Math.ceil(firstContractPayment),
    secondContractPayment: Math.ceil(secondContractPayment),
    totalMonthlyPayment: Math.ceil(totalMonthlyPayment),

    overstatement: Math.ceil(overstatement),
    contractAmount: Math.ceil(contractAmount),
    downPaymentAmount: Math.ceil(downPaymentAmount),
    ownFunds: Math.ceil(ownFunds),
    clientContribution: Math.ceil(clientContribution),
    downPaymentPercent: Number(downPaymentPercentCalc.toFixed(1)),
    minPVPercent: bankOffer.minPVPercent,

    excessLimit: excessLimit ? Math.ceil(excessLimit) : undefined,
    mortgageAmount: Math.ceil(mortgageAmountResult.mortgageAmount),
    subsidyAmount: Math.ceil(subsidyAmount),
    developerAccount: Math.ceil(developerAccount),
    pricePerM2: pricePerM2 !== null ? Math.ceil(pricePerM2) : null,

    isLimitExceeded,
    firstContractAmount,
    secondContractAmount,

    // 🔥 НОВЫЕ ПОЛЯ ДЛЯ СУБСИДИИ ПО ВТОРОМУ ДОГОВОРУ
    secondContractSubsidyPercent,
    secondContractSubsidyAmount: secondContractSubsidyAmount
      ? Math.ceil(secondContractSubsidyAmount)
      : undefined,

    firstTrancheAmount: mortgageAmountResult.firstTrancheAmount,
    secondTrancheAmount: mortgageAmountResult.secondTrancheAmount,
    firstTranchePayment: trancheSchedule.firstTranchePayment,
    secondTranchePayment: trancheSchedule.secondTranchePayment,
    trancheSecondDate: trancheSchedule.trancheSecondDate ?? undefined,
    monthsUntilSecondTranche:
      trancheSchedule.monthsUntilSecondTranche ?? undefined,
  };
};
