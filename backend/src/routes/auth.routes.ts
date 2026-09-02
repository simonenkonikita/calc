// backend/src/routes/auth.routes.ts
import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controllers/auth.controller";
import { AuthRequest } from "../types/auth.types";
import {
  adminOnly,
  developerAdminOnly,
  developerOrAdmin,
  agentOnly,
  companyAccess,
  canView,
  canEdit,
} from "../strategies/role.strategy";

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

// ✅ Текущий пользователь
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  authController.me.bind(authController),
);

// ✅ Обновление профиля
router.put(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  authController.updateProfile.bind(authController),
);

// ✅ Смена пароля
router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  authController.changePassword.bind(authController),
);

// ============================================================
// АДМИН МАРШРУТЫ (только для администратора)
// ============================================================

// ✅ Все пользователи
router.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  adminOnly,
  authController.getAllUsers.bind(authController),
);

// ✅ Обновление пользователя
router.put(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  adminOnly,
  authController.updateUser.bind(authController),
);

// ✅ Удаление пользователя
router.delete(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  adminOnly,
  authController.deleteUser.bind(authController),
);

// ============================================================
// ПРИМЕРЫ МАРШРУТОВ С РАЗНЫМИ ПРАВАМИ
// ============================================================

// Только администратор
router.get(
  "/admin-only",
  passport.authenticate("jwt", { session: false }),
  adminOnly,
  (req, res) => {
    const user = (req as AuthRequest).user;
    res.json({
      success: true,
      message: "Добро пожаловать, администратор!",
      user,
    });
  },
);

// Только разработчики
router.get(
  "/developer-only",
  passport.authenticate("jwt", { session: false }),
  developerAdminOnly,
  (req, res) => {
    const user = (req as AuthRequest).user;
    res.json({
      success: true,
      message: "Добро пожаловать, разработчик!",
      user,
    });
  },
);

// Только агенты
router.get(
  "/agent-only",
  passport.authenticate("jwt", { session: false }),
  agentOnly,
  (req, res) => {
    const user = (req as AuthRequest).user;
    res.json({
      success: true,
      message: "Добро пожаловать, агент!",
      user,
    });
  },
);

// Просмотр ресурса (для всех авторизованных)
router.get(
  "/resource/:id",
  passport.authenticate("jwt", { session: false }),
  canView,
  (req, res) => {
    const user = (req as AuthRequest).user;
    res.json({
      success: true,
      message: "Просмотр ресурса разрешен",
      user,
    });
  },
);

// Редактирование ресурса (только admin и developer)
router.put(
  "/resource/:id",
  passport.authenticate("jwt", { session: false }),
  canEdit,
  (req, res) => {
    const user = (req as AuthRequest).user;
    res.json({
      success: true,
      message: "Редактирование ресурса разрешено",
      user,
    });
  },
);

// Доступ к компании (с проверкой прав)
router.get(
  "/company/:companyId",
  passport.authenticate("jwt", { session: false }),
  companyAccess,
  (req, res) => {
    const user = (req as AuthRequest).user;
    res.json({
      success: true,
      message: "Доступ к компании разрешен",
      user,
      companyId: req.params.companyId,
    });
  },
);

export default router;
