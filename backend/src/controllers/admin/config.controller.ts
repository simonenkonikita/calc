// backend/src/controllers/admin/config.controller.ts

import { Request, Response } from "express";
import ConfigService from "../../services/ConfigService";
import { BaseController } from "./base.controller";
import { SystemConfig } from "../../entities/SystemConfig";

const configService = new ConfigService();

export class ConfigController extends BaseController {
  /**
   * Получить конфигурацию
   */
  async get(req: Request, res: Response) {
    try {
      const config = await configService.getConfig();
      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get config");
    }
  }

  /**
   * Создать конфигурацию (если её нет)
   */
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      console.log("📝 Creating config with data:", data);

      // Валидация обязательных полей
      const requiredFields = [
        "familyMortgageLimit",
        "maxFamilyMortgageLimit",
        "itMortgageLimit",
        "maxItMortgageLimit",
        "minArea",
        "maxArea",
        "minDownPaymentPercent",
        "maxDownPaymentPercent",
        "minLoanTerm",
        "maxLoanTerm",
        "deposit",
        "bankOrder",
      ];

      const missingFields = requiredFields.filter(
        (field) => data[field] === undefined,
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const config = await configService.createConfig({
        familyMortgageLimit: data.familyMortgageLimit,
        maxFamilyMortgageLimit: data.maxFamilyMortgageLimit,
        itMortgageLimit: data.itMortgageLimit,
        maxItMortgageLimit: data.maxItMortgageLimit,
        minArea: data.minArea,
        maxArea: data.maxArea,
        minDownPaymentPercent: data.minDownPaymentPercent,
        maxDownPaymentPercent: data.maxDownPaymentPercent,
        minLoanTerm: data.minLoanTerm,
        maxLoanTerm: data.maxLoanTerm,
        deposit: data.deposit,
        bankOrder: data.bankOrder,
      });

      res.status(201).json({
        success: true,
        data: config,
        message: "System configuration created successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to create config");
    }
  }

  /**
   * Обновить конфигурацию
   */
  async update(req: Request, res: Response) {
    try {
      const data = req.body;
      console.log("📝 Updating config with data:", data);

      if (!data || typeof data !== "object") {
        return res.status(400).json({
          success: false,
          error: "Invalid config data",
        });
      }

      // ✅ Разрешаем обновлять ВСЕ поля
      const allowedFields = [
        "familyMortgageLimit",
        "maxFamilyMortgageLimit",
        "itMortgageLimit",
        "maxItMortgageLimit",
        "minArea",
        "maxArea",
        "minDownPaymentPercent",
        "maxDownPaymentPercent",
        "minLoanTerm",
        "maxLoanTerm",
        "deposit",
        "bankOrder",
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: `No valid fields to update. Allowed: ${allowedFields.join(", ")}`,
        });
      }

      const config = await configService.updateConfig(updateData);
      res.json({
        success: true,
        data: config,
        message: "Configuration updated successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update config");
    }
  }

  /**
   * Обновить конкретное поле
   */
  async updateField(req: Request, res: Response) {
    try {
      const { field } = req.params;
      const { value } = req.body;

      const allowedFields = [
        "familyMortgageLimit",
        "maxFamilyMortgageLimit",
        "itMortgageLimit",
        "maxItMortgageLimit",
        "minArea",
        "maxArea",
        "minDownPaymentPercent",
        "maxDownPaymentPercent",
        "minLoanTerm",
        "maxLoanTerm",
        "deposit",
        "bankOrder",
      ];

      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          success: false,
          error: `Field "${field}" is not allowed. Allowed: ${allowedFields.join(", ")}`,
        });
      }

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: "Value is required",
        });
      }

      const config = await configService.updateConfigField(
        field as keyof SystemConfig,
        value,
      );

      res.json({
        success: true,
        data: config,
        message: `Field "${field}" updated successfully`,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update config field");
    }
  }

  /**
   * Проверить наличие конфигурации
   */
  async check(req: Request, res: Response) {
    try {
      const hasConfig = await configService.hasConfig();
      res.json({
        success: true,
        data: {
          exists: hasConfig,
        },
      });
    } catch (error) {
      this.handleError(res, error, "Failed to check config");
    }
  }
}

export const configController = new ConfigController();
