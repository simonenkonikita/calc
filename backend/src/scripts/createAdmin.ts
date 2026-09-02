// backend/src/scripts/createAdmin.ts
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const userRepository = AppDataSource.getRepository(User);

    const existingAdmin = await userRepository.findOne({
      where: { email: "admin@ipoteka.ru" },
    });

    if (existingAdmin) {
      console.log("⚠️ Администратор уже существует");
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Имя: ${existingAdmin.firstName}`);
      console.log(`🔑 Роль: ${existingAdmin.role}`);
      await AppDataSource.destroy();
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = userRepository.create({
      email: "admin@ipoteka.ru",
      password: hashedPassword,
      firstName: "Администратор",
      lastName: "Системы",
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    await userRepository.save(admin);

    console.log("✅ Администратор создан!");
    console.log("─────────────────────────────");
    console.log("📧 Email: admin@ipoteka.ru");
    console.log("🔑 Пароль: admin123");
    console.log("👤 Роль: admin");
    console.log("─────────────────────────────");
    console.log("⚠️ Пожалуйста, смените пароль при первом входе!");

    await AppDataSource.destroy();
  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

createAdmin();
