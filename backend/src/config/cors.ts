// backend/src/config/cors.ts
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://your-domain.com",
      process.env.CLIENT_URL,
    ].filter(Boolean) as string[];

    // Если origin не передан (например, запрос от curl) - разрешаем
    if (!origin) {
      callback(null, true);
      return;
    }

    // Убираем trailing slash для сравнения
    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};
