// backend/src/controllers/admin/apartment-type.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { ApartmentType } from "../../entities/ApartmentType";
import { Complex } from "../../entities/Complex";
import { BaseController } from "./base.controller";

const apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);
const complexRepository = AppDataSource.getRepository(Complex);

export class ApartmentTypeController extends BaseController {
  /**
   * Получить типы квартир для ЖК
   */
  async getByComplex(req: Request, res: Response) {
    try {
      const { complexId } = req.params;
      const types = await apartmentTypeRepository.find({
        where: { complexId },
        order: { type: "ASC" },
      });
      res.json(types);
    } catch (error) {
      this.handleError(res, error, "Failed to get apartment types");
    }
  }

  /**
   * Создать тип квартиры
   */
  async create(req: Request, res: Response) {
    try {
      const { complexId } = req.params;
      const data = this.cleanData(req.body);

      const complex = await complexRepository.findOne({
        where: { id: complexId },
      });

      if (!complex) {
        return this.handleNotFound(res, "Complex");
      }

      const apartmentType = apartmentTypeRepository.create({
        ...data,
        complexId,
      });

      await apartmentTypeRepository.save(apartmentType);
      res.status(201).json(apartmentType);
    } catch (error) {
      this.handleError(res, error, "Failed to create apartment type");
    }
  }

  /**
   * Обновить тип квартиры
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = this.cleanData(req.body);

      const existing = await apartmentTypeRepository.findOne({
        where: { id },
      });

      if (!existing) {
        return this.handleNotFound(res, "Apartment type");
      }

      await apartmentTypeRepository.update(id, data);
      const updated = await apartmentTypeRepository.findOneBy({ id });

      res.json(updated);
    } catch (error) {
      this.handleError(res, error, "Failed to update apartment type");
    }
  }

  /**
   * Удалить тип квартиры
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await apartmentTypeRepository.delete(id);
      res.json({ success: true, message: "Apartment type deleted" });
    } catch (error) {
      this.handleError(res, error, "Failed to delete apartment type");
    }
  }
}

export const apartmentTypeController = new ApartmentTypeController();
