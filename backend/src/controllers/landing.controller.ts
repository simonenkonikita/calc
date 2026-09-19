import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Bank } from "../entities/Bank";
import { Program } from "../entities/Program";
import { Complex } from "../entities/Complex";
import { Offer } from "../entities/Offer";
import { Company } from "../entities/Company";

export class LandingController {
  async getStats(req: Request, res: Response) {
    try {
      const bankRepo = AppDataSource.getRepository(Bank);
      const programRepo = AppDataSource.getRepository(Program);
      const complexRepo = AppDataSource.getRepository(Complex);
      const offerRepo = AppDataSource.getRepository(Offer);
      const companyRepo = AppDataSource.getRepository(Company);

      const [banks, programs, complexes, offers, companies] = await Promise.all(
        [
          bankRepo.count({ where: { isActive: true } }),
          programRepo.count({ where: { isActive: true } }),
          complexRepo.count({ where: { isActive: true } }),
          offerRepo.count({ where: { isActive: true } }),
          companyRepo.count({ where: { isActive: true } }),
        ],
      );

      res.json({
        success: true,
        data: { banks, programs, complexes, offers, companies },
      });
    } catch (error) {
      console.error("Failed to get landing stats:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get landing stats",
      });
    }
  }
}

export const landingController = new LandingController();
