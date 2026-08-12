// backend/src/controllers/admin/bank.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Bank } from "../../entities/Bank";
import { CreateBankDTO, UpdateBankDTO } from "../../dtos/BankDto";
import { BaseController } from "./base.controller";

const bankRepository = AppDataSource.getRepository(Bank);

export class BankController extends BaseController {
  /**
   * Получить все банки
   */
  async getAll(req: Request, res: Response) {
    try {
      const banks = await bankRepository.find({
        order: { displayOrder: "ASC" },
      });
      res.json(banks);
    } catch (error) {
      this.handleError(res, error, "Failed to get banks");
    }
  }

  /**
   * Получить банк по ID
   */
  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bank = await bankRepository.findOne({ where: { id } });

      if (!bank) {
        return this.handleNotFound(res, "Bank");
      }

      res.json(bank);
    } catch (error) {
      this.handleError(res, error, "Failed to get bank");
    }
  }

  /**
   * Создать банк
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateBankDTO = req.body;
      console.log("📝 Creating bank with data:", data);

      const bank = bankRepository.create(data);
      await bankRepository.save(bank);

      console.log("✅ Bank created:", bank);
      res.status(201).json(bank);
    } catch (error) {
      this.handleError(res, error, "Failed to create bank");
    }
  }

  /**
   * Обновить банк
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateBankDTO = req.body;
      console.log(`📝 Updating bank ${id} with data:`, data);

      const existingBank = await bankRepository.findOne({
        where: { id },
      });

      if (!existingBank) {
        return this.handleNotFound(res, "Bank");
      }

      // Обновляем только поля из DTO
      if (data.name !== undefined) existingBank.name = data.name;
      if (data.baseRate !== undefined) existingBank.baseRate = data.baseRate;
      if (data.minPVPercent !== undefined)
        existingBank.minPVPercent = data.minPVPercent;
      if (data.displayOrder !== undefined)
        existingBank.displayOrder = data.displayOrder;
      if (data.isActive !== undefined) existingBank.isActive = data.isActive;

      // Если изменилось имя, обновляем slug
      if (data.name && data.name !== existingBank.name) {
        const { generateSlug } = await import("../../utils/slugify");
        existingBank.slug = generateSlug(data.name);
      }

      await bankRepository.save(existingBank);
      console.log("✅ Bank updated:", existingBank);
      res.json(existingBank);
    } catch (error) {
      this.handleError(res, error, "Failed to update bank");
    }
  }

  /**
   * Удалить банк
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting bank ${id}`);

      const result = await bankRepository.delete(id);

      if (result.affected === 0) {
        return this.handleNotFound(res, "Bank");
      }

      console.log("✅ Bank deleted");
      res.json({ success: true, message: "Bank deleted successfully" });
    } catch (error) {
      this.handleError(res, error, "Failed to delete bank");
    }
  }
}

export const bankController = new BankController();
