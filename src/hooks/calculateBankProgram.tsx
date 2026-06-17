import { DEFAULT_MIN_PV_PERCENT } from "../utils/constants";
import { BankOffer, Variables, BankProgramResult } from "../utils/types";
import { calculateContractAmount } from "./calculateContractAmount";
import { calculateMonthlyPayment } from "./calculateMonthlyPayment";

// ========== РАСЧЕТ ВСЕХ ПАРАМЕТРОВ ПО БАНКОВСКОЙ ПРОГРАММЕ ==========
export const calculateBankProgram = (
  objectCost: number, // $B$7 - стоимость объекта
  downPayment: number, // $B$13 - получивщаяся сумма ПВ от стоимость объекта
  remainingAmount: number, // $B$14 - сумма ипотеки (objectCost - downPayment)
  userDownPaymentPercent: number, // сумма ПВ в %
  loanTermYears: number, // $B$8 - процент ПВ из формы
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
    bankOffer,
    variables,
    noSubsidyInflate,
    mortgageWithoutDownPayment,
    applyMinDownPayment,
  );

  // Завышение
  const overstatement = contractAmount - objectCost;

  // 2. Расчет суммы ПВ (как в Excel: =IF($B$13<$B$7*$B$8/100, C18*$B$8/100, IF($B$13>=C18*$B$8/100, $B$13, C18*$B$8/100)))
  let downPaymentAmount: number;
  let ownFunds: number;

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100); // ПВ от стоимости объекта в указанных %
  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100); //  ПВ от найденой суммы в договоре

  // Cуммы ПВ
  if (downPayment < userDesiredDownPayment) {
    downPaymentAmount = contractAmount * (userDownPaymentPercent / 100);
  } else if (downPayment >= userDesiredDownPayment) {
    downPaymentAmount = contractAmount * (DEFAULT_MIN_PV_PERCENT / 100);
  } else if (downPayment >= downPaymentFromContract) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = downPaymentFromContract;
  }
  downPaymentAmount = Math.ceil(downPaymentAmount);

  // 3. Собственные средства (E = D - B13 в Excel)
  if (mortgageWithoutDownPayment) {
    ownFunds = downPayment;
  } else {
    ownFunds = downPaymentAmount;
  }

  // 4. Вносим за клиента (F = D - E в Excel)
  const clientContribution = downPaymentAmount - ownFunds;

  // 5. ПВ в процентах (G = D / C * 100 в Excel)
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // 6. Сумма ипотеки (I = C - D в Excel)
  const mortgageAmount = contractAmount - downPaymentAmount;

  // 7. Сумма субсидии (J = I * subsidyPercent / 100 в Excel)
  let subsidyAmount = mortgageAmount * (bankOffer.subsidyPercent / 100);

  // 8. Сверхлимит (H) и коррекция субсидии
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

  // 9. На счет застройщика (K в Excel: =IF($L$10=TRUE,E+I-J, C-J))
  let developerAccount: number;

  if (mortgageWithoutDownPayment) {
    developerAccount = ownFunds + mortgageAmount - subsidyAmount;
  } else {
    developerAccount = contractAmount - subsidyAmount;
  }

  // Срок ипотеки
  const loanTermMonths =
    bankOffer.type === "short"
      ? bankOffer.durationMonths || 12 // для коротких программ - фиксированный срок
      : loanTermYears * 12; // для всех остальных - из поля "Срок ипотеки"

  // 10. Ежемесячный платеж (аннуитетный)
  const monthlyPayment = calculateMonthlyPayment(
    mortgageAmount,
    bankOffer.rate,
    loanTermMonths, // если не указан срок, то 30 лет
  );

  return {
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,
    rate: bankOffer.rate,
    durationMonths: loanTermMonths,
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
  };
};
