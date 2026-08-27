import { variables } from "../../data/limitdDate";

export const getMinExcessAmount = (
  bankName: string,
  isIt: boolean = false, // ← Добавляем параметр
): number => {
  // Выбираем правильный объект с минимальными суммами
  const minAmounts = isIt
    ? variables.minExcessAmountsIt
    : variables.minExcessAmountsFamily;

  // Если для банка есть своя минимальная сумма - используем её
  if (minAmounts && minAmounts[bankName]) {
    return minAmounts[bankName];
  }

  // Значение по умолчанию
  return isIt ? 9000000 : 6000000;
};
