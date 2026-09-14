// backend/src/controllers/admin/offer.controller.ts
import { Request, Response } from "express";
import { OfferService } from "../../services/OfferService";
import { CreateOfferDTO, UpdateOfferDTO } from "../../dtos/OfferDto";
import { BaseController } from "./base.controller";
import { AuthRequest } from "../../types/auth.types";
import { AppDataSource } from "../../data-source";
import { Offer } from "../../entities/Offer";

const offerService = new OfferService();
const offerRepository = AppDataSource.getRepository(Offer);

export class OfferController extends BaseController {
  /**
   * Получить все офферы (с учетом прав пользователя)
   */
  async getAll(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      // 🔥 ЯВНО УКАЗЫВАЕМ ТИП
      let offers: Offer[] = [];

      if (user?.role === "admin") {
        // Админ видит все
        offers = await offerService.getAllOffersAdmin();
      } else if (user?.role === "developer_admin" && user.companyId) {
        // Developer Admin видит только свои офферы
        offers = await offerRepository.find({
          where: { companyId: user.companyId, isActive: true },
          relations: [
            "bank",
            "programEntity",
            "dynamicRates",
            "dynamicSubsidies",
            "company",
          ],
          order: { createdAt: "DESC" },
        });
      } else if (user?.role === "developer_manager" && user.companyId) {
        // Manager видит только свои офферы (только чтение)
        offers = await offerRepository.find({
          where: { companyId: user.companyId, isActive: true },
          relations: [
            "bank",
            "programEntity",
            "dynamicRates",
            "dynamicSubsidies",
            "company",
          ],
          order: { createdAt: "DESC" },
        });
      }
      // else offers уже пустой массив

      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get offers");
    }
  }

  /**
   * Создать оффер (только admin или developer_admin)
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const data: CreateOfferDTO = req.body;
      const currentUser = req.user;

      // Проверяем права
      if (
        !currentUser ||
        (currentUser.role !== "admin" && currentUser.role !== "developer_admin")
      ) {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Только администратор может создавать офферы",
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
        // Передаем companyId в сервис
        data.companyId = currentUser.companyId;
      }

      const offer = await offerService.createOffer(data, currentUser.id);

      res.status(201).json({
        success: true,
        data: offer,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to create offer");
    }
  }

  /**
   * Обновить оффер (с проверкой прав)
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateOfferDTO = { id, ...req.body };
      const currentUser = req.user;

      // Проверяем существование
      const existingOffer = await offerRepository.findOne({
        where: { id },
        relations: ["company"],
      });

      if (!existingOffer) {
        return this.handleNotFound(res, "Offer");
      }

      // Проверяем права
      if (currentUser?.role === "developer_admin") {
        if (existingOffer.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error:
              "Доступ запрещен. Вы можете редактировать только свои офферы",
          });
        }
      } else if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Недостаточно прав",
        });
      }

      const offer = await offerService.updateOffer(id, data);

      res.json({
        success: true,
        data: offer,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to update offer");
    }
  }

  /**
   * Удалить оффер (с проверкой прав)
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const existingOffer = await offerRepository.findOne({
        where: { id },
        relations: ["company"],
      });

      if (!existingOffer) {
        return this.handleNotFound(res, "Offer");
      }

      // Проверяем права
      if (currentUser?.role === "developer_admin") {
        if (existingOffer.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы можете удалять только свои офферы",
          });
        }
      } else if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Доступ запрещен. Недостаточно прав",
        });
      }

      await offerService.deleteOffer(id);
      res.json({
        success: true,
        message: "Offer deleted successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to delete offer");
    }
  }

  /**
   * Получить активные офферы
   */
  async getActive(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      let offers: Offer[] = [];

      if (user?.role === "admin") {
        offers = await offerService.getAllOffers();
      } else if (user?.role === "developer_admin" && user.companyId) {
        offers = await offerRepository.find({
          where: { companyId: user.companyId, isActive: true },
          relations: [
            "bank",
            "programEntity",
            "dynamicRates",
            "dynamicSubsidies",
            "company",
          ],
          order: { createdAt: "DESC" },
        });
      } else if (user?.role === "developer_manager" && user.companyId) {
        offers = await offerRepository.find({
          where: { companyId: user.companyId, isActive: true },
          relations: [
            "bank",
            "programEntity",
            "dynamicRates",
            "dynamicSubsidies",
            "company",
          ],
          order: { createdAt: "DESC" },
        });
      }

      res.json({
        success: true,
        data: offers,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get active offers");
    }
  }

  /**
   * Получить оффер по ID (с проверкой прав)
   */
  async getOne(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const offer = await offerRepository.findOne({
        where: { id },
        relations: [
          "bank",
          "programEntity",
          "dynamicRates",
          "dynamicSubsidies",
          "company",
        ],
      });

      if (!offer) {
        return this.handleNotFound(res, "Offer");
      }

      // Проверяем права доступа
      if (currentUser?.role !== "admin") {
        if (offer.companyId !== currentUser?.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы не можете просматривать этот оффер",
          });
        }
      }

      res.json({
        success: true,
        data: offer,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get offer");
    }
  }

  /**
   * Восстановить оффер (только admin)
   */
  async restore(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор может восстанавливать офферы",
        });
      }

      await offerService.restoreOffer(id);
      res.json({
        success: true,
        message: "Offer restored successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to restore offer");
    }
  }

  /**
   * Полное удаление оффера (hard delete) - только admin
   */
  async hardDelete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      if (currentUser?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор может полностью удалять офферы",
        });
      }

      await offerService.hardDeleteOffer(id);
      res.json({
        success: true,
        message: "Offer permanently deleted",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to hard delete offer");
    }
  }

  /**
   * Копировать оффер
   */
  async copy(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Проверяем права на копирование
      if (
        !currentUser ||
        (currentUser.role !== "admin" && currentUser.role !== "developer_admin")
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Доступ запрещен. Только администратор может копировать офферы",
        });
      }

      // Проверяем существование
      const existingOffer = await offerRepository.findOne({
        where: { id },
        relations: ["company"],
      });

      if (!existingOffer) {
        return this.handleNotFound(res, "Offer");
      }

      // Проверяем права на копирование
      if (currentUser.role === "developer_admin") {
        if (existingOffer.companyId !== currentUser.companyId) {
          return res.status(403).json({
            success: false,
            error: "Доступ запрещен. Вы можете копировать только свои офферы",
          });
        }
      }

      const copy = await offerService.copyOffer(id);
      res.status(201).json({
        success: true,
        data: copy,
        message: "Offer copied successfully",
      });
    } catch (error) {
      this.handleError(res, error, "Failed to copy offer");
    }
  }

  /**
   * Получить офферы с фильтрацией
   */
  async getFiltered(req: AuthRequest, res: Response) {
    try {
      const filters = req.query;
      const user = req.user;

      let offers: Offer[] = [];

      // Если не админ, добавляем фильтр по компании
      if (user?.role !== "admin" && user?.companyId) {
        // Добавляем companyId в фильтры
        const filterData = {
          bankId: filters.bankId as string,
          programId: filters.programId as string,
          programType: filters.programType as string,
          complexName: filters.complexName as string,
          isActive: filters.isActive ? filters.isActive === "true" : undefined,
          minRate: filters.minRate
            ? parseFloat(filters.minRate as string)
            : undefined,
          maxRate: filters.maxRate
            ? parseFloat(filters.maxRate as string)
            : undefined,
          minPVPercent: filters.minPVPercent
            ? parseFloat(filters.minPVPercent as string)
            : undefined,
          maxPVPercent: filters.maxPVPercent
            ? parseFloat(filters.maxPVPercent as string)
            : undefined,
          search: filters.search as string,
          companyId: user.companyId, // 🔥 Добавляем фильтр по компании
        };
        offers = await offerService.getOffersFiltered(filterData);
      } else {
        offers = await offerService.getOffersFiltered({
          bankId: filters.bankId as string,
          programId: filters.programId as string,
          programType: filters.programType as string,
          complexName: filters.complexName as string,
          isActive: filters.isActive ? filters.isActive === "true" : undefined,
          minRate: filters.minRate
            ? parseFloat(filters.minRate as string)
            : undefined,
          maxRate: filters.maxRate
            ? parseFloat(filters.maxRate as string)
            : undefined,
          minPVPercent: filters.minPVPercent
            ? parseFloat(filters.minPVPercent as string)
            : undefined,
          maxPVPercent: filters.maxPVPercent
            ? parseFloat(filters.maxPVPercent as string)
            : undefined,
          search: filters.search as string,
        });
      }

      res.json({
        success: true,
        data: offers,
        count: offers.length,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to filter offers");
    }
  }

  /**
   * Получить диапазон ставок
   */
  async getRateRange(req: AuthRequest, res: Response) {
    try {
      const { bankId, programId, complexName } = req.query;
      const user = req.user;

      const range = await offerService.getRateRange({
        bankId: bankId as string,
        programId: programId as string,
        complexName: complexName as string,
        companyId: user?.role !== "admin" ? user?.companyId : undefined,
      });

      res.json({
        success: true,
        data: range,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to get rate range");
    }
  }
}

export const offerController = new OfferController();
