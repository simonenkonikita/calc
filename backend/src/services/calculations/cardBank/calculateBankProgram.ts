// backend/src/services/calculations/bankProgram/calculateBankProgram.ts

import { Offer } from "../../../entities/Offer";
import { Variables, BankProgramResult } from "../../../types/types";
import { calculateActualRate } from "../cardBank/actualRate/calculateActualRate";
import { calculateClientContribution } from "../cardBank/clientContribution/calculateClientContribution";
import { calculateContractAmount } from "../cardBank/contractAmount/calculateContractAmount";

import { calculatePricePerM2 } from "../../../utils/pricePerM2/pricePerM2";
import { calculateLoanTermMonths } from "../../../utils/loanTerm";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";
import { calculateExcessLimit } from "../../../utils/excessLimit/calculateExcessLimit";
import { adjustTwoContracts } from "./contractAmount/family/adjustTwoContracts";
import { calculateDeveloperAccount } from "./developerAccount/calculateDeveloperAccount";

import { calculateDownPaymentPercent } from "./downPaymentPercent/downPaymentPercent";
import { calculateMortgageAmount } from "./mortgageAmount/calculateMortgageAmount";
import { calculateOverstatement } from "./overstatement/overstatement";
import { calculateOwnFunds } from "./ownFunds/calculateOwnFunds";
import { calculateAllMonthlyPayment } from "./payment/calculateAllMonthlyPayment";
import { calculateSubsidyAmount } from "./subsidyAmount/calculateSubsidyAmount";
import { calculateDownPaymentAmount } from "./downPayment/сalculateDownPaymentAmount";

export const calculateBankProgram = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  loanTermYears: number,
  manualDownPayment: number,
  offer: Offer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  mortgagePartialDownPayment: boolean,
  area: number,
  complexName: string,
): BankProgramResult => {
  const programType = offer.programEntity?.type || "base";
  const isFamilyOrIt = programType === "family" || programType === "it";
  const isTwoContracts =
    programType === "family" && offer.isTwoContracts === true;
  const isTranche = programType === "tranche" && offer.isTranche === true;
  const isSpecialMortgageMode =
    mortgageWithoutDownPayment || mortgagePartialDownPayment;
  const isShortSubsidy = programType === "short" && !!offer.durationMonths;

  // Коэффициенты
  const coefficients = calculateBankCoefficients({
    variables,
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    offer,
    noSubsidyInflate,
    isSpecialMortgageMode,
    loanTermYears,
  });

  const actualSubsidyPercent = coefficients.subsidyPercent;

  // Сумма в договоре
  const contractResult = calculateContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    offer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    coefficients,
  );

  let contractAmount = contractResult.contractAmount;

  // Первоначальный взнос
  let downPaymentAmount = calculateDownPaymentAmount({
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    offer,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
    coefficients,
  });

  // Сумма ипотеки
  let mortgageAmountResult = calculateMortgageAmount({
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isFamilyOrIt,
    isSpecialMortgageMode,
    coefficients,
  });

  let { firstContractAmount, secondContractAmount, isLimitExceeded } =
    mortgageAmountResult;

  // Субсидия
  const subsidyResult = calculateSubsidyAmount({
    offer,
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

  // Корректировка для двух договоров
  if (isTwoContracts) {
    const tempOwnFunds = calculateOwnFunds({
      objectCost,
      downPayment,
      remainingAmount,
      contractAmount,
      downPaymentAmount,
      userDownPaymentPercent,
      offer,
      variables,
      isSpecialMortgageMode,
      coefficients,
      isFamilyOrIt,
    });

    const adjustmentResult = adjustTwoContracts({
      offer,
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
      minPVPercent: offer.minPVPercent,
    });

    contractAmount = adjustmentResult.adjustedContractAmount;
    downPaymentAmount = adjustmentResult.adjustedDownPaymentAmount;
    mortgageAmountResult = {
      ...mortgageAmountResult,
      mortgageAmount: adjustmentResult.adjustedMortgageAmount,
    };
    firstContractAmount = adjustmentResult.adjustedFirstContractAmount;
    secondContractAmount = adjustmentResult.adjustedSecondContractAmount;
    subsidyAmount = adjustmentResult.subsidyAmount;
    secondContractSubsidyPercent =
      adjustmentResult.secondContractSubsidyPercent;
    secondContractSubsidyAmount = adjustmentResult.secondContractSubsidyAmount;
  }

  // Собственные средства
  const ownFunds = calculateOwnFunds({
    objectCost,
    downPayment,
    remainingAmount,
    contractAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    coefficients,
    isFamilyOrIt,
  });

  // Внос клиента
  const clientContribution = calculateClientContribution({
    objectCost,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    ownFunds,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    coefficients,
    isFamilyOrIt,
  });

  // Актуальная ставка
  const actualRateResult = calculateActualRate({
    offer,
    manualDownPayment,
    objectCost,
    userDownPaymentPercent,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    loanTermYears,
  });

  // ПВ в процентах
  const downPaymentPercentCalc = calculateDownPaymentPercent(
    downPaymentAmount,
    contractAmount,
  );

  // Сверхлимит
  const excessResult = calculateExcessLimit({
    offer,
    variables,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    subsidyAmount,
    actualSubsidyPercent,
  });

  const finalSubsidyAmount = excessResult.subsidyAmount;
  const excessLimit = excessResult.excessLimit;

  // На счет застройщика
  const developerAccount = calculateDeveloperAccount({
    objectCost,
    ownFunds,
    downPayment,
    remainingAmount,
    mortgageAmount: mortgageAmountResult.mortgageAmount,
    subsidyAmount: finalSubsidyAmount,
    contractAmount,
    userDownPaymentPercent,
    offer,
    variables,
    isSpecialMortgageMode,
    downPaymentAmount,
    noSubsidyInflate,
    coefficients,
    isFamilyOrIt,
  });

  // Цена за м²
  const pricePerM2 = calculatePricePerM2(developerAccount, area);

  // Срок ипотеки
  const loanTermMonths = calculateLoanTermMonths(loanTermYears);

  // Ежемесячный платеж
  const paymentResult = calculateAllMonthlyPayment({
    offer,
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

  // Сумма завышения
  const overstatement = calculateOverstatement(contractAmount, objectCost);

  return {
    bank: offer.bank?.name || "",
    program: offer.program,
    type: programType as any,

    rate: actualRateResult,
    twoRate: offer.twoRate ?? undefined,
    shortRate: offer.shortRate ?? undefined,

    isTwoContracts,
    isTranche,

    subsidyPercent: isTwoContracts
      ? (secondContractSubsidyPercent ?? actualSubsidyPercent)
      : actualSubsidyPercent,

    durationMonths:
      programType === "short"
        ? (offer.durationMonths ?? undefined) // ← null → undefined
        : loanTermMonths,

    minLoanTermYears: offer.minLoanTermYears ?? undefined,

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
    minPVPercent: offer.minPVPercent,

    excessLimit: excessLimit ? Math.ceil(excessLimit) : undefined,
    mortgageAmount: Math.ceil(mortgageAmountResult.mortgageAmount),
    subsidyAmount: Math.ceil(finalSubsidyAmount),
    developerAccount: Math.ceil(developerAccount),
    pricePerM2: pricePerM2 !== null ? Math.ceil(pricePerM2) : null,

    isLimitExceeded,
    firstContractAmount,
    secondContractAmount,

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
