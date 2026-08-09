// backend/src/services/BankService.ts
import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";

export class BankService {
  private bankRepository = AppDataSource.getRepository(Bank);

  async getAllBanks() {
    return await this.bankRepository.find({
      order: { displayOrder: "ASC" },
    });
  }

  async getBankById(id: string) {
    return await this.bankRepository.findOne({ where: { id } });
  }

  async getBankBySlug(slug: string) {
    return await this.bankRepository.findOne({ where: { slug } });
  }
}
