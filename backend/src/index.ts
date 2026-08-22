// server/src/index.ts

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import calculatorRoutes from "./routes/calculator.routes";
import banksRoutes from "./routes/banks.routes";
import limitsRoutes from "./routes/limits.routes";
import projectsRoutes from "./routes/projects.routes";
import configRoutes from "./routes/config.routes";
import adminRoutes from "./routes/admin.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Mortgage Calculator API",
  });
});

// Роуты
app.use("/api/config", configRoutes);
app.use("/api/calculator", calculatorRoutes);
app.use("/api/banks", banksRoutes);
app.use("/api/limits", limitsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// 🔥 ЗАПУСК СЕРВЕРА С ПРОВЕРКОЙ
async function startServer() {
  try {
    // Проверяем, инициализирована ли БД
    if (AppDataSource.isInitialized) {
      console.log("✅ Database already connected");
    } else {
      console.log("🔄 Connecting to database...");
      await AppDataSource.initialize();
      console.log("✅ Database connected successfully");
      console.log(
        "📊 Entities loaded:",
        AppDataSource.entityMetadatas.map((e) => e.name),
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
    });
  } catch (error: any) {
    if (error.message?.includes("already established")) {
      console.log("ℹ️ Database connection already established");
      // Пытаемся получить существующее соединение
      try {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
      } catch (e) {
        console.error("❌ Failed to get connection:", e);
        process.exit(1);
      }

      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
        console.log(`📊 Admin API: http://localhost:${PORT}/api/admin`);
      });
    } else {
      console.error("❌ Database connection error:", error);
      process.exit(1);
    }
  }
}

startServer();

export default app;
