// backend/src/services/calculations/coefficients/getDynamicRate.ts

import { Offer } from "../../../entities/Offer";
import { DynamicRateRule } from "../../../types/types";

const checkCondition = (
  rule: DynamicRateRule,
  pv: number,
  amount: number,
  term: number,
): boolean => {
  if (rule.conditionFn) {
    return rule.conditionFn(pv, amount, term);
  }

  if (rule.type && rule.condition && rule.value !== undefined) {
    let actualValue: number;
    switch (rule.type) {
      case "pv": actualValue = pv; break;
      case "amount": actualValue = amount; break;
      case "term": actualValue = term; break;
      default: return false;
    }

    switch (rule.condition) {
      case "gte": return actualValue >= rule.value;
      case "lte": return actualValue <= rule.value;
      case "lt": return actualValue < rule.value;
      case "gt": return actualValue > rule.value;
      case "eq": return actualValue === rule.value;
      default: return false;
    }
  }

  return false;
};

export const getDynamicRate = (
  offer: Offer,
  pvPercent: number,
  mortgageAmount: number,
  loanTerm: number = 30,
): number => {
  const dynamicRates = offer.dynamicRates || [];

  if (dynamicRates.length > 0) {
    const rules: DynamicRateRule[] = dynamicRates
      .filter(rate => rate.isActive !== false)
      .map(rate => ({
        conditionFn: rate.conditionMetadata?.conditionFn,
        type: rate.conditionType as 'pv' | 'amount' | 'term' | undefined,
        condition: rate.condition as 'gte' | 'lte' | 'lt' | 'gt' | 'eq' | undefined,
        value: rate.value,
        minValue: rate.minValue,
        maxValue: rate.maxValue,
        rate: rate.rate,
        priority: rate.priority,
        description: rate.description,
      }));

    const sortedRules = [...rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0),
    );

    for (const rule of sortedRules) {
      const isMatch = checkCondition(rule, pvPercent, mortgageAmount, loanTerm);
      if (isMatch && rule.rate !== undefined) {
        return rule.rate;
      }
    }
  }

  return offer.rate;
};