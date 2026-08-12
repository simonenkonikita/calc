// backend/src/dtos/ProgramDto.ts

export interface CreateProgramDTO {
  type: string;
  label: string;
  icon?: string;
  color?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateProgramDTO {
  type?: string;
  label?: string;
  icon?: string;
  color?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ProgramResponseDTO {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
