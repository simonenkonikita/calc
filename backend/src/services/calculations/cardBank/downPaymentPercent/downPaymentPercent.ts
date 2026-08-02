export const calculateDownPaymentPercent = (
  downPaymentAmount: number,
  contractAmount: number,
): number => {
  if (contractAmount <= 0) {
    return 0;
  }

  return (downPaymentAmount / contractAmount) * 100;
};
