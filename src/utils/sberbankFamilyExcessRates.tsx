import { variables } from "../data/limitdDate";
import { getMinExcessAmount } from "./badge/getMinExcessAmount";


export const getMaxExcessAmount = (): number => {
  return variables.maxFamilyMortgageSum || 15000000;
};

export const isValidExcessAmount = (
  mortgageAmount: number,
  bankName: string,
): boolean => {
  const minAmount = getMinExcessAmount(bankName);
  const maxAmount = getMaxExcessAmount();
  return mortgageAmount >= minAmount && mortgageAmount <= maxAmount;
};

export const getExcessAmountError = (
  mortgageAmount: number,
  bankName: string,
): string | null => {
  const minAmount = getMinExcessAmount(bankName);
  const maxAmount = getMaxExcessAmount();

  if (mortgageAmount < minAmount) {
    return `⚠️ Минимальная сумма ипотеки для сверхлимитной программы ${minAmount.toLocaleString()} ₽`;
  }

  if (mortgageAmount > maxAmount) {
    return `⚠️ Максимальная сумма ипотеки для сверхлимитной программы ${maxAmount.toLocaleString()} ₽`;
  }

  return null;
};

export const getExcessLimitInfo = (bankName: string) => {
  const minAmount = getMinExcessAmount(bankName);
  const maxAmount = getMaxExcessAmount();

  return {
    minAmount,
    maxAmount,
    isBankSpecific: !!variables.minExcessAmounts?.[bankName],
    displayText: variables.minExcessAmounts?.[bankName]
      ? `Сверхлимит (от ${minAmount.toLocaleString()} ₽)`
      : `Сумма от ${minAmount.toLocaleString()} ₽`,
  };
};
