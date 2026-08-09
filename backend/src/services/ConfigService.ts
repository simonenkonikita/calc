// backend/src/services/ConfigService.ts
import { AppDataSource } from "../data-source";
import { Config } from "../entities/Config";

export class ConfigService {
  private configRepository = AppDataSource.getRepository(Config);

  async getConfig() {
    const config = await this.configRepository.findOne({
      where: { key: "app_config" },
    });
    return config?.value || {};
  }
}
