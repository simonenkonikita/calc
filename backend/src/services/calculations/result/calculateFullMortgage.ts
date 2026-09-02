// backend/src/services/calculations/result/calculateFullMortgage.ts

import {
  CalculatorFormData,
  Variables,
  ObjectCalculationResult,
  BankProgramResult,
} from "../../../types/types";
import { Offer } from "../../../entities/Offer";
import { calculateDownPayment } from "./calculateDownPayment";
import { calculateBankProgram } from "../cardBank/calculateBankProgram";

export const calculateFullMortgage = (
  formData: CalculatorFormData,
  offers: Offer[],
  variables: Variables,
  pricePerSquareMeter: number,
  minDownPaymentPercent: number,
  area: number,
): {
  objectResult: ObjectCalculationResult;
  bankResults: BankProgramResult[];
} => {
  const manualObjectCost = formData.manualObjectCost;
  const considerDeposit = formData.considerDepositInCost;
  const deposit = variables.deposit;

  let objectCost: number;

  if (manualObjectCost && manualObjectCost > 0) {
    objectCost = manualObjectCost;
  } else {
    objectCost = pricePerSquareMeter * area;
  }

  if (considerDeposit) {
    objectCost = objectCost - deposit;
  }
  objectCost = Math.ceil(objectCost);

  const downPayment = calculateDownPayment(
    objectCost,
    formData,
    minDownPaymentPercent, // ✅ Передаём из контроллера
  );

  const remainingAmount = objectCost - downPayment;
  const loanTermYears = formData.loanTerm || 30;

  const bankResults: BankProgramResult[] = [];

  for (const offer of offers) {
    try {
      const result = calculateBankProgram(
        objectCost,
        downPayment,
        remainingAmount,
        formData.downPaymentPercent,
        loanTermYears,
        formData.manualDownPayment,
        offer,
        variables,
        formData.noSubsidyInflate,
        formData.mortgageWithoutDownPayment,
        formData.mortgagePartialDownPayment,
        area,
        formData.complex,
        minDownPaymentPercent,
      );
      bankResults.push(result);
    } catch (error) {
      console.error(
        `Ошибка расчета для ${offer.bank?.name} - ${offer.program}`,
        error,
      );
    }
  }

  return {
    objectResult: {
      objectCost,
      downPayment,
      remainingAmount,
      pricePerSquareMeter,
      area: area,
    },
    bankResults: bankResults.map((result) => ({
      ...result,
      area: area,
    })),
  };
};
