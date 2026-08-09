// backend/src/migrations/migrateFromTypescript.ts
import { AppDataSource } from "../data-source";
import { bankOffers } from "../data/banks";
import {
  BANK_NAMES,
  BASE_RATES,
  MIN_PV_PERCENT,
} from "../data/banks/constants";
import { housingPrices } from "../data/complexPrice/complexPriceData";
import { DEPOSIT_AMOUNT } from "../data/complexPrice/CONSTRUCTION";
import { ApartmentType } from "../entities/ApartmentType";
import { Bank } from "../entities/Bank";
import { Complex } from "../entities/Complex";
import { Config } from "../entities/Config";
import { Offer } from "../entities/Offer";
import { Program } from "../entities/Program";

import { generateSlug } from "../utils/slugify";

async function migrate() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Connected to database");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // ============================================================
      // 1. МИГРАЦИЯ БАНКОВ
      // ============================================================
      console.log("🔄 Migrating banks...");
      const bankMap = new Map();

      for (const [key, name] of Object.entries(BANK_NAMES)) {
        const slug = key.toLowerCase();

        const existingBank = await queryRunner.manager.findOne(Bank, {
          where: { slug },
        });

        if (existingBank) {
          console.log(`  ⚠️ Bank already exists: ${name} (${existingBank.id})`);
          bankMap.set(key, existingBank.id);
          continue;
        }

        const bank = new Bank();
        bank.name = name;
        bank.slug = slug;
        bank.baseRate = BASE_RATES[key as keyof typeof BASE_RATES] || 0;
        bank.minPVPercent = MIN_PV_PERCENT;
        bank.isActive = true;
        bank.displayOrder = Object.keys(BANK_NAMES).indexOf(key);
        await queryRunner.manager.save(bank);

        bankMap.set(key, bank.id);
        console.log(`  ✅ Bank: ${name} (${bank.id})`);
      }
      console.log("✅ Banks migrated");

      // ============================================================
      // 2. МИГРАЦИЯ ПРОГРАММ
      // ============================================================
      console.log("🔄 Migrating programs...");
      const programMap = new Map();

      const programs = [
        {
          type: "base",
          label: "Базовая ипотека",
          icon: "🏠",
          color: "#6b7280",
          description: "Стандартная ипотечная программа с базовой ставкой",
        },
        {
          type: "full",
          label: "Субсидии на длинный срок",
          icon: "📈",
          color: "#f59e0b",
          description: "Субсидированная ипотека на длительный срок",
        },
        {
          type: "short",
          label: "Субсидии на короткий срок",
          icon: "⚡",
          color: "#ef4444",
          description: "Субсидированная ипотека на короткий срок",
        },
        {
          type: "family",
          label: "Семейная ипотека",
          icon: "👨‍👩‍👧‍👦",
          color: "#8b5cf6",
          description: "Для семей с детьми. Льготная ставка 6%",
        },
        {
          type: "it",
          label: "ИТ ипотека",
          icon: "💻",
          color: "#3b82f6",
          description: "Для IT-специалистов. Льготная ставка 6%",
        },
        {
          type: "tranche",
          label: "Траншевая ипотека",
          icon: "📊",
          color: "#ec4899",
          description: "Ипотека с траншевой системой финансирования",
        },
      ];

      for (const prog of programs) {
        const existingProgram = await queryRunner.manager.findOne(Program, {
          where: { type: prog.type },
        });

        if (existingProgram) {
          console.log(
            `  ⚠️ Program already exists: ${prog.label} (${existingProgram.id})`,
          );
          programMap.set(prog.type, existingProgram.id);
          continue;
        }

        const program = new Program();
        program.type = prog.type;
        program.label = prog.label;
        program.icon = prog.icon;
        program.color = prog.color;
        program.description = prog.description;
        program.isActive = true;
        await queryRunner.manager.save(program);

        programMap.set(prog.type, program.id);
        console.log(`  ✅ Program: ${prog.label} (${program.id})`);
      }
      console.log("✅ Programs migrated");

      // ============================================================
      // 3. МИГРАЦИЯ ЖК
      // ============================================================
      console.log("🔄 Migrating complexes...");
      const complexMap = new Map();

      for (const item of housingPrices) {
        const slug = generateSlug(item.complexName);

        const existingComplex = await queryRunner.manager.findOne(Complex, {
          where: { slug },
        });

        if (existingComplex) {
          console.log(
            `  ⚠️ Complex already exists: ${item.complexName} (${existingComplex.id})`,
          );
          complexMap.set(item.id, existingComplex.id);
          continue;
        }

        const complex = new Complex();
        complex.name = item.complexName;
        complex.slug = slug;
        complex.status = item.status || "строится";
        complex.description = item.description || "";
        complex.banks = item.banks || [];
        complex.paymentTerms = item.paymentTerms || [];
        complex.promotions = item.promotions || [];
        complex.specialOffers = item.specialOffers || [];
        complex.materialsLink = item.materialsLink || "";
        complex.isActive = true;
        await queryRunner.manager.save(complex);

        complexMap.set(item.id, complex.id);
        console.log(`  ✅ Complex: ${item.complexName} (${complex.id})`);
      }
      console.log("✅ Complexes migrated");

      // ============================================================
      // 4. МИГРАЦИЯ ТИПОВ КВАРТИР
      // ============================================================
      console.log("🔄 Migrating apartment types...");
      let apartmentTypesCreated = 0;
      let apartmentTypesSkipped = 0;

      for (const item of housingPrices) {
        const complexId = complexMap.get(item.id);
        if (!complexId) {
          console.warn(`  ⚠️ Complex not found for: ${item.complexName}`);
          continue;
        }

        // Проверяем, существует ли уже такой тип
        const existingType = await queryRunner.manager.findOne(ApartmentType, {
          where: {
            complexId: complexId,
            type: item.apartmentType,
          },
        });

        if (existingType) {
          console.log(
            `  ⚠️ Apartment type already exists: ${item.complexName} - ${item.apartmentType}`,
          );
          apartmentTypesSkipped++;
          continue;
        }

        const apartmentType = new ApartmentType();
        apartmentType.complexId = complexId;
        apartmentType.type = item.apartmentType;
        apartmentType.pricePerSquareMeter = item.pricePerSquareMeter;
        apartmentType.surcharges = item.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        };
        apartmentType.isActive = true;
        await queryRunner.manager.save(apartmentType);

        apartmentTypesCreated++;
        console.log(
          `  ✅ Apartment type: ${item.complexName} - ${item.apartmentType} (${item.pricePerSquareMeter} ₽/м²)`,
        );
      }
      console.log(
        `✅ Apartment types migrated: ${apartmentTypesCreated} created, ${apartmentTypesSkipped} skipped`,
      );

      // ============================================================
      // 5. МИГРАЦИЯ ОФФЕРОВ
      // ============================================================
      console.log("🔄 Migrating offers...");
      let offersCreated = 0;
      let offersSkipped = 0;

      for (const offer of bankOffers) {
        const bankKey = Object.keys(BANK_NAMES).find(
          (key) => BANK_NAMES[key as keyof typeof BANK_NAMES] === offer.bank,
        );
        const bankId = bankKey ? bankMap.get(bankKey) : null;

        if (!bankId) {
          console.warn(`  ⚠️ Bank not found: ${offer.bank}`);
          continue;
        }

        const programId = programMap.get(offer.type);
        if (!programId) {
          console.warn(`  ⚠️ Program not found: ${offer.type}`);
          continue;
        }

        const existingOffer = await queryRunner.manager.findOne(Offer, {
          where: {
            bankId: bankId,
            programId: programId,
            program: offer.program,
            rate: offer.rate,
          },
        });

        if (existingOffer) {
          console.log(
            `  ⚠️ Offer already exists: ${offer.bank} - ${offer.program}`,
          );
          offersSkipped++;
          continue;
        }

        const newOffer = new Offer();
        newOffer.bankId = bankId;
        newOffer.programId = programId;
        newOffer.program = offer.program;
        newOffer.rate = offer.rate;
        newOffer.twoRate = offer.twoRate ?? null;
        newOffer.shortRate = offer.shortRate ?? null;
        newOffer.subsidyPercent = offer.subsidyPercent ?? 0;
        newOffer.minPVPercent = offer.minPVPercent;
        newOffer.durationMonths = offer.durationMonths ?? null;
        newOffer.isTwoContracts = offer.isTwoContracts ?? false;
        newOffer.excessLimit = offer.excessLimit ?? false;
        newOffer.isTranche = offer.isTranche ?? false;
        newOffer.trancheFirstPercent = offer.trancheFirstPercent ?? null;
        newOffer.trancheSecondDate = offer.trancheSecondDate ?? null;
        newOffer.complexes = offer.complexes ?? [];
        newOffer.isActive = true;

        await queryRunner.manager.save(newOffer);
        offersCreated++;
        console.log(`  ✅ Created offer: ${offer.bank} - ${offer.program}`);
      }
      console.log(
        `✅ Offers migrated: ${offersCreated} created, ${offersSkipped} skipped`,
      );

      // ============================================================
      // 6. МИГРАЦИЯ КОНФИГУРАЦИИ
      // ============================================================
      console.log("🔄 Migrating config...");

      const existingConfig = await queryRunner.manager.findOne(Config, {
        where: { key: "app_config" },
      });

      if (existingConfig) {
        console.log(`  ⚠️ Config already exists, updating...`);
        existingConfig.value = {
          depositAmount: DEPOSIT_AMOUNT,
          minDownPayment: MIN_PV_PERCENT,
          maxLoanTerm: 30,
          defaultComplex: housingPrices[0]?.complexName || "ЖК Сады у моря 3",
          bankOrder: Object.values(BANK_NAMES),
        };
        await queryRunner.manager.save(existingConfig);
        console.log("  ✅ Config updated");
      } else {
        const config = new Config();
        config.key = "app_config";
        config.value = {
          depositAmount: DEPOSIT_AMOUNT,
          minDownPayment: MIN_PV_PERCENT,
          maxLoanTerm: 30,
          defaultComplex: housingPrices[0]?.complexName || "ЖК Сады у моря 3",
          bankOrder: Object.values(BANK_NAMES),
        };
        await queryRunner.manager.save(config);
        console.log("  ✅ Config created");
      }
      console.log("✅ Config migrated");

      await queryRunner.commitTransaction();
      console.log("🎉 All data migrated successfully!");

      // Показываем статистику
      console.log("\n📊 Migration summary:");
      console.log(`  ✅ Banks: ${bankMap.size}`);
      console.log(`  ✅ Programs: ${programMap.size}`);
      console.log(`  ✅ Complexes: ${complexMap.size}`);
      console.log(
        `  ✅ Apartment types: ${apartmentTypesCreated} created, ${apartmentTypesSkipped} skipped`,
      );
      console.log(
        `  ✅ Offers: ${offersCreated} created, ${offersSkipped} skipped`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Migration failed:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

migrate();
