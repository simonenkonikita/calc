// backend/src/routes/auth.routes.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  authMiddleware,
  adminOnly,
  adminOrDeveloperAdmin,
  checkWriteAccess,
} from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// ============================================================
// ПУБЛИЧНЫЕ МАРШРУТЫ
// ============================================================
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/logout", authController.logout.bind(authController));

// ============================================================
// ЗАЩИЩЕННЫЕ МАРШРУТЫ
// ============================================================
router.get("/me", authMiddleware, authController.me.bind(authController));
router.put(
  "/profile",
  authMiddleware,
  authController.updateProfile.bind(authController),
);
router.post(
  "/change-password",
  authMiddleware,
  authController.changePassword.bind(authController),
);

// ============================================================
// УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (С УЧЕТОМ ПРАВ)
// ============================================================
router.get(
  "/users",
  authMiddleware,
  adminOrDeveloperAdmin,
  authController.getAllUsers.bind(authController),
);
router.get(
  "/companies/:companyId/users",
  authMiddleware,
  adminOrDeveloperAdmin,
  authController.getUsersByCompany.bind(authController),
);
router.put(
  "/users/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  authController.updateUser.bind(authController),
);
router.delete(
  "/users/:id",
  authMiddleware,
  adminOrDeveloperAdmin,
  authController.deleteUser.bind(authController),
);

// ============================================================
// 🔥 СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ АДМИНИСТРАТОРОМ
// ============================================================
router.post(
  "/admin/users",
  authMiddleware,
  adminOnly,
  authController.createUserByAdmin.bind(authController),
);

// ============================================================
// СОЗДАНИЕ КОМПАНИИ(ТОЛЬКО АДМИН)
// ============================================================
router.post(
  "/admin/companies",
  authMiddleware,
  adminOnly,
  authController.createCompany.bind(authController),
);

// ============================================================
// СОЗДАНИЕ МЕНЕДЖЕРА (АДМИН КОМПАНИИ ИЛИ АДМИН ПРОЕКТА)
// ============================================================
router.post(
  "/admin/company-managers",
  authMiddleware,
  checkWriteAccess,
  authController.createCompanyManager.bind(authController),
);

export default router;
