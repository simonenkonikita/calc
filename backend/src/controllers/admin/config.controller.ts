// backend/src/controllers/admin/config.controller.ts

import { Request, Response } from "express";
import ConfigService from "../../services/ConfigService";
import { BaseController } from "./base.controller";

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

      const config = await configService.updateConfig(data);
      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update config");
    }
  }
}

export const configController = new ConfigController();
