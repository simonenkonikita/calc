import { BankOffer, Variables, BankProgramResult } from "../../utils/types";
import { calculateDownPaymentAmount } from "../contractAmount/addContractAmount/alculateDownPaymentAmount";
import { calculateContractAmount } from "../contractAmount/calculateContractAmount";
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
  applyMinDownPayment: boolean,
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

  // 3. Расчет суммы ПВ
  const downPaymentAmount = calculateDownPaymentAmount({
    objectCost,
    downPayment,
    contractAmount,
    userDownPaymentPercent,
    manualDownPayment,
    bankOffer,
    variables,
    mortgageWithoutDownPayment,
  });

  // 4. Собственные средства
  const ownFunds = mortgageWithoutDownPayment ? downPayment : downPaymentAmount;

  // 5. Вносим за клиента
  const clientContribution = downPaymentAmount - ownFunds;

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
    monthlyPaymentAfter: monthlyPaymentAfter
      ? Math.ceil(monthlyPaymentAfter)
      : undefined,
  };
};
