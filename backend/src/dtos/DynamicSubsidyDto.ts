// backend/src/dtos/DynamicSubsidyDto.ts

export interface CreateDynamicSubsidyDTO {
  minPVPercent?: number | null;
  maxPVPercent?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  minTerm?: number | null;
  maxTerm?: number | null;
  subsidyPercent: number;
  priority?: number;
  description?: string;
  roundingStrategy?: string | null;
  conditionMetadata?: any;
  isActive?: boolean;
}

export interface UpdateDynamicSubsidyDTO extends Partial<CreateDynamicSubsidyDTO> {
  id: string;
}
