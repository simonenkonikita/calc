// server/src/index.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import calculatorRoutes from "./routes/calculator.routes";
import banksRoutes from "./routes/banks.routes";
import limitsRoutes from "./routes/limits.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (базовый минимум для вашего API)
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
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Mortgage Calculator API",
  });
});

// Ваши роуты
app.use("/api/calculator", calculatorRoutes);
app.use("/api/banks", banksRoutes);
app.use("/api/limits", limitsRoutes);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  },
);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
