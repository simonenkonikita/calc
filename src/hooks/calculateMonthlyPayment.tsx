// ========== РАСЧЕТ ЕЖЕМЕСЯЧНОГО ПЛАТЕЖА (АННУИТЕТ) ==========
export const calculateMonthlyPayment = (
  loanAmount: number,
  annualRate: number,
  months: number,
): number => {
  if (annualRate === 0 || loanAmount === 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  const annuityCoefficient =
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return loanAmount * annuityCoefficient;
};
