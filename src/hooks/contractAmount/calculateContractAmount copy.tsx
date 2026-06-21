import { BankOffer, Variables } from "../../utils/types";
import { calculateBankCoefficients } from "../сoefficients/calculateBankCoefficients";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  manualDownPayment: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  applyMinDownPayment: boolean,
): number => {
  const coefficients = calculateBankCoefficients(
    bankOffer,
    userDownPaymentPercent,
  );

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const bankMinDownPayment = objectCost * (bankOffer.minPVPercent / 100);
  const actualMinDownPayment = applyMinDownPayment
    ? bankMinDownPayment
    : userDesiredDownPayment;

  // ============================================================
  // 1. НЕ ЗАВЫШАТЬ НА СУБСИДИЮ
  // ============================================================
  if (noSubsidyInflate && !mortgageWithoutDownPayment) {
    return Math.ceil(objectCost);
  }

  // ============================================================
  // 2. ИПОТЕКА БЕЗ ПВ
  // ============================================================
  if (mortgageWithoutDownPayment) {
    const threshold =
      (remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment) *
      (userDownPaymentPercent / 100);

    if (downPayment < threshold) {
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

  let contractAmount: number;

  // ============================================================
  // 3. ПРОВЕРКА: ЭТО СУБСИДИЯ НА ВЕСЬ СРОК (FULL) ИЛИ КОРОТКИЙ СРОК (SHORT)?
  // ============================================================
  const hasSubsidy = bankOffer.subsidyPercent > 0;
  const isFullSubsidy = bankOffer.type === "full" && hasSubsidy;
  const isShortSubsidy = bankOffer.type === "short" && hasSubsidy;

  if (isFullSubsidy || isShortSubsidy) {
    // ============================================================
    // ДЛЯ СУБСИДИЙ (full И short)
    // ============================================================
    // В Excel для субсидий:
    // contractAmount = objectCost / (1 - (1 - pvRate) * subsidyRate)
    //
    // Где:
    // pvRate = userDownPaymentPercent / 100 (20.1% = 0.201)
    // subsidyRate = bankOffer.subsidyPercent / 100
    //
    // contractAmount = 10 000 000 / (1 - 0.799 * subsidyRate)

    const pvRate = userDownPaymentPercent / 100;
    const subsidyRate = bankOffer.subsidyPercent / 100;

    contractAmount = objectCost / (1 - (1 - pvRate) * subsidyRate);

    // Проверяем, что сумма не меньше стоимости объекта
    if (contractAmount < objectCost) {
      contractAmount = objectCost;
    }

    console.log(
      `🏦 ${bankOffer.type === "full" ? "Full" : "Short"} субсидия:`,
      {
        objectCost,
        pvRate,
        subsidyRate,
        contractAmount,
        formula: `${objectCost} / (1 - ${(1 - pvRate).toFixed(4)} * ${subsidyRate})`,
      },
    );
  } else {
    // ============================================================
    // СТАНДАРТНЫЙ РАСЧЕТ (без субсидии, семейная, ИТ)
    // ============================================================
    if (downPayment <= actualMinDownPayment) {
      contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
      console.log(`📊 Стандартный расчет (мин ПВ): ${contractAmount}`);
    } else {
      contractAmount =
        remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
      console.log(`📊 Стандартный расчет (большой ПВ): ${contractAmount}`);
    }
  }

  // ============================================================
  // 4. ПРОВЕРКА ЛИМИТОВ ДЛЯ СЕМЕЙНОЙ/ИТ ИПОТЕКИ
  // ============================================================
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

  console.log("🏦 Итоговый contractAmount:", {
    objectCost,
    contractAmount: Math.ceil(contractAmount),
    subsidyPercent: bankOffer.subsidyPercent,
    type: bankOffer.type,
    hasSubsidy,
  });

  return Math.ceil(contractAmount);
};
