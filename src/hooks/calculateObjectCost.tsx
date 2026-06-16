import { ObjectCalculationResult } from "../utils/types";

// ========== РАСЧЕТ СТОИМОСТИ ОБЪЕКТА ==========
export const calculateObjectCost = (
  pricePerSquareMeter: number,
  area: number,
  considerDeposit: boolean,
  manualObjectCost: number | null,
  deposit: number,
): ObjectCalculationResult => {
  let objectCost: number;

  if (manualObjectCost && manualObjectCost > 0) {
    objectCost = manualObjectCost;
  } else {
    objectCost = pricePerSquareMeter * area;
  }

  if (considerDeposit) {
    objectCost = objectCost - deposit;
  }

  return {
    objectCost: Math.ceil(objectCost),
    downPayment: 0,
    remainingAmount: 0,
    pricePerSquareMeter,
  };
};
