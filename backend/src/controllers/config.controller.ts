// backend/src/controllers/config.controller.ts

import { Request, Response } from "express";
import { ConfigService } from "../services/ConfigService";

const configService = new ConfigService();

/**
 * Получить конфигурацию
 */
export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await configService.getConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error getting config:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "System configuration not found. Please contact administrator.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to get config",
    });
  }
};
