// backend/src/services/BankService.ts

import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";
import { In } from "typeorm"; // 🔥 ДОБАВЛЯЕМ ИМПОРТ
import { generateSlug } from "../utils/slugify";

export class BankService {
  private bankRepository = AppDataSource.getRepository(Bank);

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

  async createBank(data: Partial<Bank>): Promise<Bank> {
    const slug = data.slug || generateSlug(data.name || "");

    const bank = this.bankRepository.create({
      ...data,
      slug,
    });

    return await this.bankRepository.save(bank);
  }

  async updateBank(id: string, data: Partial<Bank>): Promise<Bank | null> {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      return null;
    }

    // Если имя изменилось, обновляем slug
    if (data.name && data.name !== bank.name) {
      data.slug = generateSlug(data.name);
    }

    Object.assign(bank, data);
    return await this.bankRepository.save(bank);
  }

  async deleteBank(id: string): Promise<boolean> {
    const result = await this.bankRepository.delete(id);
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

  // 🔥 ИСПРАВЛЕННЫЙ МЕТОД С ИСПОЛЬЗОВАНИЕМ In
  async reorderBanks(order: string[]): Promise<Bank[]> {
    const banks = await this.bankRepository.find({
      where: { id: In(order) }, // 🔥 ИСПОЛЬЗУЕМ In(order)
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
