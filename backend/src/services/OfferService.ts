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

export class OfferService {
  private offerRepository = AppDataSource.getRepository(Offer);
  private bankRepository = AppDataSource.getRepository(Bank);
  private programRepository = AppDataSource.getRepository(Program);
  private rateRepository = AppDataSource.getRepository(DynamicRate);
  private subsidyRepository = AppDataSource.getRepository(DynamicSubsidy);

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
  async createOffer(data: CreateOfferDTO): Promise<Offer> {
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
      excessLimit: data.excessLimit ?? false,
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
    });

    return await this.offerRepository.save(offer);
  }

  /**
   * Обновить оффер
   */
  async updateOffer(id: string, data: UpdateOfferDTO): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ["bank", "programEntity"],
    });

    if (!offer) {
      throw new Error(`Offer with id ${id} not found`);
    }

    // Обновляем связи
    if (data.bankId) {
      const bank = await this.bankRepository.findOne({
        where: { id: data.bankId },
      });
      if (bank) {
        offer.bank = bank;
        offer.bankId = data.bankId;
      }
    }

    if (data.programId) {
      const program = await this.programRepository.findOne({
        where: { id: data.programId },
      });
      if (program) {
        offer.programEntity = program;
        offer.programId = data.programId;
      }
    }

    // 🔥 Создаем объект для обновления без id
    const { id: _, ...updateData } = data as any;

    // Обновляем все поля из updateData
    for (const key of Object.keys(updateData)) {
      if (
        updateData[key] !== undefined &&
        key !== "bankId" &&
        key !== "programId"
      ) {
        (offer as any)[key] = updateData[key];
      }
    }

    // Убеждаемся, что complexes - массив
    if (data.complexes !== undefined) {
      offer.complexes = data.complexes || [];
    }

    return await this.offerRepository.save(offer);
  }

  /**
   * Мягкое удаление оффера
   */
  async deleteOffer(id: string): Promise<void> {
    const result = await this.offerRepository.update(id, { isActive: false });
    if (result.affected === 0) {
      throw new Error(`Offer with id ${id} not found`);
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

    // Создаем копию
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
  }): Promise<{ minRate: number; maxRate: number }> {
    const query = this.offerRepository
      .createQueryBuilder("offer")
      .where("offer.isActive = true");

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
      excessLimit: offer.excessLimit,
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
          }
        : (null as any),
      // 🔥 Маппинг динамических ставок
      dynamicRates:
        offer.dynamicRates?.map((rate) => ({
          id: rate.id,
          conditionType: rate.conditionType,
          condition: rate.condition,
          value: rate.value,
          minValue: rate.minValue,
          maxValue: rate.maxValue,
          rate: rate.rate,
          priority: rate.priority,
          description: rate.description,
          conditionMetadata: rate.conditionMetadata,
          isActive: rate.isActive,
        })) || [],
      // 🔥 Маппинг динамических субсидий (НОВАЯ СТРУКТУРА!)
      dynamicSubsidies:
        offer.dynamicSubsidies?.map((subsidy) => ({
          id: subsidy.id,
          conditionType: subsidy.conditionType, // ← новое поле
          condition: subsidy.condition, // ← новое поле
          value: subsidy.value, // ← новое поле
          minValue: subsidy.minValue, // ← новое поле
          maxValue: subsidy.maxValue, // ← новое поле
          rate: subsidy.rate, // ← было subsidyPercent
          priority: subsidy.priority,
          description: subsidy.description,
          conditionMetadata: subsidy.conditionMetadata,
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
      excessLimit: offer.excessLimit,
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
