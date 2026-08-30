// backend/src/services/calculations/result/calculateDownPayment.ts
import { CalculatorFormData } from "../../../types/types";

export const calculateDownPayment = (
  objectCost: number,
  formData: CalculatorFormData,
  minPVPercent: number,
): number => {
  const {
    mortgageWithoutDownPayment,
    mortgagePartialDownPayment,
    manualDownPayment,
    downPaymentPercent,
  } = formData;

  const minDownPayment = objectCost * (minPVPercent / 100);
  const calculatedPercentDown = objectCost * (downPaymentPercent / 100);

  if (mortgageWithoutDownPayment || mortgagePartialDownPayment) {
    if (manualDownPayment >= objectCost) {
      return objectCost;
    }
    if (manualDownPayment > minDownPayment) {
      return minDownPayment;
    }
    return manualDownPayment;
  }

  if (manualDownPayment && manualDownPayment > 0) {
    if (manualDownPayment >= objectCost) {
      return objectCost;
    }
    if (
      manualDownPayment >= minDownPayment &&
      manualDownPayment <= objectCost
    ) {
      return manualDownPayment;
    }
    if (manualDownPayment < minDownPayment) {
      return minDownPayment;
    }
    if (manualDownPayment > objectCost) {
      return minDownPayment;
    }
  }

  let result = calculatedPercentDown;

  if (result < minDownPayment) {
    result = minDownPayment;
  }

  if (result > objectCost) {
    result = objectCost;
  }

  return result;
};
