// backend/src/services/ProgramService.ts

import { AppDataSource } from "../data-source";
import { Program } from "../entities/Program";
import { Offer } from "../entities/Offer";
import { Bank } from "../entities/Bank";
import { CreateProgramDTO, UpdateProgramDTO } from "../dtos/ProgramDto";

export class ProgramService {
  private programRepository = AppDataSource.getRepository(Program);
  private offerRepository = AppDataSource.getRepository(Offer);
  private bankRepository = AppDataSource.getRepository(Bank);

  /**
   * Получить все программы
   */
  async getAllPrograms(): Promise<Program[]> {
    return await this.programRepository.find({
      order: { displayOrder: "ASC" },
    });
  }

  /**
   * Получить активные программы
   */
  async getActivePrograms(): Promise<Program[]> {
    return await this.programRepository.find({
      where: { isActive: true },
      order: { displayOrder: "ASC" },
    });
  }

  /**
   * Получить программу по типу
   */
  async getProgramByType(type: string): Promise<Program | null> {
    return await this.programRepository.findOne({
      where: { type },
    });
  }

  /**
   * Получить программу по ID
   */
  async getProgramById(id: string): Promise<Program | null> {
    return await this.programRepository.findOne({
      where: { id },
      relations: ["offers", "offers.bank"],
    });
  }

  /**
   * Получить программы для конкретного ЖК
   */
  async getProgramsForComplex(complexName: string): Promise<any[]> {
    try {
      // Получаем все офферы для этого ЖК
      const offers = await this.offerRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.programEntity", "program")
        .leftJoinAndSelect("offer.bank", "bank")
        .where("offer.isActive = :isActive", { isActive: true })
        .andWhere("program.isActive = :programActive", { programActive: true })
        .andWhere("bank.isActive = :bankActive", { bankActive: true })
        .andWhere(
          `(
            offer.complexes IS NULL OR 
            offer.complexes = '[]'::jsonb OR 
            offer.complexes @> to_jsonb(ARRAY[:complexName]::text[])
          )`,
          { complexName },
        )
        .orderBy("bank.displayOrder", "ASC")
        .addOrderBy("program.displayOrder", "ASC")
        .getMany();

      // Группируем программы по типу
      const programMap = new Map<string, any>();

      for (const offer of offers) {
        const program = offer.programEntity;
        if (!program) continue;

        const programType = program.type;

        if (!programMap.has(programType)) {
          programMap.set(programType, {
            type: program.type,
            label: program.label,
            icon: program.icon || "🏦",
            color: program.color || "#6b7280",
            description: program.description || "",
            displayOrder: program.displayOrder || 0,
            banks: new Set<string>(),
            offers: [],
            minRate: Infinity,
            maxRate: -Infinity,
            offersCount: 0,
          });
        }

        const progData = programMap.get(programType);

        // Добавляем банк
        if (offer.bank?.name) {
          progData.banks.add(offer.bank.name);
        }

        // Добавляем оффер с полной информацией
        const offerData = {
          id: offer.id,
          bank: offer.bank?.name || "Неизвестный банк",
          bankId: offer.bank?.id || "",
          bankSlug: offer.bank?.slug || "",
          rate: Number(offer.rate),
          twoRate: offer.twoRate ? Number(offer.twoRate) : null,
          shortRate: offer.shortRate ? Number(offer.shortRate) : null,
          subsidyPercent: Number(offer.subsidyPercent),
          minPVPercent: Number(offer.minPVPercent),
          durationMonths: offer.durationMonths,
          isTwoContracts: offer.isTwoContracts || false,
          excessLimit: offer.excessLimit || false,
          isTranche: offer.isTranche || false,
          trancheFirstPercent: offer.trancheFirstPercent
            ? Number(offer.trancheFirstPercent)
            : null,
          trancheSecondDate: offer.trancheSecondDate || null,
          subsidyCalculationMethod: offer.subsidyCalculationMethod || null,
          dynamicRatesIU: offer.dynamicRatesIU || null,
          dynamicSubsidyPercent: offer.dynamicSubsidyPercent || null,
          thresholdTolerance: offer.thresholdTolerance
            ? Number(offer.thresholdTolerance)
            : null,
          thresholdToleranceType: offer.thresholdToleranceType || null,
          roundingStrategy: offer.roundingStrategy || null,
          twoContractSubsidies: offer.twoContractSubsidies || null,
          minLoanTermYears: offer.minLoanTermYears || null,
          description: offer.description || null,
          isActive: offer.isActive,
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt,
        };

        progData.offers.push(offerData);
        progData.offersCount++;

        // Обновляем min/max ставки
        const rate = Number(offer.rate);
        if (rate < progData.minRate) progData.minRate = rate;
        if (rate > progData.maxRate) progData.maxRate = rate;
      }

      // Преобразуем Set в массив и сортируем
      const result = Array.from(programMap.values())
        .map((p) => ({
          ...p,
          banks: Array.from(p.banks).sort(),
          minRate: p.offersCount > 0 ? p.minRate : null,
          maxRate: p.offersCount > 0 ? p.maxRate : null,
        }))
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      return result;
    } catch (error) {
      console.error(
        `Error getting programs for complex ${complexName}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Получить программы для нескольких ЖК
   */
  async getProgramsForComplexes(
    complexNames: string[],
  ): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};

    for (const name of complexNames) {
      results[name] = await this.getProgramsForComplex(name);
    }

    return results;
  }

  /**
   * Получить все доступные программы с группировкой по ЖК
   */
  async getAllProgramsWithComplexes(): Promise<Record<string, any[]>> {
    try {
      // Получаем все уникальные ЖК из офферов
      const offers = await this.offerRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.programEntity", "program")
        .leftJoinAndSelect("offer.bank", "bank")
        .where("offer.isActive = :isActive", { isActive: true })
        .andWhere("program.isActive = :programActive", { programActive: true })
        .andWhere("bank.isActive = :bankActive", { bankActive: true })
        .getMany();

      // Собираем все уникальные ЖК
      const complexSet = new Set<string>();
      for (const offer of offers) {
        if (offer.complexes && offer.complexes.length > 0) {
          for (const complex of offer.complexes) {
            complexSet.add(complex);
          }
        }
      }

      // Если нет ЖК, возвращаем пустой объект
      if (complexSet.size === 0) {
        return {};
      }

      // Для каждого ЖК получаем программы
      const result: Record<string, any[]> = {};
      for (const complexName of complexSet) {
        result[complexName] = await this.getProgramsForComplex(complexName);
      }

      return result;
    } catch (error) {
      console.error("Error getting all programs with complexes:", error);
      return {};
    }
  }

  /**
   * Создать новую программу (админский метод)
   */
  async createProgram(data: CreateProgramDTO): Promise<Program> {
    // Валидация
    if (!data.type) {
      throw new Error("Program type is required");
    }
    if (!data.label) {
      throw new Error("Program label is required");
    }

    // Проверяем, существует ли программа с таким типом
    const existing = await this.programRepository.findOne({
      where: { type: data.type },
    });

    if (existing) {
      throw new Error(`Program with type "${data.type}" already exists`);
    }

    const program = this.programRepository.create({
      type: data.type,
      label: data.label,
      icon: data.icon || "🏦",
      color: data.color || "#6b7280",
      description: data.description || "",
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await this.programRepository.save(program);
    return program;
  }

  /**
   * Обновить программу (админский метод)
   */
  async updateProgram(id: string, data: UpdateProgramDTO): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new Error("Program not found");
    }

    // Если меняется тип, проверяем уникальность
    if (data.type && data.type !== program.type) {
      const existing = await this.programRepository.findOne({
        where: { type: data.type },
      });
      if (existing) {
        throw new Error(`Program with type "${data.type}" already exists`);
      }
    }

    // Обновляем только переданные поля
    if (data.type !== undefined) program.type = data.type;
    if (data.label !== undefined) program.label = data.label;
    if (data.icon !== undefined) program.icon = data.icon;
    if (data.color !== undefined) program.color = data.color;
    if (data.description !== undefined) program.description = data.description;
    if (data.displayOrder !== undefined)
      program.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) program.isActive = data.isActive;

    await this.programRepository.save(program);
    return program;
  }

  /**
   * Удалить программу (админский метод)
   */
  async deleteProgram(id: string): Promise<void> {
    const program = await this.programRepository.findOne({
      where: { id },
    });

    if (!program) {
      throw new Error("Program not found");
    }

    // Проверяем, есть ли офферы с этой программой
    const offersCount = await this.offerRepository.count({
      where: { programId: id },
    });

    if (offersCount > 0) {
      throw new Error(
        `Cannot delete program with ${offersCount} associated offers. Deactivate instead.`,
      );
    }

    await this.programRepository.delete(id);
  }

  /**
   * Получить программы с фильтрацией по банку
   */
  async getProgramsByBank(bankName: string): Promise<any[]> {
    try {
      const offers = await this.offerRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.programEntity", "program")
        .leftJoinAndSelect("offer.bank", "bank")
        .where("offer.isActive = :isActive", { isActive: true })
        .andWhere("program.isActive = :programActive", { programActive: true })
        .andWhere("bank.isActive = :bankActive", { bankActive: true })
        .andWhere("bank.name = :bankName", { bankName })
        .orderBy("program.displayOrder", "ASC")
        .getMany();

      // Группируем по программам
      const programMap = new Map<string, any>();
      for (const offer of offers) {
        const program = offer.programEntity;
        if (!program) continue;

        const programType = program.type;
        if (!programMap.has(programType)) {
          programMap.set(programType, {
            type: program.type,
            label: program.label,
            icon: program.icon,
            color: program.color,
            description: program.description,
            displayOrder: program.displayOrder,
            isActive: program.isActive,
            offers: [],
          });
        }

        programMap.get(programType).offers.push({
          id: offer.id,
          bank: offer.bank?.name,
          bankId: offer.bank?.id,
          rate: offer.rate,
          minPVPercent: offer.minPVPercent,
          subsidyPercent: offer.subsidyPercent,
          isActive: offer.isActive,
        });
      }

      return Array.from(programMap.values()).sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
      );
    } catch (error) {
      console.error(`Error getting programs by bank ${bankName}:`, error);
      return [];
    }
  }

  /**
   * Получить программы с фильтрацией по ЖК и банку
   */
  async getProgramsByComplexAndBank(
    complexName: string,
    bankName: string,
  ): Promise<any[]> {
    try {
      const offers = await this.offerRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.programEntity", "program")
        .leftJoinAndSelect("offer.bank", "bank")
        .where("offer.isActive = :isActive", { isActive: true })
        .andWhere("program.isActive = :programActive", { programActive: true })
        .andWhere("bank.isActive = :bankActive", { bankActive: true })
        .andWhere("bank.name = :bankName", { bankName })
        .andWhere(
          `(
            offer.complexes IS NULL OR 
            offer.complexes = '[]'::jsonb OR 
            offer.complexes @> to_jsonb(ARRAY[:complexName]::text[])
          )`,
          { complexName },
        )
        .orderBy("program.displayOrder", "ASC")
        .getMany();

      // Группируем по программам
      const programMap = new Map<string, any>();
      for (const offer of offers) {
        const program = offer.programEntity;
        if (!program) continue;

        const programType = program.type;
        if (!programMap.has(programType)) {
          programMap.set(programType, {
            type: program.type,
            label: program.label,
            icon: program.icon,
            color: program.color,
            description: program.description,
            displayOrder: program.displayOrder,
            isActive: program.isActive,
            offers: [],
          });
        }

        programMap.get(programType).offers.push({
          id: offer.id,
          rate: offer.rate,
          minPVPercent: offer.minPVPercent,
          subsidyPercent: offer.subsidyPercent,
          isActive: offer.isActive,
        });
      }

      return Array.from(programMap.values()).sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
      );
    } catch (error) {
      console.error(
        `Error getting programs by complex ${complexName} and bank ${bankName}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Получить статистику по программам
   */
  async getProgramsStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: { type: string; count: string }[];
  }> {
    try {
      const total = await this.programRepository.count();
      const active = await this.programRepository.count({
        where: { isActive: true },
      });
      const inactive = total - active;

      const byType = await this.programRepository
        .createQueryBuilder("program")
        .select("program.type", "type")
        .addSelect("COUNT(*)", "count")
        .groupBy("program.type")
        .getRawMany();

      return {
        total,
        active,
        inactive,
        byType,
      };
    } catch (error) {
      console.error("Error getting programs stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byType: [],
      };
    }
  }

  /**
   * Проверить существование программы по ID
   */
  async programExists(id: string): Promise<boolean> {
    const count = await this.programRepository.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Проверить существование программы по типу
   */
  async programExistsByType(type: string): Promise<boolean> {
    const count = await this.programRepository.count({
      where: { type },
    });
    return count > 0;
  }

  /**
   * Получить программы с фильтром по активности
   */
  async getProgramsByActive(isActive: boolean): Promise<Program[]> {
    return await this.programRepository.find({
      where: { isActive },
      order: { displayOrder: "ASC" },
    });
  }

  /**
   * Обновить порядок отображения программ
   */
  async updateProgramsOrder(
    programs: { id: string; displayOrder: number }[],
  ): Promise<void> {
    for (const program of programs) {
      await this.programRepository.update(program.id, {
        displayOrder: program.displayOrder,
      });
    }
  }
}

export default ProgramService;
