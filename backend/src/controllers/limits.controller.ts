// backend/src/controllers/limits.controller.ts

import { Request, Response } from "express";
import { variables } from "../data/limitdDate";

export const getLimits = async (req: Request, res: Response) => {
  res.json({ success: true, data: variables });
};
