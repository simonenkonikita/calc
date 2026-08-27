import { Offer } from "../../../../../entities/Offer";
import { Variables } from "../../../../../types/types";
import { calculateMonthlyPayment } from "../calculateMonthlyPayment";

// ========== РАСЧЕТ ЕЖЕМЕСЯЧНОГО ПЛАТЕЖА ПО 2 ДОГОВОРАМ ==========
export const calculateTwoContractsMonthlyPayment = (
  offer: Offer,
  variables: Variables,
  mortgageAmount: number,
  twoRate: number, // Ставка по второму договору (обычно выше)
  firstRate: number, // Ставка по первому договору (льготная, 6%)
  loanTermMonths: number, // Срок в месяцах
): {
  firstContractPayment: number;
  secondContractPayment: number;
  totalMonthlyPayment: number;
} => {
  // Лимит для первого договора (льготная ставка)
  const isIt = offer.programEntity?.type === "it";

  const limit = isIt
    ? variables.itMortgageLimit || 9000000
    : variables.familyMortgageLimit || 6000000;

  // Проверка на корректность данных
  if (mortgageAmount <= 0 || loanTermMonths <= 0) {
    return {
      firstContractPayment: 0,
      secondContractPayment: 0,
      totalMonthlyPayment: 0,
    };
  }

  // Разбиваем сумму на два договора
  const firstContractAmount = Math.min(mortgageAmount, limit);
  const secondContractAmount = Math.max(0, mortgageAmount - limit);

  // Если второго договора нет (сумма меньше лимита)
  if (secondContractAmount === 0) {
    const payment = calculateMonthlyPayment(
      firstContractAmount,
      firstRate,
      loanTermMonths,
    );
    return {
      firstContractPayment: payment,
      secondContractPayment: 0,
      totalMonthlyPayment: payment,
    };
  }

  // Расчет платежа по первому договору (льготная ставка)
  const firstContractPayment = calculateMonthlyPayment(
    firstContractAmount,
    firstRate,
    loanTermMonths,
  );

  // Расчет платежа по второму договору (обычная ставка)
  const secondContractPayment = calculateMonthlyPayment(
    secondContractAmount,
    twoRate,
    loanTermMonths,
  );

  return {
    firstContractPayment: Math.ceil(firstContractPayment),
    secondContractPayment: Math.ceil(secondContractPayment),
    totalMonthlyPayment: Math.ceil(
      firstContractPayment + secondContractPayment,
    ),
  };
};
