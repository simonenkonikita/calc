import { SubsidyPaymentResult } from "../../../../utils/types";
import { calculateOnlyPercenkSubsidy } from "./calculateOnlyPercenkSubsidy";
import { calculateStandardSubsidy } from "./calculateStandardSubsidy";

// ========== УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ==========
export const calculateSubsidyPayments = (
  mortgageAmount: number,
  shortRate: number,
  rate: number,
  loanTermMonths: number,
  durationMonths: number,
  method: "onlyPercent" | "standard" = "standard",
): SubsidyPaymentResult => {
  if (method === "onlyPercent") {
    return calculateOnlyPercenkSubsidy(
      mortgageAmount,
      shortRate,
      rate,
      loanTermMonths,
      durationMonths,
    );
  }

  return calculateStandardSubsidy(
    mortgageAmount,
    shortRate,
    rate,
    loanTermMonths,
    durationMonths,
  );
};
