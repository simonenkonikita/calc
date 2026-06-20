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
    console.warn("Слишком большой срок или ставка для расчёта");
    return 0;
  }

  const annuityCoefficient = (monthlyRate * powerFactor) / (powerFactor - 1);

  return loanAmount * annuityCoefficient;
};
