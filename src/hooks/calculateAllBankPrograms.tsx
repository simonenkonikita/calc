import { BankOffer, Variables, BankProgramResult } from "../utils/types";
import { calculateBankProgram } from "./calculateBankProgram";

// ========== РАСЧЕТ ДЛЯ ВСЕХ ПРОГРАММ БАНКА ==========
export const calculateAllBankPrograms = (
  objectCost: number,
  downPayment: number,
  remainingAmount: number, // Добавлен параметр
  loanTermYears: number,
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
        loanTermYears,
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
