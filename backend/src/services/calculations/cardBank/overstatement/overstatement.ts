export const calculateOverstatement = (
  contractAmount: number,
  objectCost: number,
): number => {
  return contractAmount - objectCost;
};
