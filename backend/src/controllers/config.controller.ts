// backend/src/controllers/config.controller.ts
import { Request, Response } from "express";
import { ConfigService } from "../services/ConfigService";

const configService = new ConfigService();

export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await configService.getConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error getting config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get config",
    });
  }
};
