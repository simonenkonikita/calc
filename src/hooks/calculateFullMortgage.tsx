import { DEFAULT_MIN_PV_PERCENT } from "../utils/constants";
import {
  CalculatorFormData,
  ObjectCalculationResult,
  BankOffer,
  Variables,
  BankProgramResult,
} from "../utils/types";
import { calculateBankProgram } from "./calculateBankProgram";
import { calculateDownPayment } from "./calculateDownPayment";

// ========== ПОЛНЫЙ РАСЧЕТ ИПОТЕКИ ==========
export const calculateFullMortgage = (
  formData: CalculatorFormData,
  bankOffers: BankOffer[],
  variables: Variables,
  pricePerSquareMeter: number,
): {
  objectResult: ObjectCalculationResult;
  bankResults: BankProgramResult[];
} => {
  // 1. Расчет стоимости объекта
  const area = formData.area;
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

  // 2. Расчет первоначального взноса
  const downPayment = calculateDownPayment(
    objectCost,
    formData,
    DEFAULT_MIN_PV_PERCENT,
  );

  // 3. Остаток от стоимости
  const remainingAmount = objectCost - downPayment;

  const loanTermYears = formData.loanTerm || 30; // ← получаем срок из формы

  // 4. Расчет для каждого банка
  const bankResults: BankProgramResult[] = [];

  for (const offer of bankOffers) {
    try {
      const result = calculateBankProgram(
        objectCost,
        downPayment,
        remainingAmount,
        formData.downPaymentPercent,
        loanTermYears,
        offer,
        variables,
        formData.noSubsidyInflate,
        formData.mortgageWithoutDownPayment,
        formData.applyMinDownPayment,
      );
      bankResults.push(result);
    } catch (error) {
      console.error(
        `Ошибка расчета для ${offer.bank} - ${offer.program}`,
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
    },
    bankResults,
  };
};
