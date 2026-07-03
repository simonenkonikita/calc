// ========== РАСЧЕТ ЕЖЕМЕСЯЧНОГО ПЛАТЕЖА (АННУИТЕТ) ==========
export const calculateMonthlyPayment = (
  loanAmount: number,
  annualRate: number,
  months: number,
): number => {
  // Проверка на корректность данных
  if (loanAmount <= 0 || months <= 0) {
    return 0;
  }

  // Если ставка 0%, возвращаем просто деление суммы на срок
  if (annualRate === 0) {
    return loanAmount / months;
  }

  const monthlyRate = annualRate / 100 / 12;

  // Защита от очень больших чисел
  const powerFactor = Math.pow(1 + monthlyRate, months);

  if (powerFactor === Infinity) {
    return 0;
  }

  const annuityCoefficient = (monthlyRate * powerFactor) / (powerFactor - 1);

  return loanAmount * annuityCoefficient;
};

// ========== РАСЧЕТ ЕЖЕМЕСЯЧНОГО ПЛАТЕЖА ПО 2 ДОГОВОРАМ ==========
export const calculateTwoContractsMonthlyPayment = (
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
  const FIRST_CONTRACT_LIMIT = 6000000;

  // Проверка на корректность данных
  if (mortgageAmount <= 0 || loanTermMonths <= 0) {
    return {
      firstContractPayment: 0,
      secondContractPayment: 0,
      totalMonthlyPayment: 0,
    };
  }

  // Разбиваем сумму на два договора
  const firstContractAmount = Math.min(mortgageAmount, FIRST_CONTRACT_LIMIT);
  const secondContractAmount = Math.max(
    0,
    mortgageAmount - FIRST_CONTRACT_LIMIT,
  );

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
