// backend/src/controllers/admin/base.controller.ts

import { Response } from "express";

export class BaseController {
  protected handleError(res: Response, error: any, message: string) {
    console.error(`❌ ${message}:`, error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : message,
    });
  }

  protected handleNotFound(res: Response, entity: string) {
    return res.status(404).json({
      success: false,
      error: `${entity} not found`,
    });
  }

  protected cleanData(data: any): any {
    const clean = { ...data };
    const systemFields = [
      "id",
      "slug",
      "createdAt",
      "created_at",
      "updatedAt",
      "updated_at",
    ];
    systemFields.forEach((field) => delete clean[field]);
    return clean;
  }
}
