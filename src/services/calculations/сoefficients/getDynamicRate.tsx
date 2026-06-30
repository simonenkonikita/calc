// src/hooks/сoefficients/getDynamicRate.ts

import { BankOffer, DynamicRateRule } from "../../../utils/types";

/**
 * Проверка условия правила
 */
const checkCondition = (
  rule: DynamicRateRule,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  // 1. Если есть conditionFn - используем её (сложные условия)
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

  // 2. Если есть type и condition - используем простые условия
  if (rule.type && rule.condition && rule.value !== undefined) {
    let actualValue: number;

    switch (rule.type) {
      case "pv":
        actualValue = pv;
        break;
      case "amount":
        actualValue = amount;
        break;
      case "term":
        actualValue = term;
        break;
      default:
        return false;
    }

    switch (rule.condition) {
      case "gte":
        return actualValue >= rule.value;
      case "lte":
        return actualValue <= rule.value;
      case "lt":
        return actualValue < rule.value;
      case "gt":
        return actualValue > rule.value;
      case "eq":
        return actualValue === rule.value;
      default:
        return false;
    }
  }

  return false;
};

/**
 * Получение динамической ставки
 */
export const getDynamicRate = (
  bankOffer: BankOffer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  // 🔥 1. Проверяем наличие dynamicRateCalculator (для сверхлимита и сложных расчетов)
  if (bankOffer.dynamicRateCalculator) {
    return bankOffer.dynamicRateCalculator(mortgageAmount);
  }

  // 🔥 2. Проверяем наличие dynamicRates
  if (bankOffer.dynamicRates && bankOffer.dynamicRates.length > 0) {
    // Сортируем по приоритету (от большего к меньшему)
    const sortedRules = [...bankOffer.dynamicRates].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    // Проверяем каждое правило
    for (const rule of sortedRules) {
      const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);

      if (isMatch) {
        // Если есть rateFn - вычисляем ставку
        if (rule.rateFn) {
          return rule.rateFn(bankOffer.rate, pvPercent, mortgageAmount);
        }
        // Иначе используем фиксированную ставку
        if (rule.rate !== undefined) {
          return rule.rate;
        }
      }
    }
  }

  // 🔥 3. Если ничего не подошло - возвращаем базовую ставку
  return bankOffer.rate;
};

// 🔥 Функция для получения информации о ставке (для отображения в UI)
export const getDynamicRateInfo = (
  bankOffer: BankOffer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): {
  rate: number;
  source: "base" | "calculator" | "dynamicRule";
  description?: string;
  matchedRule?: DynamicRateRule;
} => {
  // Проверяем calculator
  if (bankOffer.dynamicRateCalculator) {
    return {
      rate: bankOffer.dynamicRateCalculator(mortgageAmount),
      source: "calculator",
      description: "Динамический калькулятор ставок",
    };
  }

  // Проверяем dynamicRates
  if (bankOffer.dynamicRates && bankOffer.dynamicRates.length > 0) {
    const sortedRules = [...bankOffer.dynamicRates].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    for (const rule of sortedRules) {
      const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);

      if (isMatch) {
        let rate = bankOffer.rate;
        if (rule.rateFn) {
          rate = rule.rateFn(bankOffer.rate, pvPercent, mortgageAmount);
        } else if (rule.rate !== undefined) {
          rate = rule.rate;
        }

        return {
          rate,
          source: "dynamicRule",
          description: rule.description || "Динамическое правило",
          matchedRule: rule,
        };
      }
    }
  }

  // Базовая ставка
  return {
    rate: bankOffer.rate,
    source: "base",
    description: "Базовая ставка",
  };
};

// 🔥 Функция для проверки, является ли ставка динамической
export const isDynamicRate = (bankOffer: BankOffer): boolean => {
  return !!(
    bankOffer.dynamicRateCalculator ||
    (bankOffer.dynamicRates && bankOffer.dynamicRates.length > 0)
  );
};

// 🔥 Функция для получения всех возможных ставок (для отображения матрицы)
export const getAllPossibleRates = (
  bankOffer: BankOffer,
  pvPercent: number = 20.1,
): { amount: number; rate: number; description?: string }[] => {
  if (!bankOffer.dynamicRates || bankOffer.dynamicRates.length === 0) {
    return [];
  }

  const result: { amount: number; rate: number; description?: string }[] = [];

  // Для каждого правила получаем ставку
  for (const rule of bankOffer.dynamicRates) {
    // Пытаемся получить сумму из описания
    let amount = 0;
    if (rule.description) {
      // Ищем числа в описании
      const match = rule.description.match(/(\d+[.,]?\d*)\s*млн/);
      if (match) {
        amount = parseFloat(match[1].replace(",", ".")) * 1000000;
      }
    }

    let rate = bankOffer.rate;
    if (rule.rate !== undefined) {
      rate = rule.rate;
    } else if (rule.rateFn) {
      rate = rule.rateFn(bankOffer.rate, pvPercent, amount || 10000000);
    }

    result.push({
      amount: amount || 0,
      rate,
      description: rule.description,
    });
  }

  // Сортируем по сумме
  return result.sort((a, b) => a.amount - b.amount);
};
