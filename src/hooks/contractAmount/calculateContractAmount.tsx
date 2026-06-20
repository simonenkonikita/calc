import { BankOffer, Variables } from "../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateContractAmount = (
  objectCost: number, // $B$7 - стоимость объекта
  downPayment: number, // $B$13 - сумма ПВ
  remainingAmount: number, // $B$14 - сумма ипотеки (objectCost - downPayment)
  userDownPaymentPercent: number, // $B$8 - процент ПВ из формы
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean, // $L$9 - не завышать на субсидию
  mortgageWithoutDownPayment: boolean /*  */, // $L$10 - ипотека без ПВ
  applyMinDownPayment: boolean, // $L$11 - применить мин ПВ
): number => {
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );
  // Желание пользователя (сколько он хочет внести в процентах)
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  // Требование банка (минимальный ПВ для этой программы)
  const bankMinDownPayment = objectCost * (bankOffer.minPVPercent / 100);

  // Фактический минимальный ПВ (с учётом флага "применить мин ПВ")
  const actualMinDownPayment = applyMinDownPayment
    ? bankMinDownPayment // Используем требование банка
    : userDesiredDownPayment; // Используем желание пользователя

  // =ЕСЛИ(И($L$9=ИСТИНА;$L$10=ЛОЖЬ);$B$7; ...)
  if (noSubsidyInflate && !mortgageWithoutDownPayment) {
    return Math.ceil(objectCost);
  }

  // =ЕСЛИ(И($L$10=ИСТИНА;$B$13<($B$14*L2+$B$7-$B$13)*$B$8/100); ...)
  if (mortgageWithoutDownPayment) {
    const threshold =
      (remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment) *
      (userDownPaymentPercent / 100);

    if (downPayment < threshold) {
      // =ЕСЛИ(И($L$9=ИСТИНА;$L$10=ИСТИНА);$B$7/79.9*100; $B$14*L2+$B$7-$B$13)
      if (noSubsidyInflate && mortgageWithoutDownPayment) {
        return Math.ceil((objectCost - downPayment) / 0.799);
      } else {
        return Math.ceil(
          remainingAmount * coefficients.requiredCoeffWithoutPV +
            objectCost -
            downPayment,
        );
      }
    }
  }

  // Проверяем лимиты для специальных программ
  let contractAmount: number;

  // =ЕСЛИ($B$13<=$B$7*$B$8/100; $B$7/Сбербанк!J2; $B$14/Сбербанк!K2+$B$13)
  if (downPayment <= actualMinDownPayment) {
    contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
  } else {
    contractAmount =
      remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
  }

  // Проверка лимитов для семейной/ИТ ипотеки
  if (bankOffer.type === "family") {
    const limit = variables.familyMortgageLimit;
    const maxAmount = variables.maxFamilyMortgageSum;

    if (contractAmount > maxAmount) {
      contractAmount = maxAmount;
    }

    if (bankOffer.excessLimit) {
      const subsidyAmount =
        (contractAmount - objectCost) * (bankOffer.subsidyPercent / 100);
      if (subsidyAmount > limit) {
        contractAmount =
          (objectCost + limit) / coefficients.requiredCoeffWithLargePV;
      }
    }
  }

  if (bankOffer.type === "it") {
    const limit = variables.itMortgageLimit;
    const maxAmount = variables.maxItMortgageSum;

    if (contractAmount > maxAmount) {
      contractAmount = maxAmount;
    }

    if (bankOffer.excessLimit) {
      const subsidyAmount =
        (contractAmount - objectCost) * (bankOffer.subsidyPercent / 100);
      if (subsidyAmount > limit) {
        contractAmount =
          (objectCost + limit) / coefficients.requiredCoeffWithLargePV;
      }
    }
  }

  return Math.ceil(contractAmount);
};
