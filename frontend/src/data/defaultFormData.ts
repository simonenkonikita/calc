// frontend/src/data/defaultFormData.ts
import { CalculatorFormData } from "../utils/types";
import { DEFAULT_LOAN_TERM_YEARS } from "./constants";

export const defaultFormData: CalculatorFormData = {
  complex: "",
  apartmentType: "",
  area: 30,
  manualObjectCost: null,
  considerDepositInCost: false,
  downPaymentPercent: 20.1,
  manualDownPayment: 0,
  loanTerm: DEFAULT_LOAN_TERM_YEARS,
  projectFinancingBank: "Сбербанк",
  noSubsidyInflate: false,
  mortgageWithoutDownPayment: false,
  mortgagePartialDownPayment: false,
};
