// backend/src/dtos/OfferDto.ts

export interface DynamicRateRuleDTO {
  type?: "pv" | "amount" | "term";
  condition?: "gte" | "lte" | "lt" | "gt" | "eq";
  value?: number;
  minAmount?: number;
  maxAmount?: number;
  rate?: number;
  subsidyPercent?: number;
  priority?: number;
  description?: string;
  tolerance?: number;
  toleranceType?: "fixed" | "percent";
  roundingStrategy?: "up" | "down";
}

export interface SimpleDynamicRateDTO {
  minPVPercent: number;
  rate: number;
  description?: string;
}

export interface CreateOfferDTO {
  program: string;
  rate: number;
  twoRate?: number | null;
  shortRate?: number | null;
  subsidyPercent?: number;
  minPVPercent: number;
  durationMonths?: number | null;
  isTwoContracts?: boolean;
  excessLimit?: boolean;
  isTranche?: boolean;
  trancheFirstPercent?: number | null;
  trancheSecondDate?: string | null;
  complexes?: string[] | null;
  bankId: string;
  programId: string;
  subsidyCalculationMethod?: string | null;
  dynamicRatesIU?: SimpleDynamicRateDTO[] | null;
  dynamicSubsidyPercent?: DynamicRateRuleDTO[] | null;
  thresholdTolerance?: number | null;
  thresholdToleranceType?: string | null;
  roundingStrategy?: string | null;
  twoContractSubsidies?: DynamicRateRuleDTO[] | null;
  minLoanTermYears?: number | null;
  description?: string | null;
}

export interface UpdateOfferDTO extends Partial<CreateOfferDTO> {
  id: string;
}
