import {
  CalculatorFormData,
  ObjectCalculationResult,
  BankOffer,
  BankCoefficients,
  Variables,
  BankProgramResult,
} from "../utils/types";

// ========== КОНСТАНТЫ ==========
const DEFAULT_MIN_PV_PERCENT = 20.1;

// ========== 1. РАСЧЕТ СТОИМОСТИ ОБЪЕКТА ==========
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

// ========== 2. РАСЧЕТ ПЕРВОНАЧАЛЬНОГО ВЗНОСА ==========
export const calculateDownPayment = (
  objectCost: number,
  formData: CalculatorFormData,
  minPVPercent: number = DEFAULT_MIN_PV_PERCENT,
): number => {
  const {
    mortgageWithoutDownPayment,
    applyMinDownPayment,
    manualDownPayment,
    downPaymentPercent,
  } = formData;

  const minDownPayment = objectCost * (minPVPercent / 100); // Мин ПВ в рублях
  const calculatedPercentDown = objectCost * (downPaymentPercent / 100); // Мин ПВ указанный в  %

  // Ипотека без ПВ
  if (mortgageWithoutDownPayment) {
    // Если ручной ввод больше стоимости объекта
    if (manualDownPayment > minDownPayment) {
      return Math.ceil(minDownPayment);
    }
    return manualDownPayment;
  }

  if (applyMinDownPayment) {
    return Math.ceil(minDownPayment);
  }

  // Если есть ручной ввод ПВ
  if (manualDownPayment && manualDownPayment > 0) {
    // Проверяем, что ручной ввод в допустимых пределах
    if (
      manualDownPayment >= minDownPayment &&
      manualDownPayment <= objectCost
    ) {
      return Math.ceil(manualDownPayment);
    }
    // Если ручной ввод меньше минимального
    if (manualDownPayment < minDownPayment) {
      return Math.ceil(minDownPayment);
    }
    // Если ручной ввод больше стоимости объекта
    if (manualDownPayment > objectCost) {
      return Math.ceil(minDownPayment);
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

  return Math.ceil(result);
};

// ========== 3. РАСЧЕТ КОЭФФИЦИЕНТОВ БАНКА ==========
export const calculateBankCoefficients = (
  bankOffer: BankOffer,
): BankCoefficients => {
  const downPaymentPercent = bankOffer.minPVPercent;
  const mortgagePercent = 100 - downPaymentPercent;

  const kefDownPayment = downPaymentPercent / mortgagePercent;
  const subsidyPercent = bankOffer.subsidyPercent;
  const creditFromSubsidyPercent = 100 - subsidyPercent;
  const kefSubsidy = subsidyPercent / creditFromSubsidyPercent;
  // Каэффициент ипотеки: (сумма ипотеки) / 100
  const mortgageCoefficient = (mortgagePercent * (100 - subsidyPercent)) / 100;
  // Каэффициент завышения: 100 - mortgageCoefficient * 100
  const overstatementCoefficient = 100 - mortgageCoefficient;

  // Искомый каэф с мин ПВ
  const requiredCoeffWithMinPV =
    1 - (subsidyPercent / 100) * (mortgagePercent / 100);
  // Искомый каэф с большим ПВ
  const requiredCoeffWithLargePV = 1 - subsidyPercent / 100;
  // Искомый каэф без  ПВ
  const requiredCoeffWithoutPV = overstatementCoefficient / mortgageCoefficient;

  console.log(
    downPaymentPercent,
    mortgagePercent,
    kefDownPayment,
    subsidyPercent,
    creditFromSubsidyPercent,
    kefSubsidy,
    mortgageCoefficient,
    overstatementCoefficient,
    requiredCoeffWithMinPV,
    requiredCoeffWithLargePV,
    requiredCoeffWithoutPV,
  );

  return {
    programName: bankOffer.program,
    downPaymentPercent,
    mortgagePercent,
    kefDownPayment,
    subsidyPercent,
    creditFromSubsidyPercent,
    kefSubsidy,
    mortgageCoefficient,
    overstatementCoefficient,
    requiredCoeffWithMinPV,
    requiredCoeffWithLargePV,
    requiredCoeffWithoutPV,
  };
};

// ========== 4. РАСЧЕТ СУММЫ В ДОГОВОРЕ (ЗАВЫШЕНИЕ) ==========
export const calculateContractAmount = (
  objectCost: number, // $B$7 - стоимость объекта
  downPayment: number, // $B$13 - сумма ПВ
  remainingAmount: number, // $B$14 - сумма ипотеки (objectCost - downPayment)
  userDownPaymentPercent: number, // $B$8 - процент ПВ из формы
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean, // $L$9 - не завышать на субсидию
  mortgageWithoutDownPayment: boolean, // $L$10 - ипотека без ПВ
  applyMinDownPayment: boolean, // $L$11 - применить мин ПВ
): number => {
  const coefficients = calculateBankCoefficients(bankOffer);
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

// ========== 5. РАСЧЕТ ВСЕХ ПАРАМЕТРОВ ПО БАНКОВСКОЙ ПРОГРАММЕ ==========
export const calculateBankProgram = (
  objectCost: number, // $B$7 - стоимость объекта
  downPayment: number, // $B$13 - получивщаяся сумма ПВ от стоимость объекта
  remainingAmount: number, // $B$14 - сумма ипотеки (objectCost - downPayment)
  userDownPaymentPercent: number, // $B$8 - процент ПВ из формы
  bankOffer: BankOffer,
  variables: Variables,
  noSubsidyInflate: boolean, // $L$9 - не завышать на субсидию
  mortgageWithoutDownPayment: boolean, // $L$10 - ипотека без ПВ
  applyMinDownPayment: boolean, // $L$11 - применить мин ПВ
): BankProgramResult => {
  // 1. Расчет суммы в договоре (завышение)
  const contractAmount = calculateContractAmount(
    objectCost,
    downPayment,
    remainingAmount,
    userDownPaymentPercent,
    bankOffer,
    variables,
    noSubsidyInflate,
    mortgageWithoutDownPayment,
    applyMinDownPayment,
  );

  // Завышение
  const overstatement = contractAmount - objectCost;

  // 2. Расчет суммы ПВ (как в Excel: =IF($B$13<$B$7*$B$8/100, C18*$B$8/100, IF($B$13>=C18*$B$8/100, $B$13, C18*$B$8/100)))
  let downPaymentAmount: number;
  let ownFunds: number;

  const userDesiredDownPayment = objectCost * (userDownPaymentPercent / 100);
  const downPaymentFromContract =
    contractAmount * (userDownPaymentPercent / 100);

  // Cуммы ПВ
  if (downPayment < userDesiredDownPayment) {
    downPaymentAmount = contractAmount * (userDownPaymentPercent / 100);
  } else if (downPayment >= downPaymentFromContract) {
    downPaymentAmount = downPayment;
  } else {
    downPaymentAmount = downPaymentFromContract;
  }
  downPaymentAmount = Math.ceil(downPaymentAmount);

  // 3. Собственные средства (E = D - B13 в Excel)
  if (mortgageWithoutDownPayment) {
    ownFunds = downPayment;
  } else {
    ownFunds = downPaymentAmount;
  }

  // 4. Вносим за клиента (F = D - E в Excel)
  const clientContribution = downPaymentAmount - ownFunds;

  // 5. ПВ в процентах (G = D / C * 100 в Excel)
  const downPaymentPercentCalc = (downPaymentAmount / contractAmount) * 100;

  // 6. Сумма ипотеки (I = C - D в Excel)
  const mortgageAmount = contractAmount - downPaymentAmount;

  // 7. Сумма субсидии (J = I * subsidyPercent / 100 в Excel)
  let subsidyAmount = mortgageAmount * (bankOffer.subsidyPercent / 100);

  // 8. Сверхлимит (H) и коррекция субсидии
  let excessLimit: number | undefined;
  if (bankOffer.excessLimit) {
    if (bankOffer.type === "family") {
      const maxSubsidy =
        variables.familyMortgageLimit * (bankOffer.subsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.familyMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    } else if (bankOffer.type === "it") {
      const maxSubsidy =
        variables.itMortgageLimit * (bankOffer.subsidyPercent / 100);
      if (subsidyAmount > maxSubsidy) {
        subsidyAmount = maxSubsidy;
        excessLimit = mortgageAmount - variables.itMortgageLimit;
        if (excessLimit < 0) excessLimit = 0;
      }
    }
  }

  // 9. На счет застройщика (K в Excel: =IF($L$10=TRUE,E+I-J, C-J))
  let developerAccount: number;

  if (mortgageWithoutDownPayment) {
    developerAccount = ownFunds + mortgageAmount - subsidyAmount;
  } else {
    developerAccount = contractAmount - subsidyAmount;
  }

  // 10. Ежемесячный платеж (аннуитетный)
  const monthlyPayment = calculateMonthlyPayment(
    mortgageAmount,
    bankOffer.rate,
    bankOffer.durationMonths || 360, // если не указан срок, то 30 лет
  );

  return {
    bank: bankOffer.bank,
    program: bankOffer.program,
    type: bankOffer.type,
    rate: bankOffer.rate,
    durationMonths: bankOffer.durationMonths,
    monthlyPayment: Math.ceil(monthlyPayment),
    overstatement: Math.ceil(overstatement),
    contractAmount: Math.ceil(contractAmount),
    downPaymentAmount: Math.ceil(downPaymentAmount),
    ownFunds: Math.ceil(ownFunds),
    clientContribution: Math.ceil(clientContribution),
    downPaymentPercent: Number(downPaymentPercentCalc.toFixed(1)),
    minPVPercent: bankOffer.minPVPercent,
    excessLimit: excessLimit ? Math.ceil(excessLimit) : undefined,
    mortgageAmount: Math.ceil(mortgageAmount),
    subsidyAmount: Math.ceil(subsidyAmount),
    developerAccount: Math.ceil(developerAccount),
  };
};

// ========== 6. РАСЧЕТ ЕЖЕМЕСЯЧНОГО ПЛАТЕЖА (АННУИТЕТ) ==========
export const calculateMonthlyPayment = (
  loanAmount: number,
  annualRate: number,
  months: number,
): number => {
  if (annualRate === 0 || loanAmount === 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  const annuityCoefficient =
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return loanAmount * annuityCoefficient;
};

// ========== 7. РАСЧЕТ ДЛЯ ВСЕХ ПРОГРАММ БАНКА ==========
export const calculateAllBankPrograms = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number, // Добавлен параметр
  downPaymentPercent: number, // Добавлен параметр
  bankOffers: BankOffer[],
  variables: Variables,
  noSubsidyInflate: boolean,
  mortgageWithoutDownPayment: boolean,
  applyMinDownPayment: boolean,
): BankProgramResult[] => {
  const results: BankProgramResult[] = [];

  for (const offer of bankOffers) {
    // Пропускаем программы с нулевой ставкой (базовые, пока нет расчёта)
    // Но для семейной и ИТ ипотеки с isTwoContracts пропускаем по другой логике
    if (
      offer.rate === 0 &&
      offer.subsidyPercent === 0 &&
      !offer.isTwoContracts
    ) {
      continue;
    }

    // Для Совкомбанка с isTwoContracts нужна специальная логика
    if (offer.isTwoContracts) {
      // TODO: добавить специальную логику для 2 договоров
      continue;
    }

    try {
      const result = calculateBankProgram(
        objectCost,
        downPayment,
        remainingAmount,
        downPaymentPercent,
        offer,
        variables,
        noSubsidyInflate,
        mortgageWithoutDownPayment,
        applyMinDownPayment,
      );
      results.push(result);
    } catch (error) {
      console.error(
        `Ошибка расчета для ${offer.bank} - ${offer.program}:`,
        error,
      );
    }
  }

  // Сортируем по ежемесячному платежу (от меньшего к большему)
  return results.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
};

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

  // 4. Расчет для каждого банка
  const bankResults: BankProgramResult[] = [];

  for (const offer of bankOffers) {
    try {
      const result = calculateBankProgram(
        objectCost,
        downPayment,
        remainingAmount,
        formData.downPaymentPercent,
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

// ========== 9. ДИНАМИЧЕСКИЕ СУБСИДИИ ДЛЯ СОВКОМБАНКА ==========
export const getSovcombankSubsidyByDownPayment = (
  downPaymentPercent: number,
  baseSubsidy: number,
): number => {
  if (downPaymentPercent >= 50) {
    return baseSubsidy - 0.7; // Пример: 14.7 вместо 15.4
  } else if (downPaymentPercent >= 30) {
    return baseSubsidy - 0.2; // Пример: 15.2 вместо 15.4
  }
  return baseSubsidy;
};

// ========== 10. ФОРМАТИРОВАНИЕ ДЕНЕГ ==========
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (percent: number): string => {
  return `${percent.toFixed(2)}%`;
};
