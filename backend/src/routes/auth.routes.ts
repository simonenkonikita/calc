// backend/src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  authMiddleware,
  adminOnly,
  developerAdminOnly,
  developerOnly,
  agentOnly,
  companyAccess,
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

// ✅ Текущий пользователь
router.get("/me", authMiddleware, authController.me.bind(authController));

// ✅ Обновление профиля
router.put(
  "/profile",
  authMiddleware,
  authController.updateProfile.bind(authController),
);

// ✅ Смена пароля
router.post(
  "/change-password",
  authMiddleware,
  authController.changePassword.bind(authController),
);

// ============================================================
// АДМИН МАРШРУТЫ
// ============================================================

// ✅ Все пользователи
router.get(
  "/users",
  authMiddleware,
  adminOnly,
  authController.getAllUsers.bind(authController),
);

// ✅ Обновление пользователя
router.put(
  "/users/:id",
  authMiddleware,
  adminOnly,
  authController.updateUser.bind(authController),
);

// ✅ Удаление пользователя
router.delete(
  "/users/:id",
  authMiddleware,
  adminOnly,
  authController.deleteUser.bind(authController),
);

// ============================================================
// ПРИМЕРЫ С РАЗНЫМИ ПРАВАМИ
// ============================================================

// Только администратор
router.get("/admin-only", authMiddleware, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Добро пожаловать, администратор!",
    user: (req as any).user,
  });
});

// Только застройщик
router.get("/developer-only", authMiddleware, developerOnly, (req, res) => {
  res.json({
    success: true,
    message: "Добро пожаловать, застройщик!",
    user: (req as any).user,
  });
});

// Только агент
router.get("/agent-only", authMiddleware, agentOnly, (req, res) => {
  res.json({
    success: true,
    message: "Добро пожаловать, агент!",
    user: (req as any).user,
  });
});

// Доступ к компании
router.get("/company/:companyId", authMiddleware, companyAccess, (req, res) => {
  res.json({
    success: true,
    message: "Доступ к компании разрешен",
    user: (req as any).user,
    companyId: req.params.companyId,
  });
});

export default router;
