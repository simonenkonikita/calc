import { DEFAULT_MIN_PV_PERCENT } from "../../../utils/constants";
import { CalculatorFormData } from "../../../utils/types";

// ========== РАСЧЕТ ПЕРВОНАЧАЛЬНОГО ВЗНОСА ==========
export const calculateDownPayment = (
  objectCost: number,
  formData: CalculatorFormData,
  minPVPercent: number = DEFAULT_MIN_PV_PERCENT,
): number => {
  const {
    mortgageWithoutDownPayment,
    mortgagePartialDownPayment,
    manualDownPayment,
    downPaymentPercent,
  } = formData;

  const minDownPayment = objectCost * (minPVPercent / 100); // Мин ПВ в рублях
  const calculatedPercentDown = objectCost * (downPaymentPercent / 100); // Мин ПВ указанный в  %

  // Ипотека без ПВ
  if (mortgageWithoutDownPayment || mortgagePartialDownPayment) {
    // Если ручной ввод больше чем минимальный
    if (manualDownPayment > minDownPayment) {
      return minDownPayment;
    }
    return manualDownPayment;
  }

  // Если есть ручной ввод ПВ
  if (manualDownPayment && manualDownPayment > 0) {
    // Проверяем, что ручной ввод в допустимых пределах
    if (
      manualDownPayment >= minDownPayment &&
      manualDownPayment <= objectCost
    ) {
      return manualDownPayment;
    }
    // Если ручной ввод меньше минимального
    if (manualDownPayment < minDownPayment) {
      return minDownPayment;
    }
    // Если ручной ввод больше стоимости объекта
    if (manualDownPayment > objectCost) {
      return minDownPayment;
    }
  }

  // Возвращаем рассчитанный от процента ПВ
  let result = calculatedPercentDown;

  // Проверка на минимум
  if (result < minDownPayment) {
    result = minDownPayment;
  }

  // Проверка на максимум (не больше стоимости)
  if (result > objectCost) {
    result = objectCost;
  }

  return result;
};
