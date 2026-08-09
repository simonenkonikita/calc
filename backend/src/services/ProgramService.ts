// backend/src/services/ProgramService.ts

import { AppDataSource } from "../data-source";
import { Program } from "../entities/Program";
import { Offer } from "../entities/Offer";

export class ProgramService {
  private programRepository = AppDataSource.getRepository(Program);
  private offerRepository = AppDataSource.getRepository(Offer);

  /**
   * Получить все программы
   */
  async getAllPrograms() {
    return await this.programRepository.find({
      order: { displayOrder: "ASC" },
    });
  }

  /**
   * Получить программу по типу
   */
  async getProgramByType(type: string) {
    return await this.programRepository.findOne({ where: { type } });
  }

  /**
   * Получить программу по ID
   */
  async getProgramById(id: string) {
    return await this.programRepository.findOne({
      where: { id },
      relations: ["offers", "offers.bank"],
    });
  }

  /**
   * Получить программы для конкретного ЖК
   */
  async getProgramsForComplex(complexName: string) {
    try {
      // Получаем все офферы для этого ЖК
      const offers = await this.offerRepository
        .createQueryBuilder("offer")
        .leftJoinAndSelect("offer.programEntity", "program")
        .leftJoinAndSelect("offer.bank", "bank")
        .where("offer.isActive = true")
        .andWhere("program.isActive = true")
        .andWhere("bank.isActive = true")
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

      // Группируем программы по типу
      const programMap = new Map();

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
            // Дополнительная информация
            minRate: Infinity,
            maxRate: -Infinity,
            offersCount: 0,
          });
        }

        const progData = programMap.get(programType);

        // Добавляем банк
        if (offer.bank && offer.bank.name) {
          progData.banks.add(offer.bank.name);
        }

        // Добавляем оффер с полной информацией
        const offerData = {
          id: offer.id,
          bank: offer.bank?.name || "Неизвестный банк",
          bankId: offer.bank?.id || "",
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
          banks: Array.from(p.banks),
          // Если нет офферов, сбрасываем min/max
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
  async getProgramsForComplexes(complexNames: string[]) {
    const results: { [key: string]: any[] } = {};

    for (const name of complexNames) {
      results[name] = await this.getProgramsForComplex(name);
    }

    return results;
  }

  /**
   * Получить все доступные программы с группировкой по ЖК
   */
  async getAllProgramsWithComplexes() {
    // Получаем все уникальные ЖК из офферов
    const offers = await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.programEntity", "program")
      .leftJoinAndSelect("offer.bank", "bank")
      .where("offer.isActive = true")
      .andWhere("program.isActive = true")
      .andWhere("bank.isActive = true")
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

    // Для каждого ЖК получаем программы
    const result: { [key: string]: any[] } = {};
    for (const complexName of complexSet) {
      result[complexName] = await this.getProgramsForComplex(complexName);
    }

    return result;
  }

  /**
   * Создать новую программу (админский метод)
   */
  async createProgram(data: Partial<Program>) {
    const program = this.programRepository.create(data);
    return await this.programRepository.save(program);
  }

  /**
   * Обновить программу (админский метод)
   */
  async updateProgram(id: string, data: Partial<Program>) {
    await this.programRepository.update(id, data);
    return await this.programRepository.findOne({ where: { id } });
  }

  /**
   * Удалить программу (админский метод)
   */
  async deleteProgram(id: string) {
    return await this.programRepository.delete(id);
  }

  /**
   * Получить программы с фильтрацией по банку
   */
  async getProgramsByBank(bankName: string) {
    const offers = await this.offerRepository
      .createQueryBuilder("offer")
      .leftJoinAndSelect("offer.programEntity", "program")
      .leftJoinAndSelect("offer.bank", "bank")
      .where("offer.isActive = true")
      .andWhere("program.isActive = true")
      .andWhere("bank.isActive = true")
      .andWhere("bank.name = :bankName", { bankName })
      .orderBy("program.displayOrder", "ASC")
      .getMany();

    // Группируем по программам
    const programMap = new Map();
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
          offers: [],
        });
      }

      programMap.get(programType).offers.push({
        bank: offer.bank?.name,
        rate: offer.rate,
        minPVPercent: offer.minPVPercent,
      });
    }

    return Array.from(programMap.values()).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );
  }
}

export default ProgramService;
