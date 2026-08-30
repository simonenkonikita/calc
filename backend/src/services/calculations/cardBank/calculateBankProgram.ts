// backend/src/services/calculations/bankProgram/calculateBankProgram.ts

import { Offer } from "../../../entities/Offer";

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
import { BankProgramResult, Variables } from "../../../types/types";

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
  minDownPaymentPercent: number,
): BankProgramResult => {
  const programType = offer.programEntity?.type || "base";
  const isFamilyOrIt = programType === "family" || programType === "it";
  const isTwoContracts = isFamilyOrIt && offer.isTwoContracts === true;
  const isExcessLimit = isFamilyOrIt && offer.excessLimit === true;
  const isTranche = programType === "tranche" && offer.isTranche === true;
  const isSpecialMortgageMode =
    mortgageWithoutDownPayment || mortgagePartialDownPayment;
  const isShortSubsidy = programType === "short" && !!offer.durationMonths;

  // Коэффициенты
  const coefficients = calculateBankCoefficients({
    offer,
    variables,
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    loanTermYears,
    noSubsidyInflate,
    isSpecialMortgageMode,
    isTwoContracts,
  });

  const actualSubsidyPercent = coefficients.subsidyPercent;

  // Сумма в договоре
  const contractResult = calculateContractAmount(
    offer,
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
    coefficients,
  );

  let contractAmount = contractResult.contractAmount;

  // Первоначальный взнос
  let downPaymentAmount = calculateDownPaymentAmount({
    offer,
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    variables,
    isSpecialMortgageMode,
    remainingAmount,
    noSubsidyInflate,
    coefficients,
    minDownPaymentPercent,
  });

  // Сумма ипотеки
  let mortgageAmountResult = calculateMortgageAmount({
    offer,
    objectCost,
    contractAmount,
    downPayment,
    remainingAmount,
    downPaymentAmount,
    userDownPaymentPercent,
    variables,
    coefficients,
    isSpecialMortgageMode,
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
  });

  // Цена за м²
  const pricePerM2 = calculatePricePerM2(developerAccount, area);

  // Срок ипотеки
  const loanTermMonths = calculateLoanTermMonths(loanTermYears);

  // Ежемесячный платеж
  const paymentResult = calculateAllMonthlyPayment({
    offer,
    variables,
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
    offerId: offer.id,

    // ✅ Добавляем лимиты из офера
    minLoanAmount: offer.minLoanAmount ?? undefined,
    maxLoanAmount: offer.maxLoanAmount ?? undefined,
    minLoanTerm: offer.minLoanTerm ?? undefined,
    maxLoanTerm: offer.maxLoanTerm ?? undefined,

    complexes: offer.complexes ?? undefined,

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
