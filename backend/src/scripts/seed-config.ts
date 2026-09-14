// backend/src/scripts/seed-config.ts

import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../data-source";
import { SystemConfig } from "../entities/SystemConfig";

async function seedConfig() {
  try {
    console.log("🔄 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const repo = AppDataSource.getRepository(SystemConfig);

    // Проверяем, есть ли уже конфиг
    const existing = await repo.find();
    if (existing.length > 0) {
      console.log("⚠️ Config already exists:");
      console.log(JSON.stringify(existing[0], null, 2));
      console.log("ℹ️ Skipping creation");
      await AppDataSource.destroy();
      process.exit(0);
    }

    // Создаём дефолтный конфиг
    const config = repo.create({
      // 🔥 Государственные лимиты
      familyMortgageLimit: 6000000,        // 6 млн ₽
      maxFamilyMortgageLimit: 12000000,    // 12 млн ₽
      itMortgageLimit: 9000000,            // 9 млн ₽
      maxItMortgageLimit: 18000000,        // 18 млн ₽

      // 🔥 Границы калькулятора
      minArea: 20,                          // 20 м²
      maxArea: 200,                         // 200 м²
      minDownPaymentPercent: 10,            // 10%
      maxDownPaymentPercent: 90,            // 90%
      minLoanTerm: 1,                       // 1 год
      maxLoanTerm: 30,                      // 30 лет

      // 🔥 Дополнительно
      deposit: 50000,                       // 50 000 ₽
      bankOrder: [],                        // Пустой массив
    });

    const saved = await repo.save(config);
    console.log("✅ Config created:");
    console.log(JSON.stringify(saved, null, 2));

    await AppDataSource.destroy();
    console.log("👋 Done");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
}

seedConfig();