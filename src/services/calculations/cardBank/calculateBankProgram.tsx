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

  const contractAmount = contractResult.contractAmount;
  const overstatement = contractAmount - objectCost;

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
  // 7. ПВ В ПРОЦЕНТАХ
  // ============================================================
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // ============================================================
  // 8. СУММА ИПОТЕКИ
  // ============================================================
  const mortgageAmount = calculateMortgageAmount({
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
  const firstContractAmount = isTwoContracts
    ? Math.min(mortgageAmount.mortgageAmount, 6000000)
    : undefined;

  const secondContractAmount = isTwoContracts
    ? Math.max(0, mortgageAmount.mortgageAmount - 6000000)
    : undefined;

  const isLimitExceeded = mortgageAmount.isLimitExceeded;

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
    mortgageAmount.mortgageAmount,
    loanTermYears,
  );

  // ============================================================
  // 10. СУММА СУБСИДИИ
  // ============================================================
  let subsidyAmount: number;

  if (isTwoContracts) {
    const secondContract = secondContractAmount || 0;
    subsidyAmount = secondContract * (actualSubsidyPercent / 100);
  } else {
    subsidyAmount =
      mortgageAmount.mortgageAmount * (actualSubsidyPercent / 100);
  }

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
          mortgageAmount.mortgageAmount - variables.familyMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    } else if (bankOffer.type === "it") {
      const maxSubsidy =
        variables.itMortgageLimit * (actualSubsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount.mortgageAmount - variables.itMortgageLimit;
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
      mortgageAmount: mortgageAmount.mortgageAmount,
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
        ownFunds + mortgageAmount.mortgageAmount - subsidyAmount;
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
      mortgageAmount.mortgageAmount,
      bankOffer.shortRate,
      actualRate,
      loanTermMonths,
      bankOffer.durationMonths || 12,
      method,
    );
    monthlyPayment = result.monthlyPaymentSubsidy;
    monthlyPaymentAfter = result.monthlyPaymentAfter;
  } else if (isTwoContracts && bankOffer.twoRate !== undefined) {
    const result = calculateTwoContractsMonthlyPayment(
      mortgageAmount.mortgageAmount,
      bankOffer.twoRate,
      actualRate,
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
      mortgageAmount.firstTrancheAmount || 0,
      mortgageAmount.secondTrancheAmount || 0,
      mortgageAmount.mortgageAmount,
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
      mortgageAmount.mortgageAmount,
      actualRate,
      loanTermMonths,
    );
  }

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

    subsidyPercent: actualSubsidyPercent,
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
    mortgageAmount: Math.ceil(mortgageAmount.mortgageAmount),
    subsidyAmount: Math.ceil(subsidyAmount),
    developerAccount: Math.ceil(developerAccount),
    pricePerM2: pricePerM2 !== null ? Math.ceil(pricePerM2) : null,

    isLimitExceeded,
    firstContractAmount,
    secondContractAmount,

    firstTrancheAmount: mortgageAmount.firstTrancheAmount,
    secondTrancheAmount: mortgageAmount.secondTrancheAmount,
    firstTranchePayment: trancheSchedule.firstTranchePayment,
    secondTranchePayment: trancheSchedule.secondTranchePayment,
    trancheSecondDate: trancheSchedule.trancheSecondDate ?? undefined,
    monthsUntilSecondTranche:
      trancheSchedule.monthsUntilSecondTranche ?? undefined,
  };
};
