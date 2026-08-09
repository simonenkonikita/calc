// backend/src/services/ComplexService.ts

import { AppDataSource } from "../data-source";
import { Complex } from "../entities/Complex";
import { ApartmentType } from "../entities/ApartmentType";
import { ProgramService } from "./ProgramService";

export class ComplexService {
  private complexRepository = AppDataSource.getRepository(Complex);
  private apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);
  private programService = new ProgramService();

  async getAllComplexes(): Promise<Complex[]> {
    const complexes = await this.complexRepository.find({
      relations: ["apartmentTypes"],
      order: { name: "ASC" },
    });

    // 🔥 Добавляем программы к каждому ЖК
    for (const complex of complexes) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return complexes;
  }

  async getComplexByName(name: string): Promise<Complex | null> {
    const complex = await this.complexRepository.findOne({
      where: { name },
      relations: ["apartmentTypes"],
    });

    if (complex) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return complex;
  }

  async getComplexById(id: string): Promise<Complex | null> {
    const complex = await this.complexRepository.findOne({
      where: { id },
      relations: ["apartmentTypes"],
    });

    if (complex) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return complex;
  }

  async getApartmentTypes(complexId: string): Promise<ApartmentType[]> {
    const complex = await this.complexRepository.findOne({
      where: { id: complexId },
      relations: ["apartmentTypes"],
    });
    return complex?.apartmentTypes || [];
  }
}
