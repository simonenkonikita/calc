// backend/src/controllers/admin/complex.controller.ts

import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Complex } from "../../entities/Complex";
import { ApartmentType } from "../../entities/ApartmentType";
import { BaseController } from "./base.controller";
import { AuthRequest } from "../../types/auth.types";
import { ComplexService } from "../../services/ComplexService";

const complexService = new ComplexService();
const apartmentTypeRepository = AppDataSource.getRepository(ApartmentType);

export class ComplexController extends BaseController {
  /**
   * Получить все ЖК (с учетом прав пользователя)
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      let where: any = {};

      if (user && user.role !== "admin") {
        where.companyId = user.companyId;
      }

      const complexes = await complexService.getAllComplexes();

      // Фильтруем по компании если не админ
      const filtered =
        user?.role === "admin"
          ? complexes
          : complexes.filter((c) => c.companyId === user?.companyId);

      res.json({ success: true, data: filtered });
    } catch (error) {
      this.handleError(res, error, "Failed to get complexes");
    }
  }

  /**
   * Получить ЖК по ID
   */
  async getOne(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      const complex = await complexService.getComplexById(id);

      if (!complex) {
        return this.handleNotFound(res, "Complex");
      }

      if (user?.role !== "admin") {
        if (complex.companyId !== user?.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы не можете просматривать этот ЖК",
          });
        }
      }

      res.json({ success: true, data: complex });
    } catch (error) {
      this.handleError(res, error, "Failed to get complex");
    }
  }

  /**
   * Создать ЖК (только admin или developer_admin) с типами квартир
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const currentUser = req.user;

      // Проверяем права
      if (
        !currentUser ||
        (currentUser.role !== "admin" && currentUser.role !== "developer_admin")
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор проекта или компании может создавать ЖК",
        });
      }

      // Если developer_admin, привязываем к его компании
      if (currentUser.role === "developer_admin") {
        if (!currentUser.companyId) {
          return res.status(400).json({
            success: false,
            error: "У вас нет компании",
          });
        }
        data.companyId = currentUser.companyId;
      }

      // Для ADMIN - проверяем, что companyId передан
      if (currentUser.role === "admin" && !data.companyId) {
        return res.status(400).json({
          success: false,
          error: "Для создания ЖК необходимо указать companyId",
        });
      }

      // Валидация
      if (!data.name) {
        return res.status(400).json({
          success: false,
          error: "Name is required",
        });
      }

      if (!data.status) {
        return res.status(400).json({
          success: false,
          error: "Status is required",
        });
      }

      // 🔥 СОЗДАЕМ ЖК ЧЕРЕЗ СЕРВИС
      const complex = await complexService.createComplex(
        data,
        currentUser.id,
        currentUser.firstName,
        currentUser.lastName,
      );

      // 🔥 СОЗДАЕМ ТИПЫ КВАРТИР
      if (data.apartmentTypes && data.apartmentTypes.length > 0) {
        for (const at of data.apartmentTypes) {
          const apartmentType = apartmentTypeRepository.create({
            type: at.type,
            pricePerSquareMeter: at.pricePerSquareMeter,
            surcharges: at.surcharges || {
              withoutDownPayment: 0,
              partialDownPayment: 0,
            },
            isActive: at.isActive !== undefined ? at.isActive : true,
            complexId: complex.id,
          });
          await apartmentTypeRepository.save(apartmentType);
        }
      }

      // Возвращаем созданный ЖК с отношениями
      const created = await complexService.getComplexById(complex.id);

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      this.handleError(res, error, "Failed to create complex");
    }
  }

  /**
   * Обновить ЖК (с проверкой прав)
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const currentUser = req.user;

      const existingComplex = await complexService.getComplexById(id);

      if (!existingComplex) {
        return this.handleNotFound(res, "Complex");
      }

      // Проверяем права
      if (currentUser?.role === "developer_admin") {
        if (existingComplex.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы можете редактировать только свои ЖК",
          });
        }
      } else if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Недостаточно прав",
        });
      }

      // 🔥 ОБНОВЛЯЕМ ЖК ЧЕРЕЗ СЕРВИС
      const updated = await complexService.updateComplex(
        id,
        data,
        currentUser.id,
        currentUser.firstName,
        currentUser.lastName,
      );

      // 🔥 ОБНОВЛЯЕМ ТИПЫ КВАРТИР (если переданы)
      if (data.apartmentTypes && data.apartmentTypes.length > 0) {
        await apartmentTypeRepository.delete({ complexId: id });
        for (const at of data.apartmentTypes) {
          const apartmentType = apartmentTypeRepository.create({
            type: at.type,
            pricePerSquareMeter: at.pricePerSquareMeter,
            surcharges: at.surcharges || {
              withoutDownPayment: 0,
              partialDownPayment: 0,
            },
            isActive: at.isActive !== undefined ? at.isActive : true,
            complexId: id,
          });
          await apartmentTypeRepository.save(apartmentType);
        }
      }

      // Возвращаем обновленный ЖК с отношениями
      const result = await complexService.getComplexById(id);

      res.json({ success: true, data: result });
    } catch (error) {
      this.handleError(res, error, "Failed to update complex");
    }
  }

  /**
   * Удалить ЖК (с проверкой прав)
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const existingComplex = await complexService.getComplexById(id);

      if (!existingComplex) {
        return this.handleNotFound(res, "Complex");
      }

      // Проверяем права
      if (currentUser?.role === "developer_admin") {
        if (existingComplex.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы можете удалять только свои ЖК",
          });
        }
      } else if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Недостаточно прав",
        });
      }

      // 🔥 УДАЛЯЕМ ТИПЫ КВАРТИР
      if (
        existingComplex.apartmentTypes &&
        existingComplex.apartmentTypes.length > 0
      ) {
        await apartmentTypeRepository.delete({ complexId: id });
      }

      // 🔥 УДАЛЯЕМ ЖК ЧЕРЕЗ СЕРВИС
      const result = await complexService.deleteComplex(
        id,
        currentUser.id,
        currentUser.firstName,
        currentUser.lastName,
      );

      if (!result) {
        return this.handleNotFound(res, "Complex");
      }

      res.json({ success: true, message: "Complex deleted successfully" });
    } catch (error) {
      this.handleError(res, error, "Failed to delete complex");
    }
  }

  // ============================================================
  // 🔥 УПРАВЛЕНИЕ УСЛОВИЯМИ ОПЛАТЫ
  // ============================================================

  /**
   * Добавить условие оплаты
   */
  addPaymentTerm = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { term } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (!term || term.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Условие оплаты обязательно",
        });
      }

      const complex = await complexService.addPaymentTerm(
        id,
        term.trim(),
        user.id,
        user.firstName,
        user.lastName,
      );

      if (!complex) {
        return res.status(404).json({
          success: false,
          error: "ЖК не найден",
        });
      }

      res.json({
        success: true,
        data: complex.paymentTerms,
        message: "Условие оплаты добавлено",
      });
    } catch (error) {
      console.error("Error adding payment term:", error);
      res.status(500).json({
        success: false,
        error: "Ошибка добавления условия оплаты",
      });
    }
  };

  /**
   * Удалить условие оплаты
   */
  removePaymentTerm = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { term } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (!term || term.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Условие оплаты обязательно",
        });
      }

      const complex = await complexService.removePaymentTerm(
        id,
        term.trim(),
        user.id,
        user.firstName,
        user.lastName,
      );

      if (!complex) {
        return res.status(404).json({
          success: false,
          error: "ЖК не найден",
        });
      }

      res.json({
        success: true,
        data: complex.paymentTerms,
        message: "Условие оплаты удалено",
      });
    } catch (error) {
      console.error("Error removing payment term:", error);
      res.status(500).json({
        success: false,
        error: "Ошибка удаления условия оплаты",
      });
    }
  };

  /**
   * Обновить все условия оплаты (массовое обновление)
   */
  updatePaymentTerms = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { terms } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Не авторизован",
        });
      }

      if (!terms || !Array.isArray(terms)) {
        return res.status(400).json({
          success: false,
          error: "Массив условий оплаты обязателен",
        });
      }

      const complex = await complexService.updatePaymentTerms(
        id,
        terms,
        user.id,
        user.firstName,
        user.lastName,
      );

      if (!complex) {
        return res.status(404).json({
          success: false,
          error: "ЖК не найден",
        });
      }

      res.json({
        success: true,
        data: complex.paymentTerms,
        message: "Условия оплаты обновлены",
      });
    } catch (error) {
      console.error("Error updating payment terms:", error);
      res.status(500).json({
        success: false,
        error: "Ошибка обновления условий оплаты",
      });
    }
  };
}

export const complexController = new ComplexController();
