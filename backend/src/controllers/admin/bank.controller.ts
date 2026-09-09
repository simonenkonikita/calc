// backend/src/controllers/admin/bank.controller.ts

import { Request, Response } from "express";
import { BaseController } from "./base.controller";
import { AuthRequest } from "../../types/auth.types";
import { BankService } from "../../services/BankService";

const bankService = new BankService();

export class BankController extends BaseController {
  /**
   * Получить все банки
   */
  async getAll(req: Request, res: Response) {
    try {
      const banks = await bankService.getAllBanks();
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
      const bank = await bankService.getBankById(id);

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
  async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const currentUser = req.user;

      console.log("📝 Creating bank with data:", data);

      const bank = await bankService.createBank(
        data,
        currentUser?.id,
        currentUser?.firstName,
        currentUser?.lastName,
      );

      console.log("✅ Bank created:", bank);
      res.status(201).json(bank);
    } catch (error) {
      this.handleError(res, error, "Failed to create bank");
    }
  }

  /**
   * Обновить банк
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const currentUser = req.user;

      console.log(`📝 Updating bank ${id} with data:`, data);

      const bank = await bankService.updateBank(
        id,
        data,
        currentUser?.id,
        currentUser?.firstName,
        currentUser?.lastName,
      );

      if (!bank) {
        return this.handleNotFound(res, "Bank");
      }

      console.log("✅ Bank updated:", bank);
      res.json(bank);
    } catch (error) {
      this.handleError(res, error, "Failed to update bank");
    }
  }

  /**
   * Удалить банк
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      console.log(`🗑️ Deleting bank ${id}`);

      const result = await bankService.deleteBank(
        id,
        currentUser?.id,
        currentUser?.firstName,
        currentUser?.lastName,
      );

      if (!result) {
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
