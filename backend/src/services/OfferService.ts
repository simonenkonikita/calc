// backend/src/services/OfferService.ts

import { AppDataSource } from "../data-source";
import { Offer } from "../entities/Offer";
import { Bank } from "../entities/Bank";
import { Program } from "../entities/Program";
import { DynamicRate } from "../entities/DynamicRate";
import { DynamicSubsidy } from "../entities/DynamicSubsidy";
import {
  CreateOfferDTO,
  UpdateOfferDTO,
  OfferFiltersDTO,
  OfferResponseDTO,
  OfferListDTO,
} from "../dtos/OfferDto";
import { In, ILike } from "typeorm";
import { NotificationService } from "./NotificationService";

export class OfferService {
  private offerRepository = AppDataSource.getRepository(Offer);
  private bankRepository = AppDataSource.getRepository(Bank);
  private programRepository = AppDataSource.getRepository(Program);
  private rateRepository = AppDataSource.getRepository(DynamicRate);
  private subsidyRepository = AppDataSource.getRepository(DynamicSubsidy);
  private notificationService = new NotificationService();

  /**
   * Получить все офферы (для админки)
   */
  async getAllOffersAdmin(): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      order: { bank: { displayOrder: "ASC" } },
    });
  }

  /**
   * Получить все активные офферы
   */
  async getAllOffers(): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: { isActive: true },
      order: { bank: { displayOrder: "ASC" } },
    });
  }

  /**
   * Получить офферы с фильтрацией
   */
  async getOffersFiltered(filters: OfferFiltersDTO): Promise<Offer[]> {
    const query = this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.bank", "bank")
      .leftJoinAndSelect("offer.programEntity", "program")
      .leftJoinAndSelect("offer.dynamicRates", "dynamicRates")
      .leftJoinAndSelect("offer.dynamicSubsidies", "dynamicSubsidies")
      .where("1=1");

    if (filters.bankId) {
      query.andWhere("offer.bankId = :bankId", { bankId: filters.bankId });
    }

    if (filters.programId) {
      query.andWhere("offer.programId = :programId", {
        programId: filters.programId,
      });
    }

    if (filters.programType) {
      query.andWhere("program.type = :programType", {
        programType: filters.programType,
      });
    }

    if (filters.isActive !== undefined) {
      query.andWhere("offer.isActive = :isActive", {
        isActive: filters.isActive,
      });
    }

    if (filters.minRate !== undefined) {
      query.andWhere("offer.rate >= :minRate", { minRate: filters.minRate });
    }

    if (filters.maxRate !== undefined) {
      query.andWhere("offer.rate <= :maxRate", { maxRate: filters.maxRate });
    }

    if (filters.minPVPercent !== undefined) {
      query.andWhere("offer.minPVPercent >= :minPVPercent", {
        minPVPercent: filters.minPVPercent,
      });
    }

    if (filters.maxPVPercent !== undefined) {
      query.andWhere("offer.minPVPercent <= :maxPVPercent", {
        maxPVPercent: filters.maxPVPercent,
      });
    }

    if (filters.search) {
      query.andWhere(
        "(offer.program ILIKE :search OR bank.name ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    if (filters.complexName) {
      query.andWhere(
        `(
          offer.complexes IS NULL OR 
          offer.complexes = '[]'::jsonb OR 
          offer.complexes @> to_jsonb(ARRAY[:complexName]::text[])
        )`,
        { complexName: filters.complexName },
      );
    }

    return await query
      .orderBy("bank.displayOrder", "ASC")
      .addOrderBy("offer.rate", "ASC")
      .getMany();
  }

  /**
   * Получить офферы по банку
   */
  async getOffersByBank(bankId: string): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: { bankId, isActive: true },
      order: { rate: "ASC" },
    });
  }

  /**
   * Получить офферы по ЖК
   */
  async getOffersByComplex(complexName: string): Promise<Offer[]> {
    return await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.bank", "bank")
      .leftJoinAndSelect("offer.programEntity", "program")
      .leftJoinAndSelect("offer.dynamicRates", "dynamicRates")
      .leftJoinAndSelect("offer.dynamicSubsidies", "dynamicSubsidies")
      .where("offer.isActive = true")
      .andWhere("bank.isActive = true")
      .andWhere("program.isActive = true")
      .andWhere(
        `(
          offer.complexes IS NULL OR 
          offer.complexes = '[]'::jsonb OR 
          offer.complexes @> to_jsonb(ARRAY[:complexName]::text[])
        )`,
        { complexName },
      )
      .orderBy("bank.displayOrder", "ASC")
      .getMany();
  }

  /**
   * Получить офферы по списку ЖК
   */
  async getOffersByComplexes(complexNames: string[]): Promise<Offer[]> {
    if (!complexNames || complexNames.length === 0) {
      return await this.getAllOffers();
    }

    return await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.bank", "bank")
      .leftJoinAndSelect("offer.programEntity", "program")
      .leftJoinAndSelect("offer.dynamicRates", "dynamicRates")
      .leftJoinAndSelect("offer.dynamicSubsidies", "dynamicSubsidies")
      .where("offer.isActive = true")
      .andWhere("bank.isActive = true")
      .andWhere("program.isActive = true")
      .andWhere(
        `(
          offer.complexes IS NULL OR 
          offer.complexes = '[]'::jsonb OR 
          offer.complexes ?| ARRAY[:...complexNames]
        )`,
        { complexNames },
      )
      .orderBy("bank.displayOrder", "ASC")
      .getMany();
  }

  /**
   * Получить оффер по ID
   */
  async getOfferById(id: string): Promise<Offer | null> {
    return await this.offerRepository.findOne({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: { id },
    });
  }

  /**
   * Создать оффер
   */
  async createOffer(
    data: CreateOfferDTO,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Offer> {
    // Проверяем банк
    const bank = await this.bankRepository.findOne({
      where: { id: data.bankId },
    });

    if (!bank) {
      throw new Error(`Bank with id ${data.bankId} not found`);
    }

    // Проверяем программу
    const program = await this.programRepository.findOne({
      where: { id: data.programId },
    });

    if (!program) {
      throw new Error(`Program with id ${data.programId} not found`);
    }

    // Создаем оффер
    const offer = this.offerRepository.create({
      program: data.program,
      rate: data.rate,
      twoRate: data.twoRate ?? null,
      shortRate: data.shortRate ?? null,
      subsidyPercent: data.subsidyPercent ?? 0,
      minPVPercent: data.minPVPercent,
      durationMonths: data.durationMonths ?? null,
      isTwoContracts: data.isTwoContracts ?? false,
      isExcessLimit: data.isExcessLimit ?? false,
      isTranche: data.isTranche ?? false,
      trancheFirstPercent: data.trancheFirstPercent ?? null,
      trancheSecondDate: data.trancheSecondDate ?? null,
      complexes: data.complexes ?? [],
      subsidyCalculationMethod: data.subsidyCalculationMethod ?? null,
      thresholdTolerance: data.thresholdTolerance ?? null,
      thresholdToleranceType: data.thresholdToleranceType ?? null,
      roundingStrategy: data.roundingStrategy ?? null,
      minLoanTermYears: data.minLoanTermYears ?? null,
      description: data.description ?? null,
      isActive: true,
      bank: bank,
      bankId: data.bankId,
      programEntity: program,
      programId: data.programId,
      companyId: data.companyId || undefined,
      createdById: userId,
    });

    const savedOffer = await this.offerRepository.save(offer);

    // 🔥 УВЕДОМЛЕНИЕ О СОЗДАНИИ
    if (savedOffer.companyId) {
      await this.notificationService.notifyOfferCreated(
        {
          id: savedOffer.id,
          companyId: savedOffer.companyId,
          bankName: bank.name,
          programName: program.label || program.type,
          rate: savedOffer.rate,
        },
        {
          id: userId || "system",
          firstName: userFirstName || "Система",
          lastName: userLastName || "",
        },
      );
    }

    return savedOffer;
  }

  /**
   * Обновить оффер
   */
  async updateOffer(
    id: string,
    data: UpdateOfferDTO,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ["bank", "programEntity"],
    });

    if (!offer) {
      throw new Error(`Offer with id ${id} not found`);
    }

    // 🔥 ОТСЛЕЖИВАЕМ ИЗМЕНЕНИЯ
    const changes: string[] = [];
    const oldBankName = offer.bank?.name;
    const oldProgramName =
      offer.programEntity?.label || offer.programEntity?.type;

    // Проверяем изменения
    if (data.rate !== undefined && data.rate !== offer.rate) {
      changes.push(`ставка с ${offer.rate}% на ${data.rate}%`);
    }
    if (
      data.subsidyPercent !== undefined &&
      data.subsidyPercent !== offer.subsidyPercent
    ) {
      changes.push(
        `субсидия с ${offer.subsidyPercent}% на ${data.subsidyPercent}%`,
      );
    }
    if (
      data.minPVPercent !== undefined &&
      data.minPVPercent !== offer.minPVPercent
    ) {
      changes.push(`мин. ПВ с ${offer.minPVPercent}% на ${data.minPVPercent}%`);
    }
    if (data.shortRate !== undefined && data.shortRate !== offer.shortRate) {
      changes.push(
        `короткая ставка с ${offer.shortRate || "—"}% на ${data.shortRate}%`,
      );
    }
    if (data.twoRate !== undefined && data.twoRate !== offer.twoRate) {
      changes.push(
        `ставка по 2-м договорам с ${offer.twoRate || "—"}% на ${data.twoRate}%`,
      );
    }
    if (data.isActive !== undefined && data.isActive !== offer.isActive) {
      changes.push(data.isActive ? "оффер активирован" : "оффер деактивирован");
    }
    if (
      data.isTwoContracts !== undefined &&
      data.isTwoContracts !== offer.isTwoContracts
    ) {
      changes.push(
        `два договора: ${data.isTwoContracts ? "включено" : "выключено"}`,
      );
    }
    if (
      data.isExcessLimit !== undefined &&
      data.isExcessLimit !== offer.isExcessLimit
    ) {
      changes.push(
        `превышение лимита: ${data.isExcessLimit ? "включено" : "выключено"}`,
      );
    }
    if (data.isTranche !== undefined && data.isTranche !== offer.isTranche) {
      changes.push(`траншевый: ${data.isTranche ? "включено" : "выключено"}`);
    }

    // Обновляем связи
    if (data.bankId) {
      const bank = await this.bankRepository.findOne({
        where: { id: data.bankId },
      });
      if (bank) {
        offer.bank = bank;
        offer.bankId = data.bankId;
        if (bank.name !== oldBankName) {
          changes.push(`банк с "${oldBankName}" на "${bank.name}"`);
        }
      }
    }

    if (data.programId) {
      const program = await this.programRepository.findOne({
        where: { id: data.programId },
      });
      if (program) {
        offer.programEntity = program;
        offer.programId = data.programId;
        const newProgramName = program.label || program.type;
        if (newProgramName !== oldProgramName) {
          changes.push(
            `программа с "${oldProgramName}" на "${newProgramName}"`,
          );
        }
      }
    }

    // Обновляем остальные поля
    const { id: _, ...updateData } = data as any;
    for (const key of Object.keys(updateData)) {
      if (
        updateData[key] !== undefined &&
        key !== "bankId" &&
        key !== "programId"
      ) {
        const value = updateData[key] === null ? undefined : updateData[key];
        (offer as any)[key] = value;
      }
    }

    if (data.complexes !== undefined) {
      offer.complexes = data.complexes || [];
    }

    const updatedOffer = await this.offerRepository.save(offer);

    // 🔥 УВЕДОМЛЕНИЕ ОБ ИЗМЕНЕНИЯХ
    if (changes.length > 0 && updatedOffer.companyId) {
      await this.notificationService.notifyOfferChanges(
        {
          id: updatedOffer.id,
          companyId: updatedOffer.companyId,
          bankName: updatedOffer.bank?.name,
          programName:
            updatedOffer.programEntity?.label ||
            updatedOffer.programEntity?.type,
        },
        changes,
        {
          id: userId || "system",
          firstName: userFirstName || "Система",
          lastName: userLastName || "",
        },
      );
    }

    return updatedOffer;
  }

  /**
   * Мягкое удаление оффера
   */
  async deleteOffer(
    id: string,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<void> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ["bank"],
    });

    if (!offer) {
      throw new Error(`Offer with id ${id} not found`);
    }

    const bankName = offer.bank?.name;
    const companyId = offer.companyId;

    const result = await this.offerRepository.update(id, { isActive: false });

    if (result.affected === 0) {
      throw new Error(`Offer with id ${id} not found`);
    }

    // 🔥 УВЕДОМЛЕНИЕ ОБ УДАЛЕНИИ
    if (companyId) {
      await this.notificationService.notifyOfferDeleted(
        {
          id,
          companyId,
          bankName: bankName || undefined,
        },
        {
          id: userId || "system",
          firstName: userFirstName || "Система",
          lastName: userLastName || "",
        },
      );
    }
  }

  /**
   * Восстановление оффера
   */
  async restoreOffer(id: string): Promise<void> {
    const result = await this.offerRepository.update(id, { isActive: true });
    if (result.affected === 0) {
      throw new Error(`Offer with id ${id} not found`);
    }
  }

  /**
   * Полное удаление оффера (hard delete)
   */
  async hardDeleteOffer(id: string): Promise<void> {
    const result = await this.offerRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Offer with id ${id} not found`);
    }
  }

  /**
   * Копировать оффер
   */
  async copyOffer(id: string): Promise<Offer> {
    const offer = await this.getOfferById(id);

    if (!offer) {
      throw new Error(`Offer with id ${id} not found`);
    }

    const { id: _, createdAt, updatedAt, ...copyData } = offer;

    const copy = this.offerRepository.create({
      ...copyData,
      program: `${offer.program} (копия)`,
      isActive: true,
    });

    return await this.offerRepository.save(copy);
  }

  /**
   * Получить офферы по типу программы
   */
  async getOffersByProgramType(programType: string): Promise<Offer[]> {
    return await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.bank", "bank")
      .leftJoinAndSelect("offer.programEntity", "program")
      .leftJoinAndSelect("offer.dynamicRates", "dynamicRates")
      .leftJoinAndSelect("offer.dynamicSubsidies", "dynamicSubsidies")
      .where("program.type = :programType", { programType })
      .andWhere("offer.isActive = true")
      .andWhere("bank.isActive = true")
      .andWhere("program.isActive = true")
      .orderBy("bank.displayOrder", "ASC")
      .getMany();
  }

  /**
   * Получить диапазон ставок
   */
  async getRateRange(filters?: {
    bankId?: string;
    programId?: string;
    complexName?: string;
    companyId?: string;
  }): Promise<{ minRate: number; maxRate: number }> {
    const query = this.offerRepository
      .createQueryBuilder("offer")
      .where("offer.isActive = true");

    if (filters?.companyId) {
      query.andWhere("offer.companyId = :companyId", {
        companyId: filters.companyId,
      });
    }

    if (filters?.bankId) {
      query.andWhere("offer.bankId = :bankId", { bankId: filters.bankId });
    }

    if (filters?.programId) {
      query.andWhere("offer.programId = :programId", {
        programId: filters.programId,
      });
    }

    if (filters?.complexName) {
      query.andWhere(
        `(
        offer.complexes IS NULL OR 
        offer.complexes = '[]'::jsonb OR 
        offer.complexes @> to_jsonb(ARRAY[:complexName]::text[])
      )`,
        { complexName: filters.complexName },
      );
    }

    const result = await query
      .select("MIN(offer.rate)", "minRate")
      .addSelect("MAX(offer.rate)", "maxRate")
      .getRawOne();

    return {
      minRate: parseFloat(result?.minRate || "0"),
      maxRate: parseFloat(result?.maxRate || "0"),
    };
  }

  /**
   * Преобразовать Offer в OfferResponseDTO
   */
  toResponseDTO(offer: Offer): OfferResponseDTO {
    return {
      id: offer.id,
      program: offer.program,
      rate: offer.rate,
      twoRate: offer.twoRate,
      shortRate: offer.shortRate,
      subsidyPercent: offer.subsidyPercent,
      minPVPercent: offer.minPVPercent,
      durationMonths: offer.durationMonths,
      isTwoContracts: offer.isTwoContracts,
      isExcessLimit: offer.isExcessLimit,
      isTranche: offer.isTranche,
      trancheFirstPercent: offer.trancheFirstPercent,
      trancheSecondDate: offer.trancheSecondDate,
      complexes: offer.complexes,
      subsidyCalculationMethod: offer.subsidyCalculationMethod,
      thresholdTolerance: offer.thresholdTolerance,
      thresholdToleranceType: offer.thresholdToleranceType,
      roundingStrategy: offer.roundingStrategy,
      minLoanTermYears: offer.minLoanTermYears,
      description: offer.description,
      isActive: offer.isActive,
      bankId: offer.bankId,
      programId: offer.programId,
      bank: offer.bank
        ? {
            id: offer.bank.id,
            name: offer.bank.name,
            slug: offer.bank.slug,
            baseRate: offer.bank.baseRate,
            minPVPercent: offer.bank.minPVPercent,
            isActive: offer.bank.isActive,
            displayOrder: offer.bank.displayOrder,
            createdAt: offer.bank.createdAt,
            updatedAt: offer.bank.updatedAt,
          }
        : (null as any),
      programEntity: offer.programEntity
        ? {
            id: offer.programEntity.id,
            type: offer.programEntity.type,
            label: offer.programEntity.label,
            icon: offer.programEntity.icon,
            color: offer.programEntity.color,
            description: offer.programEntity.description,
            isActive: offer.programEntity.isActive,
            displayOrder: offer.programEntity.displayOrder,
            createdAt: offer.programEntity.createdAt,
            updatedAt: offer.programEntity.updatedAt,
          }
        : (null as any),
      dynamicRates:
        offer.dynamicRates?.map((rate) => ({
          id: rate.id,
          conditionMetadata: rate.conditionMetadata || {},
          rate: rate.rate,
          priority: rate.priority || 0,
          description: rate.description || null,
          isActive: rate.isActive,
        })) || [],
      dynamicSubsidies:
        offer.dynamicSubsidies?.map((subsidy) => ({
          id: subsidy.id,
          conditionMetadata: subsidy.conditionMetadata || {},
          tolerance: subsidy.tolerance || 0,
          subsidyPercent: subsidy.subsidyPercent,
          priority: subsidy.priority || 0,
          description: subsidy.description || null,
          isActive: subsidy.isActive,
        })) || [],
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }

  /**
   * Преобразовать Offer в OfferListDTO
   */
  toListDTO(offer: Offer): OfferListDTO {
    return {
      id: offer.id,
      program: offer.program,
      rate: offer.rate,
      twoRate: offer.twoRate,
      shortRate: offer.shortRate,
      subsidyPercent: offer.subsidyPercent,
      minPVPercent: offer.minPVPercent,
      durationMonths: offer.durationMonths,
      isTwoContracts: offer.isTwoContracts,
      isExcessLimit: offer.isExcessLimit,
      isTranche: offer.isTranche,
      complexes: offer.complexes,
      isActive: offer.isActive,
      bank: offer.bank
        ? {
            id: offer.bank.id,
            name: offer.bank.name,
            slug: offer.bank.slug,
          }
        : (null as any),
      programEntity: offer.programEntity
        ? {
            id: offer.programEntity.id,
            type: offer.programEntity.type,
            label: offer.programEntity.label,
            icon: offer.programEntity.icon,
            color: offer.programEntity.color,
          }
        : (null as any),
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}

export default OfferService;
