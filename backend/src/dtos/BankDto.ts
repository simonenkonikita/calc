// backend/src/dtos/BankDto.ts

// ============================================================
// DTO для создания/обновления банка
// ============================================================
export interface CreateBankDTO {
  name: string;
  baseRate: number;
  minPVPercent: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateBankDTO {
  name?: string;
  baseRate?: number;
  minPVPercent?: number;
  displayOrder?: number;
  isActive?: boolean;
}

// ============================================================
// DTO для ответа с банком
// ============================================================
export interface BankResponseDTO {
  id: string;
  name: string;
  slug: string;
  baseRate: number;
  minPVPercent: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// DTO для списка банков (краткий)
// ============================================================
export interface BankListDTO {
  id: string;
  name: string;
  slug: string;
  baseRate: number;
  isActive: boolean;
}
