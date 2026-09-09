// backend/src/services/BankService.ts

import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";
import { Complex } from "../entities/Complex";
import { In } from "typeorm";
import { generateSlug } from "../utils/slugify";
import { NotificationService } from "./NotificationService";

export class BankService {
  private bankRepository = AppDataSource.getRepository(Bank);
  private complexRepository = AppDataSource.getRepository(Complex);
  private notificationService = new NotificationService();

  async getAllBanks(): Promise<Bank[]> {
    return await this.bankRepository.find({
      order: { displayOrder: "ASC" },
    });
  }

  async getBankById(id: string): Promise<Bank | null> {
    return await this.bankRepository.findOne({
      where: { id },
      relations: ["offers"],
    });
  }

  async getBankBySlug(slug: string): Promise<Bank | null> {
    return await this.bankRepository.findOne({
      where: { slug },
      relations: ["offers"],
    });
  }

  async getBankByName(name: string): Promise<Bank | null> {
    return await this.bankRepository.findOne({
      where: { name },
      relations: ["offers"],
    });
  }

  async createBank(
    data: Partial<Bank>,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Bank> {
    const slug = data.slug || generateSlug(data.name || "");

    const bank = this.bankRepository.create({
      ...data,
      slug,
    });

    const savedBank = await this.bankRepository.save(bank);

    // 🔥 УВЕДОМЛЕНИЕ О СОЗДАНИИ БАНКА
    if (savedBank.name) {
      const allComplexes = await this.complexRepository.find({
        relations: ["company"],
      });

      const complexesWithBank = allComplexes.filter(
        (c) => c.banks && c.banks.includes(savedBank.name),
      );

      const companyIds = new Set(
        complexesWithBank
          .map((c) => c.companyId)
          .filter((id): id is string => id !== null && id !== undefined),
      );

      for (const companyId of companyIds) {
        await this.notificationService.notifyBankGlobal(
          companyId,
          savedBank.name,
          "added",
          {
            id: userId || "system",
            firstName: userFirstName || "Система",
            lastName: userLastName || "",
          },
        );
      }
    }

    return savedBank;
  }

  async updateBank(
    id: string,
    data: Partial<Bank>,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<Bank | null> {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      return null;
    }

    // 🔥 ОТСЛЕЖИВАЕМ ИЗМЕНЕНИЯ
    const changes: string[] = [];
    const oldName = bank.name;

    if (data.name !== undefined && data.name !== bank.name) {
      changes.push(`название с "${bank.name}" на "${data.name}"`);
    }
    if (data.baseRate !== undefined && data.baseRate !== bank.baseRate) {
      changes.push(`базовую ставку с ${bank.baseRate}% на ${data.baseRate}%`);
    }
    if (
      data.minPVPercent !== undefined &&
      data.minPVPercent !== bank.minPVPercent
    ) {
      changes.push(`мин. ПВ с ${bank.minPVPercent}% на ${data.minPVPercent}%`);
    }
    if (data.isActive !== undefined && data.isActive !== bank.isActive) {
      changes.push(data.isActive ? "банк активирован" : "банк деактивирован");
    }

    // Если имя изменилось, обновляем slug
    if (data.name && data.name !== bank.name) {
      data.slug = generateSlug(data.name);
    }

    Object.assign(bank, data);
    const updatedBank = await this.bankRepository.save(bank);

    // 🔥 УВЕДОМЛЕНИЕ ОБ ИЗМЕНЕНИЯХ
    if (changes.length > 0) {
      const allComplexes = await this.complexRepository.find({
        relations: ["company"],
      });

      const complexesWithBank = allComplexes.filter(
        (c) => c.banks && c.banks.includes(oldName),
      );

      const companyIds = new Set(
        complexesWithBank
          .map((c) => c.companyId)
          .filter((id): id is string => id !== null && id !== undefined),
      );

      for (const companyId of companyIds) {
        await this.notificationService.notifyBankUpdated(
          companyId,
          updatedBank.name,
          changes,
          {
            id: userId || "system",
            firstName: userFirstName || "Система",
            lastName: userLastName || "",
          },
        );
      }
    }

    return updatedBank;
  }

  async deleteBank(
    id: string,
    userId?: string,
    userFirstName?: string,
    userLastName?: string,
  ): Promise<boolean> {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      return false;
    }

    const bankName = bank.name;

    const result = await this.bankRepository.delete(id);

    // 🔥 УВЕДОМЛЕНИЕ ОБ УДАЛЕНИИ
    if (bankName && result.affected && result.affected > 0) {
      const allComplexes = await this.complexRepository.find({
        relations: ["company"],
      });

      const complexesWithBank = allComplexes.filter(
        (c) => c.banks && c.banks.includes(bankName),
      );

      const companyIds = new Set(
        complexesWithBank
          .map((c) => c.companyId)
          .filter((id): id is string => id !== null && id !== undefined),
      );

      for (const companyId of companyIds) {
        await this.notificationService.notifyBankGlobal(
          companyId,
          bankName,
          "removed",
          {
            id: userId || "system",
            firstName: userFirstName || "Система",
            lastName: userLastName || "",
          },
        );
      }
    }

    return result.affected ? result.affected > 0 : false;
  }

  async toggleBankActive(id: string): Promise<Bank | null> {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      return null;
    }

    bank.isActive = !bank.isActive;
    return await this.bankRepository.save(bank);
  }

  async reorderBanks(order: string[]): Promise<Bank[]> {
    const banks = await this.bankRepository.find({
      where: { id: In(order) },
    });

    for (const bank of banks) {
      const index = order.indexOf(bank.id);
      if (index !== -1) {
        bank.displayOrder = index;
      }
    }

    return await this.bankRepository.save(banks);
  }

  async getBanksByIds(ids: string[]): Promise<Bank[]> {
    return await this.bankRepository.find({
      where: { id: In(ids) },
      order: { displayOrder: "ASC" },
    });
  }
}
