// src/hooks/useDynamicOffersData.ts

import { useState, useEffect } from "react";
import { DynamicData } from "../../pages/Admin/sections/offers";
import { AdminOffer } from "../../pages/Admin/types/admin.types";
import adminApi from "../../services/adminApi";

export const useDynamicOffersData = () => {
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [dynamicDataMap, setDynamicDataMap] = useState<
    Record<string, DynamicData>
  >({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // 🔥 Получаем все офферы
      const offersData = await adminApi.getOffers();
      console.log(`📋 Loaded ${offersData.length} offers`);

      setOffers(offersData);

      // 🔥 Загружаем динамические данные для каждого оффера
      const dataMap: Record<string, DynamicData> = {};

      for (const offer of offersData) {
        try {
          const [rates, subsidies] = await Promise.all([
            adminApi.getOfferDynamicRates(offer.id),
            adminApi.getOfferDynamicSubsidies(offer.id),
          ]);

          dataMap[offer.id] = {
            rates: rates || [],
            subsidies: subsidies || [],
          };

          if (rates.length > 0 || subsidies.length > 0) {
            console.log(
              `📊 Offer ${offer.id}: ${rates.length} rates, ${subsidies.length} subsidies`,
            );
          }
        } catch (err) {
          console.error(`Failed to load data for offer ${offer.id}:`, err);
          dataMap[offer.id] = { rates: [], subsidies: [] };
        }
      }

      setDynamicDataMap(dataMap);
    } catch (err) {
      console.error("Error loading dynamic offers data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    offers,
    dynamicDataMap,
    loading,
    refresh: loadData,
  };
};
