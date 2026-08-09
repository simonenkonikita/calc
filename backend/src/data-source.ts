import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "65336435",
  database: process.env.DB_DATABASE || "ipoteka_db",
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],

  subscribers: [],
});
