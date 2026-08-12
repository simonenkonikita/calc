// backend/src/services/ComplexService.ts

import { AppDataSource } from "../data-source";
import { Complex } from "../entities/Complex";
import { ApartmentType } from "../entities/ApartmentType";
import { ProgramService } from "./ProgramService";
import { CreateComplexDTO, UpdateComplexDTO } from "../dtos/ComplexDto";

export class ComplexService {
  private complexRepository = AppDataSource.getRepository(Complex);
  private apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);
  private programService = new ProgramService();

  /**
   * Получить все ЖК
   */
  async getAllComplexes(): Promise<Complex[]> {
    const complexes = await this.complexRepository.find({
      relations: ["apartmentTypes"],
      order: { name: "ASC" },
    });

    for (const complex of complexes) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return complexes;
  }

  /**
   * Получить ЖК по имени
   */
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

  /**
   * Получить ЖК по ID
   */
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

  /**
   * Создать ЖК
   */
  async createComplex(data: CreateComplexDTO): Promise<Complex> {
    // Генерируем slug из названия
    const { generateSlug } = await import("../utils/slugify");
    const slug = generateSlug(data.name);

    // Создаем комплекс
    const complex = this.complexRepository.create({
      name: data.name,
      slug: slug,
      status: data.status,
      description: data.description || "",
      banks: data.banks || [],
      paymentTerms: data.paymentTerms || [],
      promotions: data.promotions || [],
      specialOffers: data.specialOffers || [],
      materialsLink: data.materialsLink || "",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await this.complexRepository.save(complex);

    // Возвращаем с отношениями
    return this.getComplexById(complex.id) as Promise<Complex>;
  }

  /**
   * Обновить ЖК
   */
  async updateComplex(id: string, data: UpdateComplexDTO): Promise<Complex> {
    const complex = await this.complexRepository.findOne({
      where: { id },
      relations: ["apartmentTypes"],
    });

    if (!complex) {
      throw new Error("Complex not found");
    }

    // Обновляем поля
    if (data.name !== undefined) complex.name = data.name;
    if (data.status !== undefined) complex.status = data.status;
    if (data.description !== undefined) complex.description = data.description;
    if (data.banks !== undefined) complex.banks = data.banks;
    if (data.paymentTerms !== undefined) complex.paymentTerms = data.paymentTerms;
    if (data.promotions !== undefined) complex.promotions = data.promotions;
    if (data.specialOffers !== undefined) complex.specialOffers = data.specialOffers;
    if (data.materialsLink !== undefined) complex.materialsLink = data.materialsLink;
    if (data.isActive !== undefined) complex.isActive = data.isActive;

    // Если изменилось имя, обновляем slug
    if (data.name && data.name !== complex.name) {
      const { generateSlug } = await import("../utils/slugify");
      complex.slug = generateSlug(data.name);
    }

    await this.complexRepository.save(complex);

    // Возвращаем обновленный комплекс с отношениями
    return this.getComplexById(id) as Promise<Complex>;
  }

  /**
   * Удалить ЖК
   */
  async deleteComplex(id: string): Promise<boolean> {
    const result = await this.complexRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  /**
   * Получить типы квартир для ЖК
   */
  async getApartmentTypes(complexId: string): Promise<ApartmentType[]> {
    const complex = await this.complexRepository.findOne({
      where: { id: complexId },
      relations: ["apartmentTypes"],
    });
    return complex?.apartmentTypes || [];
  }

  /**
   * Проверить существование ЖК
   */
  async complexExists(id: string): Promise<boolean> {
    const count = await this.complexRepository.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Получить ЖК по slug
   */
  async getComplexBySlug(slug: string): Promise<Complex | null> {
    const complex = await this.complexRepository.findOne({
      where: { slug },
      relations: ["apartmentTypes"],
    });

    if (complex) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return complex;
  }

  /**
   * Получить активные ЖК
   */
  async getActiveComplexes(): Promise<Complex[]> {
    const complexes = await this.complexRepository.find({
      where: { isActive: true },
      relations: ["apartmentTypes"],
      order: { name: "ASC" },
    });

    for (const complex of complexes) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return complexes;
  }

  /**
   * Получить ЖК с фильтрацией по банкам
   */
  async getComplexesByBank(bankName: string): Promise<Complex[]> {
    const complexes = await this.complexRepository.find({
      where: {
        isActive: true,
      },
      relations: ["apartmentTypes"],
      order: { name: "ASC" },
    });

    // Фильтруем по банкам
    const filtered = complexes.filter(
      (complex) => complex.banks && complex.banks.includes(bankName)
    );

    for (const complex of filtered) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return filtered;
  }
}