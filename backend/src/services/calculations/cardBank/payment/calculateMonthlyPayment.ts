// backend/src/services/calculations/bankProgram/steps/payment/calculateMonthlyPayment.ts

export const calculateMonthlyPayment = (
  loanAmount: number,
  annualRate: number,
  months: number,
): number => {
  if (loanAmount <= 0 || months <= 0) {
    return 0;
  }

  if (annualRate === 0) {
    return loanAmount / months;
  }

  const monthlyRate = annualRate / 100 / 12;
  const powerFactor = Math.pow(1 + monthlyRate, months);

  if (powerFactor === Infinity) {
    return 0;
  }

  const annuityCoefficient = (monthlyRate * powerFactor) / (powerFactor - 1);
  return loanAmount * annuityCoefficient;
};