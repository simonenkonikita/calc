// backend/src/services/ComplexService.ts

import { AppDataSource } from "../data-source";
import { Complex } from "../entities/Complex";
import { ApartmentType } from "../entities/ApartmentType";
import { ProgramService } from "./ProgramService";
import { CreateComplexDTO, UpdateComplexDTO } from "../dtos/ComplexDto";
import { NotificationService } from "./NotificationService";

export class ComplexService {
  private complexRepository = AppDataSource.getRepository(Complex);
  private apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);
  private programService = new ProgramService();
  private notificationService = new NotificationService();

  async getComplexesByCompany(companyId: string): Promise<Complex[]> {
    return this.complexRepository.find({
      where: { companyId, isActive: true },
      relations: ["apartmentTypes", "company"],
      order: { name: "ASC" },
    });
  }

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
  async createComplex(
    data: CreateComplexDTO,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Complex> {
    const { generateSlug } = await import("../utils/slugify");
    const slug = generateSlug(data.name);

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
      companyId: data.companyId,
      createdById: userId || null, // 🔥 ИСПРАВЛЕНО: null вместо undefined
    });

    await this.complexRepository.save(complex);

    if (complex.companyId) {
      await this.notificationService.notifyComplexCreated(
        { id: complex.id, name: complex.name, companyId: complex.companyId },
        {
          id: userId || "system",
          firstName: userFirstName || "Система",
          lastName: userLastName || "",
        },
      );
    }

    return this.getComplexById(complex.id) as Promise<Complex>;
  }

  /**
   * Обновить ЖК
   */
  async updateComplex(
    id: string,
    data: UpdateComplexDTO,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Complex> {
    const complex = await this.complexRepository.findOne({
      where: { id },
      relations: ["apartmentTypes"],
    });

    if (!complex) {
      throw new Error("Complex not found");
    }

    const changes: string[] = [];

    if (data.name !== undefined && data.name !== complex.name) {
      changes.push(`название с "${complex.name}" на "${data.name}"`);
    }
    if (data.status !== undefined && data.status !== complex.status) {
      changes.push(`статус с "${complex.status}" на "${data.status}"`);
    }
    if (
      data.banks !== undefined &&
      JSON.stringify(data.banks) !== JSON.stringify(complex.banks)
    ) {
      changes.push("список банков");
    }
    if (
      data.paymentTerms !== undefined &&
      JSON.stringify(data.paymentTerms) !== JSON.stringify(complex.paymentTerms)
    ) {
      changes.push("условия оплаты");
    }
    if (
      data.promotions !== undefined &&
      JSON.stringify(data.promotions) !== JSON.stringify(complex.promotions)
    ) {
      changes.push("акции");
    }
    if (
      data.specialOffers !== undefined &&
      JSON.stringify(data.specialOffers) !==
        JSON.stringify(complex.specialOffers)
    ) {
      changes.push("спецпредложения");
    }
    if (data.isActive !== undefined && data.isActive !== complex.isActive) {
      changes.push(data.isActive ? "ЖК активирован" : "ЖК деактивирован");
    }

    if (data.name !== undefined) complex.name = data.name;
    if (data.status !== undefined) complex.status = data.status;
    if (data.description !== undefined) complex.description = data.description;
    if (data.banks !== undefined) complex.banks = data.banks;
    if (data.paymentTerms !== undefined)
      complex.paymentTerms = data.paymentTerms;
    if (data.promotions !== undefined) complex.promotions = data.promotions;
    if (data.specialOffers !== undefined)
      complex.specialOffers = data.specialOffers;
    if (data.materialsLink !== undefined)
      complex.materialsLink = data.materialsLink;
    if (data.isActive !== undefined) complex.isActive = data.isActive;
    if (data.companyId !== undefined) complex.companyId = data.companyId;

    if (data.name && data.name !== complex.name) {
      const { generateSlug } = await import("../utils/slugify");
      complex.slug = generateSlug(data.name);
    }

    complex.updatedById = userId || null; // 🔥 ИСПРАВЛЕНО: null вместо undefined

    await this.complexRepository.save(complex);

    if (changes.length > 0 && complex.companyId) {
      await this.notificationService.notifyComplexChanges(
        { id: complex.id, name: complex.name, companyId: complex.companyId },
        changes,
        {
          id: userId || "system",
          firstName: userFirstName || "Система",
          lastName: userLastName || "",
        },
      );
    }

    return this.getComplexById(id) as Promise<Complex>;
  }

  /**
   * Удалить ЖК
   */
  async deleteComplex(
    id: string,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<boolean> {
    const complex = await this.complexRepository.findOne({
      where: { id },
      relations: ["company"],
    });

    if (!complex) {
      return false;
    }

    const complexName = complex.name;
    const companyId = complex.companyId;

    const result = await this.complexRepository.delete(id);

    if (companyId && result.affected && result.affected > 0) {
      await this.notificationService.notify(companyId, {
        type: "complex_deleted",
        title: "🗑️ Жилой комплекс удален",
        message: `ЖК "${complexName}" был удален`,
        metadata: {
          complexId: id,
          complexName: complexName,
          userId: userId || "system",
          userName:
            `${userFirstName || "Система"} ${userLastName || ""}`.trim(),
        },
        isImportant: true,
      });
    }

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

    const filtered = complexes.filter(
      (complex) => complex.banks && complex.banks.includes(bankName),
    );

    for (const complex of filtered) {
      (complex as any).eligiblePrograms =
        await this.programService.getProgramsForComplex(complex.name);
    }

    return filtered;
  }

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ УСЛОВИЯМИ ОПЛАТЫ С УВЕДОМЛЕНИЯМИ
  // ============================================================

  async addPaymentTerm(
    complexId: string,
    term: string,
    userId: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Complex | null> {
    const complex = await this.getComplexById(complexId);
    if (!complex) return null;

    if (!complex.paymentTerms) {
      complex.paymentTerms = [];
    }

    if (!complex.paymentTerms.includes(term)) {
      complex.paymentTerms.push(term);
      complex.updatedById = userId || null; // 🔥 ИСПРАВЛЕНО
      await this.complexRepository.save(complex);

      if (complex.companyId) {
        await this.notificationService.notifyPaymentTermChange(
          { id: complex.id, name: complex.name, companyId: complex.companyId },
          term,
          "added",
          {
            id: userId || "system",
            firstName: userFirstName || "Система",
            lastName: userLastName || "",
          },
        );
      }
    }

    return complex;
  }

  async removePaymentTerm(
    complexId: string,
    term: string,
    userId: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Complex | null> {
    const complex = await this.getComplexById(complexId);
    if (!complex) return null;

    if (complex.paymentTerms) {
      complex.paymentTerms = complex.paymentTerms.filter((t) => t !== term);
      complex.updatedById = userId || null; // 🔥 ИСПРАВЛЕНО
      await this.complexRepository.save(complex);

      if (complex.companyId) {
        await this.notificationService.notifyPaymentTermChange(
          { id: complex.id, name: complex.name, companyId: complex.companyId },
          term,
          "removed",
          {
            id: userId || "system",
            firstName: userFirstName || "Система",
            lastName: userLastName || "",
          },
        );
      }
    }

    return complex;
  }

  async updatePaymentTerms(
    complexId: string,
    terms: string[],
    userId: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Complex | null> {
    const complex = await this.getComplexById(complexId);
    if (!complex) return null;

    const oldTerms = complex.paymentTerms || [];
    const newTerms = terms || [];

    complex.paymentTerms = newTerms;
    complex.updatedById = userId || null; // 🔥 ИСПРАВЛЕНО
    await this.complexRepository.save(complex);

    if (
      JSON.stringify(oldTerms) !== JSON.stringify(newTerms) &&
      complex.companyId
    ) {
      const added = newTerms.filter((t) => !oldTerms.includes(t));
      const removed = oldTerms.filter((t) => !newTerms.includes(t));
      const changes: string[] = [];

      if (added.length > 0) {
        changes.push(`добавлены: ${added.join(", ")}`);
      }
      if (removed.length > 0) {
        changes.push(`удалены: ${removed.join(", ")}`);
      }

      if (changes.length > 0) {
        await this.notificationService.notify(complex.companyId, {
          type: "complex_updated",
          title: "📝 Изменение условий оплаты",
          message: `В ЖК "${complex.name}" обновлены условия оплаты: ${changes.join("; ")}`,
          metadata: {
            complexId: complex.id,
            complexName: complex.name,
            changes,
            added,
            removed,
            userId: userId || "system",
            userName:
              `${userFirstName || "Система"} ${userLastName || ""}`.trim(),
          },
        });
      }
    }

    return complex;
  }
}
