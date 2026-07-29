import { variables } from "../../data/limitdDate";

export const getMinExcessAmount = (bankName: string): number => {
  // Если для банка есть своя минимальная сумма - используем её
  if (variables.minExcessAmounts && variables.minExcessAmounts[bankName]) {
    return variables.minExcessAmounts[bankName];
  }
  return 6000000;
};
