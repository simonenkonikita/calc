import { MIN_DOWN_PAYMENT_PERCENT } from "../utils/constants";
import { BankOffer, Variables, BankProgramResult } from "../utils/types";
import { calculateContractAmount } from "./calculateContractAmount";
import { calculateMonthlyPayment } from "./calculateMonthlyPayment";

import { calculateSubsidyPayments } from "./calculateSubsidyPayments";

// ========== РАСЧЕТ ВСЕХ ПАРАМЕТРОВ ПО БАНКОВСКОЙ ПРОГРАММЕ ==========
export const calculateBankProgram = (
  objectCost: number, // $B$7 - стоимость объекта
  downPayment: number, // $B$13 - получивщаяся сумма ПВ от стоимость объекта
  remainingAmount: number, // $B$14 - сумма ипотеки (objectCost - downPayment)
  userDownPaymentPercent: number, // сумма ПВ в %
  loanTermYears: number, // $B$8 - процент ПВ из формы
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean, // $L$9 - не завышать на субсидию
  mortgageWithoutDownPayment: boolean, // $L$10 - ипотека без ПВ
  applyMinDownPayment: boolean, // $L$11 - применить мин ПВ
): BankProgramResult => {
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
    mortgageWithoutDownPayment,
    applyMinDownPayment,
  );

  // 2. Завышение
  const overstatement = contractAmount - objectCost;

  // 3. Расчет суммы ПВ (как в Excel: =IF($B$13<$B$7*$B$8/100, C18*$B$8/100, IF($B$13>=C18*$B$8/100, $B$13, C18*$B$8/100)))
  const contractAmountMinPV = contractAmount * (bankOffer.minPVPercent / 100);
  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100); //  ПВ от найденой суммы в договоре

  let downPaymentAmount: number;
  let ownFunds: number;

  if (mortgageWithoutDownPayment) {
    downPaymentAmount = contractAmountMinPV;
  } else if (manualDownPayment > 0) {
    downPaymentAmount = Math.max(manualDownPayment, contractAmountMinPV);
  } else if (userDownPaymentPercent > MIN_DOWN_PAYMENT_PERCENT) {
    downPaymentAmount = downPaymentFromContract;
  } else if (downPayment >= contractAmountMinPV) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = contractAmountMinPV;
  }

  downPaymentAmount = Math.ceil(downPaymentAmount);

  // 4. Собственные средства (E = D - B13 в Excel)
  if (mortgageWithoutDownPayment) {
    ownFunds = downPayment;
  } else {
    ownFunds = downPaymentAmount;
  }

  // 5. Вносим за клиента (F = D - E в Excel)
  const clientContribution = downPaymentAmount - ownFunds;

  // 6. ПВ в процентах (G = D / C * 100 в Excel)
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // 7. Сумма ипотеки (I = C - D в Excel)
  const mortgageAmount = contractAmount - downPaymentAmount;

  // 8. Сумма субсидии (J = I * subsidyPercent / 100 в Excel)
  let subsidyAmount = mortgageAmount * (bankOffer.subsidyPercent / 100);

  // 9. Сверхлимит (H) и коррекция субсидии
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

  // 10. На счет застройщика (K в Excel: =IF($L$10=TRUE,E+I-J, C-J))
  let developerAccount: number;

  if (mortgageWithoutDownPayment) {
    developerAccount = ownFunds + mortgageAmount - subsidyAmount;
  } else {
    developerAccount = contractAmount - subsidyAmount;
  }

  // 11. Срок ипотеки
  const loanTermMonths = loanTermYears * 12;

  // 12. Расчет ежемесячного платежа
  const isShortSubsidy = bankOffer.type === "short" && bankOffer.durationMonths;
  const method = bankOffer.subsidyCalculationMethod || "standard";

  let monthlyPayment: number;
  let monthlyPaymentAfter: number | null = null;

  if (isShortSubsidy && bankOffer.shortRate !== undefined) {
    // 13. Субсидия на короткий срок
    const result = calculateSubsidyPayments(
      mortgageAmount,
      bankOffer.shortRate,
      bankOffer.rate,
      loanTermMonths,
      bankOffer.durationMonths || 12,
      method,
    );

    monthlyPayment = result.monthlyPaymentSubsidy;
    monthlyPaymentAfter = result.monthlyPaymentAfter;
  } else {
    // 13. Платеж на весь срок
    monthlyPayment = calculateMonthlyPayment(
      mortgageAmount,
      bankOffer.rate,
      loanTermMonths,
    );
  }

  return {
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,
    rate: bankOffer.rate,
    shortRate: bankOffer.shortRate,
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
    monthlyPaymentAfter: monthlyPaymentAfter
      ? Math.ceil(monthlyPaymentAfter)
      : undefined,
  };
};
