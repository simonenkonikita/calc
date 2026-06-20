// ========== РАСЧЕТ БУДУЩЕЙ СТОИМОСТИ (ОСТАТКА ДОЛГА) ==========
export const calculateFutureValue = (
  rate: number,
  months: number,
  payment: number,
  amount: number,
): number => {
  if (months <= 0) return amount;

  const monthlyRate = rate / 100 / 12;

  if (monthlyRate === 0) {
    return Math.max(0, amount - payment * months);
  }

  const powerFactor = Math.pow(1 + monthlyRate, months);
  const result =
    amount * powerFactor - (payment * (powerFactor - 1)) / monthlyRate;

  // Логируем для отладки
  console.log("📊 calculateFutureValue:", {
    rate,
    months,
    payment,
    amount,
    monthlyRate,
    powerFactor,
    result,
  });

  return Math.max(0, result);
};
