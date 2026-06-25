import {
  BankCoefficients,
  BankOffer,
  Variables,
} from "../../../../utils/types";

// ========== РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ДЛЯ СЕМЕЙНОЙ/ИТ ==========
export const calculateFamilyContractAmount = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number,
  userDownPaymentPercent: number,
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  applyMinDownPayment: boolean,
  coefficients: BankCoefficients,
): number => {
  const limit = variables.familyMortgageLimit; // Переменные!$B$1 (6 000 000)
  const subsidyPercent = bankOffer.subsidyPercent; // Сбербанк!E16
  const minPVPercent = bankOffer.minPVPercent;
  /*   const maxPVPercent = 79.9; */

  // Расчеты для условий
  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const bankMinDownPayment = objectCost * (minPVPercent / 100);
  const actualMinDownPayment = applyMinDownPayment
    ? bankMinDownPayment
    : userDesiredDownPayment;

  let summCredit: number;
  let isWithinLimit: boolean;

  if (mortgageWithoutDownPayment) {
    // При ипотеке без ПВ считаем лимит через requiredCoeffWithoutPV
    // Сумма кредита = remainingAmount * requiredCoeffWithoutPV + objectCost - downPayment
    summCredit =
      (remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment) *
      (userDownPaymentPercent / 100);

    // Проверяем, вписывается ли сумма договора в лимит
    // При ипотеке без ПВ сумма кредита = contractAmount (так как ПВ = 0)
    isWithinLimit = summCredit <= limit;
  } else {
    // Стандартный расчет (с ПВ)
    summCredit =
      (objectCost / coefficients.requiredCoeffWithMinPV) *
      (1 - userDownPaymentPercent / 100);
    isWithinLimit = summCredit <= limit;
  }

  // ============================================================
  // ПРОВЕРКА: ВПИСЫВАЕМСЯ ЛИ В ЛИМИТ
  // ($B$7/Сбербанк!J16)*(1-$B$8/100) <= Переменные!$B$1
  // ============================================================

  /*   const summCredit =
    (objectCost / coefficients.requiredCoeffWithMinPV) *
    (1 - userDownPaymentPercent / 100);
  const isWithinLimit = summCredit <= limit;
 */

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
    // Проверяем, вписывается ли в лимит
    if (!isWithinLimit) {
      // ❌ Не вписываемся в лимит → ипотека без ПВ НЕ работает
      // Переключаемся на стандартный расчет с ПВ
      // Используем стандартную формулу с учетом лимита
      if (noSubsidyInflate) {
        return Math.ceil(objectCost); // ✅ уже есть
      }

      return objectCost + limit * (subsidyPercent / 100);
    }

    // ✅ Вписываемся в лимит → ипотека без ПВ работает
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

  // ============================================================
  // 3. ОСНОВНАЯ ФОРМУЛА РАСЧЕТА СУММЫ В ДОГОВОРЕ
  // ============================================================
  let contractAmount: number;

  // =ЕСЛИ(($B$7/Сбербанк!J16)*(1-$B$8/100)<=Переменные!$B$1;
  //    ЕСЛИ(И($L$10=ИСТИНА;$B$13<($B$14*Сбербанк!L16+$B$7-$B$13)*$B$8/100);
  //       $B$14*Сбербанк!L16+$B$7-$B$13;
  //       ЕСЛИ($B$13<=$B$7*$B$8/100;
  //          $B$7/Сбербанк!J16;
  //          $B$14/Сбербанк!K16+$B$13
  //       )
  //    );
  //    $B$7+Переменные!$B$1*Сбербанк!E16/100
  // )

  if (isWithinLimit) {
    // ============================================================
    // ВЕТКА TRUE: ВПИСЫВАЕМСЯ В ЛИМИТ
    // ============================================================

    // Проверяем условие: И($L$10=ИСТИНА; $B$13<($B$14*Сбербанк!L16+$B$7-$B$13)*$B$8/100)
    // где $L$10 - mortgageWithoutDownPayment
    // $B$14*Сбербанк!L16+$B$7-$B$13 - это формула для threshold
    const thresholdForCondition =
      remainingAmount * coefficients.requiredCoeffWithoutPV +
      objectCost -
      downPayment;

    const isThresholdCondition =
      mortgageWithoutDownPayment &&
      downPayment < thresholdForCondition * (userDownPaymentPercent / 100);

    if (isThresholdCondition) {
      // $B$14*Сбербанк!L16+$B$7-$B$13
      contractAmount =
        remainingAmount * coefficients.requiredCoeffWithoutPV +
        objectCost -
        downPayment;
    } else {
      // ЕСЛИ($B$13<=$B$7*$B$8/100; $B$7/Сбербанк!J16; $B$14/Сбербанк!K16+$B$13)
      if (downPayment <= actualMinDownPayment) {
        // $B$7/Сбербанк!J16
        contractAmount = objectCost / coefficients.requiredCoeffWithMinPV;
      } else {
        // $B$14/Сбербанк!K16+$B$13
        contractAmount =
          remainingAmount / coefficients.requiredCoeffWithLargePV + downPayment;
      }
    }
  } else {
    if (noSubsidyInflate) {
      return Math.ceil(objectCost);
    }
    // ============================================================
    // ВЕТКА FALSE: НЕ ВПИСЫВАЕМСЯ В ЛИМИТ (СВЕРХЛИМИТ)
    // ============================================================
    // $B$7 + Переменные!$B$1 * Сбербанк!E16 / 100
    contractAmount = objectCost + limit * (subsidyPercent / 100);
  }

  /*  // ============================================================
  // 4. ПРОВЕРКА НА МАКСИМАЛЬНЫЙ ПВ (79.9%)
  // ============================================================
  // Проверяем, что ПВ не превышает 79.9% от суммы договора
  const maxPVAmount = contractAmount * (maxPVPercent / 100);
  if (downPayment > maxPVAmount) {
    // Пересчитываем сумму договора, чтобы ПВ был не более 79.9%
    contractAmount = downPayment / (maxPVPercent / 100);
  }

  // ============================================================
  // 5. ПРОВЕРКА НА МИНИМАЛЬНЫЙ ПВ
  // ============================================================
  // Проверяем, что ПВ не меньше минимального
  const minPVAmount = contractAmount * (minPVPercent / 100);
  if (downPayment < minPVAmount && !mortgageWithoutDownPayment) {
    // Корректируем сумму договора
    contractAmount = downPayment / (minPVPercent / 100);
  } */

  return Math.ceil(contractAmount);
};
