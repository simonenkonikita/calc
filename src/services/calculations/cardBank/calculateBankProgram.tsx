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
import { getDynamicSubsidy } from "../сoefficients/getDynamicSubsidy";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateTwoContractsMonthlyPayment } from "./payment/family/calculateTwoContractsMonthlyPayment";
import { calculateTranchePayments } from "./payment/tranche/calculateTranchePayments";

// ========== РАСЧЕТ ВСЕХ ПАРАМЕТРОВ ПО БАНКОВСКОЙ ПРОГРАММЕ ==========
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
  const isFamilyOrIt = bankOffer.type === "family" || bankOffer.type === "it";
  const isTwoContracts =
    bankOffer.type === "family" && bankOffer.isTwoContracts === true;
  const isTranche =
    bankOffer.type === "tranche" && bankOffer.isTranche === true;
  const isSpecialMortgageMode =
    mortgageWithoutDownPayment || mortgagePartialDownPayment;

  const coefficients = calculateBankCoefficients(
    variables,
    objectCost,
    bankOffer,
    userDownPaymentPercent,
    loanTermYears,
  );

  // 1. Расчет суммы в договоре (завышение)
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

  // 2. Завышение
  const overstatement = contractAmount - objectCost;

  // 3. Расчет суммы ПВ
  const downPaymentAmount = calculateDownPaymentAmount({
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    isSpecialMortgageMode: isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
    coefficients,
  });

  // Собственные средства
  let ownFunds: number;

  if (isFamilyOrIt) {
    // СЕМЕЙНАЯ/ИТ — используем сложную формулу с лимитами
    ownFunds = calculateOwnFunds({
      objectCost,
      downPayment,
      remainingAmount,
      contractAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      isSpecialMortgageMode: isSpecialMortgageMode,
      coefficients,
    });
  } else {
    // ОБЫЧНАЯ ИПОТЕКА (full, short) — простая формула
    ownFunds = isSpecialMortgageMode ? downPayment : downPaymentAmount;
  }

  // 5. Вносим за клиента
  let clientContribution: number;

  if (isFamilyOrIt) {
    // СЕМЕЙНАЯ/ИТ — используем сложную формулу с лимитами
    clientContribution = calculateClientContribution({
      objectCost,
      downPaymentAmount: downPaymentAmount,
      ownFunds,
      userDownPaymentPercent,
      bankOffer,
      variables,
      mortgageWithoutDownPayment: isSpecialMortgageMode,
      coefficients,
    });
  } else {
    // ОБЫЧНАЯ ИПОТЕКА (full, short) — простая формула
    clientContribution = downPaymentAmount - ownFunds;
  }

  // 6. ПВ в процентах
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // 7. Сумма ипотеки
  const mortgageAmount = calculateMortgageAmount({
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount: downPaymentAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    isFamilyOrIt,
    isSpecialMortgageMode,
    coefficients,
  });

  const firstContractAmount = isTwoContracts
    ? Math.min(mortgageAmount.mortgageAmount, 6000000)
    : undefined;

  const secondContractAmount = isTwoContracts
    ? Math.max(0, mortgageAmount.mortgageAmount - 6000000)
    : undefined;

  const isLimitExceeded = mortgageAmount.isLimitExceeded;

  // ✅ 4. Получаем актуальную ставку через getDynamicRate
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

  // 🔥 8. ОПРЕДЕЛЯЕМ АКТУАЛЬНУЮ СУБСИДИЮ
  let actualSubsidyPercent = bankOffer.subsidyPercent;

  // Для 2 договоров - субсидия зависит от суммы второго договора (рыночной части)
  if (isTwoContracts && secondContractAmount && secondContractAmount > 0) {
    const dynamicSubsidy = getDynamicSubsidy(
      bankOffer,
      pvForRate,
      secondContractAmount,
      loanTermYears,
    );
    if (dynamicSubsidy !== undefined) {
      actualSubsidyPercent = dynamicSubsidy;
    }
  }
  // Если есть dynamicSubsidyPercent и это не 2 договора
  else if (
    bankOffer.dynamicSubsidyPercent &&
    bankOffer.dynamicSubsidyPercent.length > 0
  ) {
    const dynamicSubsidy = getDynamicSubsidy(
      bankOffer,
      pvForRate,
      mortgageAmount.mortgageAmount,
      loanTermYears,
    );
    if (dynamicSubsidy !== undefined) {
      actualSubsidyPercent = dynamicSubsidy;
    }
  }

  let subsidyAmount: number;

  // 8. Сумма субсидии
  if (isTwoContracts) {
    // Для 2 договоров субсидия только на рыночную часть (второй договор)
    const secondContract = secondContractAmount || 0;
    subsidyAmount = secondContract * (actualSubsidyPercent / 100); // ✅ Используем actualSubsidyPercent
  } else {
    subsidyAmount =
      mortgageAmount.mortgageAmount * (actualSubsidyPercent / 100); // ✅ Используем actualSubsidyPercent
  }

  // 9. Сверхлимит и коррекция субсидии
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

  // 10. На счет застройщика

  let developerAccount: number;

  if (isFamilyOrIt) {
    // СЕМЕЙНАЯ ИЛИ ИТ ИПОТЕКА — используем сложную формулу с лимитами
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
      isSpecialMortgageMode: isSpecialMortgageMode,
      downPaymentAmount: downPaymentAmount,
      noSubsidyInflate,
      coefficients,
    });
  } else {
    // ОБЫЧНАЯ ИПОТЕКА (full, short) — простая формула
    if (isSpecialMortgageMode) {
      developerAccount =
        ownFunds + mortgageAmount.mortgageAmount - subsidyAmount;
    } else {
      developerAccount = contractAmount - subsidyAmount;
    }
  }

  // ============================================================
  // 12. РАСЧЕТ "ПОЛУЧЕНО ЗА М²"
  // ============================================================
  let pricePerM2: number | null = null;

  if (area && area > 0) {
    pricePerM2 = developerAccount / area;
  }

  // 11. Срок ипотеки
  const loanTermMonths = loanTermYears * 12;

  const isShortSubsidy = bankOffer.type === "short" && bankOffer.durationMonths;
  const method = bankOffer.subsidyCalculationMethod || "standard";

  let monthlyPayment: number;
  let monthlyPaymentAfter: number | null = null;
  let firstContractPayment: number = 0;
  let secondContractPayment: number = 0;
  let totalMonthlyPayment: number = 0;

  // ✅ ИНИЦИАЛИЗИРУЕМ trancheSchedule со значениями по умолчанию
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
  }
  // ✅ ТРАНШЕВАЯ ИПОТЕКА
  else if (isTranche) {
    const trancheResult = calculateTranchePayments(
      actualRate,
      bankOffer,
      mortgageAmount.firstTrancheAmount || 0,
      mortgageAmount.secondTrancheAmount || 0,
      mortgageAmount.mortgageAmount,
      loanTermMonths,
      complexName,
    );

    // Сохраняем результаты для отображения
    firstContractPayment = trancheResult.firstTranchePayment;
    secondContractPayment = trancheResult.secondTranchePayment;
    monthlyPayment = trancheResult.monthlyPayment;
    totalMonthlyPayment = trancheResult.monthlyPayment;

    // ✅ Сохраняем траншевый график для UI с полными данными
    trancheSchedule = {
      firstTranchePayment: trancheResult.firstTranchePayment,
      secondTranchePayment: trancheResult.secondTranchePayment,
      monthlyPayment: trancheResult.monthlyPayment,
      monthsUntilSecondTranche: trancheResult.monthsUntilSecondTranche,
      trancheSecondDate: trancheResult.trancheSecondDate,
    };
  }
  // СТАНДАРТНАЯ ИПОТЕКА
  else {
    monthlyPayment = calculateMonthlyPayment(
      mortgageAmount.mortgageAmount,
      actualRate,
      loanTermMonths,
    );
  }

  return {
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,
    rate: actualRate,
    twoRate: bankOffer.twoRate,
    isTwoContracts: isTwoContracts,
    shortRate: bankOffer.shortRate,
    subsidyPercent: actualSubsidyPercent,
    durationMonths:
      bankOffer.type === "short" ? bankOffer.durationMonths : loanTermMonths,
    monthlyPayment: Math.ceil(monthlyPayment),
    firstContractPayment: firstContractPayment,
    secondContractPayment: secondContractPayment,
    totalMonthlyPayment: totalMonthlyPayment,
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
    monthlyPaymentAfter: monthlyPaymentAfter
      ? Math.ceil(monthlyPaymentAfter)
      : undefined,
    isLimitExceeded: isLimitExceeded,
    firstContractAmount,
    secondContractAmount,
    isTranche: isTranche,
    firstTrancheAmount: mortgageAmount.firstTrancheAmount,
    secondTrancheAmount: mortgageAmount.secondTrancheAmount,
    firstTranchePayment: trancheSchedule.firstTranchePayment,
    secondTranchePayment: trancheSchedule.secondTranchePayment,
    trancheSecondDate: trancheSchedule.trancheSecondDate ?? undefined,
    monthsUntilSecondTranche:
      trancheSchedule.monthsUntilSecondTranche ?? undefined,
  };
};
