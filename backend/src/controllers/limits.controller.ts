// backend/src/controllers/limits.controller.ts

import { Request, Response } from "express";
import ConfigService from "../services/ConfigService";

const configService = new ConfigService();

export const getLimits = async (req: Request, res: Response) => {
  try {
    const variables = await configService.getVariables();
    res.json({
      success: true,
      data: variables,
    });
  } catch (error) {
    console.error("Error getting limits:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        error: "System configuration not found. Please contact administrator.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to get limits",
    });
  }
};
