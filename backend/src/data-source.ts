// backend/src/data-source.ts

import "reflect-metadata";
import { DataSource } from "typeorm";
import { Bank } from "./entities/Bank";
import { Complex } from "./entities/Complex";
import { ApartmentType } from "./entities/ApartmentType";
import { Program } from "./entities/Program";
import { Offer } from "./entities/Offer";
import { DynamicRate } from "./entities/DynamicRate";
import { DynamicSubsidy } from "./entities/DynamicSubsidy";
import { SystemConfig } from "./entities/SystemConfig";
import * as path from "path";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "65336435",
  database: process.env.DB_DATABASE || "ipoteka_db",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [
    Bank,
    Complex,
    ApartmentType,
    Program,
    Offer,
    DynamicRate,
    DynamicSubsidy,
    SystemConfig,
    User,
  ],
  migrations: [path.join(__dirname, "..", "migrations", "*.ts")],
  subscribers: [],
});

export default AppDataSource;
