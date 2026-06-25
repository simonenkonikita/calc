import { BankOffer, Variables, BankProgramResult } from "../../utils/types";
import { calculateClientContribution } from "../contractAmount/calculateClientContribution";
import { calculateContractAmount } from "../contractAmount/calculateContractAmount";
import { calculateOwnFunds } from "../contractAmount/calculateOwnFunds";
import { calculateDeveloperAccount } from "../contractAmount/developerAccount/calculateDeveloperAccount";
import { calculateDownPaymentAmount } from "../contractAmount/сalculateDownPaymentAmount";
import { getDynamicRate } from "../dynamicRate/getDynamicRate";
import { calculateMonthlyPayment } from "../payment/standartPayment/calculateMonthlyPayment";
import { calculateSubsidyPayments } from "../payment/subsidy/calculateSubsidyPayments";

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
): BankProgramResult => {
  const isFamilyOrIt = bankOffer.type === "family" || bankOffer.type === "it";
  const isSpecialMortgageMode =
    mortgageWithoutDownPayment || mortgagePartialDownPayment;

  // 1. Расчет суммы в договоре (завышение)
  const contractAmount = calculateContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    noSubsidyInflate,
    isSpecialMortgageMode,
  );

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
    mortgageWithoutDownPayment: isSpecialMortgageMode,
  });

  // Собственные средства
  let ownFunds: number;

  if (isFamilyOrIt) {
    // СЕМЕЙНАЯ/ИТ — используем сложную формулу с лимитами
    ownFunds = calculateOwnFunds({
      objectCost,
      downPayment,
      downPaymentAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      mortgageWithoutDownPayment: isSpecialMortgageMode,
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
      downPaymentAmount,
      ownFunds,
      userDownPaymentPercent,
      bankOffer,
      variables,
      mortgageWithoutDownPayment: isSpecialMortgageMode,
    });
  } else {
    // ОБЫЧНАЯ ИПОТЕКА (full, short) — простая формула
    clientContribution = downPaymentAmount;
  }

  // 6. ПВ в процентах
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // 7. Сумма ипотеки
  const mortgageAmount = contractAmount - downPaymentAmount;

  // ✅ 4. Получаем актуальную ставку через getDynamicRate
  const pvForRate =
    manualDownPayment > 0 && objectCost > 0
      ? (manualDownPayment / objectCost) * 100
      : userDownPaymentPercent;

  const actualRate = getDynamicRate(
    bankOffer,
    pvForRate,
    mortgageAmount,
    loanTermYears,
  );

  // 8. Сумма субсидии
  let subsidyAmount = mortgageAmount * (bankOffer.subsidyPercent / 100);

  // 9. Сверхлимит и коррекция субсидии
  let excessLimit: number | undefined;
  if (bankOffer.excessLimit) {
    if (bankOffer.type === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (bankOffer.subsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.familyMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    } else if (bankOffer.type === "it") {
      const maxSubsidy =
        variables.itMortgageLimit * (bankOffer.subsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.itMortgageLimit;
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
      mortgageAmount,
      subsidyAmount,
      contractAmount,
      userDownPaymentPercent,
      bankOffer,
      variables,
      mortgageWithoutDownPayment: isSpecialMortgageMode,
      downPaymentAmount,
      noSubsidyInflate,
    });
  } else {
    // ОБЫЧНАЯ ИПОТЕКА (full, short) — простая формула
    if (isSpecialMortgageMode) {
      developerAccount = ownFunds + mortgageAmount - subsidyAmount;
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

  // 12. Расчет ежемесячного платежа
  const isShortSubsidy = bankOffer.type === "short" && bankOffer.durationMonths;
  const method = bankOffer.subsidyCalculationMethod || "standard";

  let monthlyPayment: number;
  let monthlyPaymentAfter: number | null = null;

  if (isShortSubsidy && bankOffer.shortRate !== undefined) {
    const result = calculateSubsidyPayments(
      mortgageAmount,
      bankOffer.shortRate,
      actualRate,
      loanTermMonths,
      bankOffer.durationMonths || 12,
      method,
    );
    monthlyPayment = result.monthlyPaymentSubsidy;
    monthlyPaymentAfter = result.monthlyPaymentAfter;
  } else {
    monthlyPayment = calculateMonthlyPayment(
      mortgageAmount,
      actualRate,
      loanTermMonths,
    );
  }

  return {
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,
    rate: actualRate,
    shortRate: bankOffer.shortRate,
    subsidyPercent: bankOffer.subsidyPercent,
    durationMonths:
      bankOffer.type === "short" ? bankOffer.durationMonths : loanTermMonths,
    monthlyPayment: Math.ceil(monthlyPayment),
    overstatement: Math.ceil(overstatement),
    contractAmount: Math.ceil(contractAmount),
    downPaymentAmount: Math.ceil(downPaymentAmount),
    ownFunds: Math.ceil(ownFunds),
    clientContribution: Math.ceil(clientContribution),
    downPaymentPercent: Number(downPaymentPercentCalc.toFixed(1)),
    minPVPercent: bankOffer.minPVPercent,
    excessLimit: excessLimit ? Math.ceil(excessLimit) : undefined,
    mortgageAmount: Math.ceil(mortgageAmount),
    subsidyAmount: Math.ceil(subsidyAmount),
    developerAccount: Math.ceil(developerAccount),
    pricePerM2: pricePerM2 !== null ? Math.ceil(pricePerM2) : null,
    monthlyPaymentAfter: monthlyPaymentAfter
      ? Math.ceil(monthlyPaymentAfter)
      : undefined,
  };
};
