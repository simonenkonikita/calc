// backend/src/services/OfferService.ts

import { AppDataSource } from "../data-source";
import { Offer } from "../entities/Offer";
import { Bank } from "../entities/Bank";
import { Program } from "../entities/Program";
import { CreateOfferDTO, UpdateOfferDTO } from "../dtos/OfferDto";
import { In } from "typeorm";

export class OfferService {
  private offerRepository = AppDataSource.getRepository(Offer);
  private bankRepository = AppDataSource.getRepository(Bank);
  private programRepository = AppDataSource.getRepository(Program);

  // Получить все офферы
  async getAllOffers(): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: { isActive: true },
      order: { bank: { displayOrder: "ASC" } },
    });
  }

  // Получить офферы по банку
  async getOffersByBank(bankId: string): Promise<Offer[]> {
    return await this.offerRepository.find({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: {
        bankId,
        isActive: true,
      },
    });
  }

  // Получить офферы по ЖК
  async getOffersByComplex(complexName: string): Promise<Offer[]> {
    // Получаем все активные офферы
    const allOffers = await this.offerRepository.find({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: { isActive: true },
      order: { bank: { displayOrder: "ASC" } },
    });

    // Фильтруем в JavaScript
    return allOffers.filter((offer) => {
      // Если complexes === null или пустой массив - оффер доступен для всех ЖК
      if (!offer.complexes || offer.complexes.length === 0) {
        return true;
      }
      // Проверяем, есть ли complexName в массиве
      return offer.complexes.includes(complexName);
    });
  }

  // Получить оффер по ID
  async getOfferById(id: string): Promise<Offer | null> {
    return await this.offerRepository.findOne({
      relations: ["bank", "programEntity", "dynamicRates", "dynamicSubsidies"],
      where: { id },
    });
  }

  // 🔥 СОЗДАТЬ ОФФЕР С НОВЫМИ ПОЛЯМИ
  async createOffer(data: CreateOfferDTO): Promise<Offer> {
    const bank = await this.bankRepository.findOne({
      where: { id: data.bankId },
    });

    if (!bank) {
      throw new Error("Bank not found");
    }

    const program = await this.programRepository.findOne({
      where: { id: data.programId },
    });

    if (!program) {
      throw new Error("Program not found");
    }

    const offer = this.offerRepository.create({
      ...data,
      bank,
      programEntity: program,
    });

    return await this.offerRepository.save(offer);
  }

  // 🔥 ОБНОВИТЬ ОФФЕР С НОВЫМИ ПОЛЯМИ
  async updateOffer(id: string, data: UpdateOfferDTO): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ["bank", "programEntity"],
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    // Обновляем банк если передан
    if (data.bankId) {
      const bank = await this.bankRepository.findOne({
        where: { id: data.bankId },
      });
      if (bank) {
        offer.bank = bank;
        offer.bankId = data.bankId;
      }
    }

    // Обновляем программу если передана
    if (data.programId) {
      const program = await this.programRepository.findOne({
        where: { id: data.programId },
      });
      if (program) {
        offer.programEntity = program;
        offer.programId = data.programId;
      }
    }

    // Обновляем остальные поля
    Object.assign(offer, data);

    return await this.offerRepository.save(offer);
  }

  // 🔥 ПОЛУЧИТЬ ДИНАМИЧЕСКИЕ СТАВКИ ДЛЯ ОФФЕРА
  async getDynamicRatesForOffer(offerId: string): Promise<any> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ["dynamicRates"],
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    // Сортируем по приоритету (меньше - выше приоритет)
    return (
      offer.dynamicRates
        ?.filter((rate) => rate.isActive)
        .sort((a, b) => a.priority - b.priority) || []
    );
  }

  // 🔥 ПОЛУЧИТЬ ДИНАМИЧЕСКИЕ СУБСИДИИ ДЛЯ ОФФЕРА
  async getDynamicSubsidiesForOffer(offerId: string): Promise<any> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ["dynamicSubsidies"],
    });

    if (!offer) {
      throw new Error("Offer not found");
    }

    return (
      offer.dynamicSubsidies
        ?.filter((subsidy) => subsidy.isActive)
        .sort((a, b) => a.priority - b.priority) || []
    );
  }

  // 🔥 УДАЛИТЬ ОФФЕР (мягкое удаление)
  async deleteOffer(id: string): Promise<void> {
    await this.offerRepository.update(id, { isActive: false });
  }

  // 🔥 ВОССТАНОВИТЬ ОФФЕР
  async restoreOffer(id: string): Promise<void> {
    await this.offerRepository.update(id, { isActive: true });
  }
}
