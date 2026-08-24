// frontend/src/pages/Admin/sections/offers/utils/offerHelpers.ts

import React from "react";
import { AdminOffer } from "../../../types/admin.types";
import { DynamicData } from "../types";

// 🔥 Новый тип для результата отображения ставок
export interface DisplayRateResult {
  display: React.ReactNode;
  type: "static" | "dynamic";
  details?: {
    min: number;
    max: number;
    conditions: Array<{
      rate: number;
      conditionDisplay: string;
    }>;
  };
}

// 🔥 Новый тип для результата отображения субсидий
export interface DisplaySubsidyResult {
  display: string;
  type: "fixed" | "dynamic" | "none";
  details?: {
    min: number;
    max: number;
    conditions: Array<{
      subsidyPercent: number;
      conditionDisplay: string;
    }>;
  };
}

export const getDisplayRate = (
  offer: AdminOffer,
  dynamicDataMap?: Record<string, DynamicData> | DynamicData,
): DisplayRateResult => {
  // 🔥 Проверяем, передан ли dynamicDataMap
  let rates = null;

  if (dynamicDataMap) {
    // Если это прямой объект DynamicData (как в OfferCard)
    if ("rates" in dynamicDataMap) {
      rates = (dynamicDataMap as DynamicData).rates;
    } else {
      // Если это Record<string, DynamicData>
      const offerData = (dynamicDataMap as Record<string, DynamicData>)[
        offer.id
      ];
      rates = offerData?.rates;
    }
  }

  // Если нет в map, проверяем в самом оффере
  if (!rates && offer.dynamicRates && offer.dynamicRates.length > 0) {
    rates = offer.dynamicRates;
  }

  const hasDynamicRates = rates && rates.length > 0;

  if (hasDynamicRates) {
    // Собираем все ставки с условиями
    const conditions = rates.map((rule: any) => {
      let conditionDisplay = "";
      if (rule.conditionMetadata) {
        const meta = rule.conditionMetadata;
        const parts = [];
        if (meta.pvMin !== null && meta.pvMin !== undefined) {
          parts.push(`ПВ от ${meta.pvMin}%`);
        }
        if (meta.pvMax !== null && meta.pvMax !== undefined) {
          parts.push(`ПВ до ${meta.pvMax}%`);
        }
        if (meta.amountMin !== null && meta.amountMin !== undefined) {
          parts.push(`Сумма от ${meta.amountMin}`);
        }
        if (meta.amountMax !== null && meta.amountMax !== undefined) {
          parts.push(`Сумма до ${meta.amountMax}`);
        }
        if (meta.termMin !== null && meta.termMin !== undefined) {
          parts.push(`Срок от ${meta.termMin}`);
        }
        if (meta.termMax !== null && meta.termMax !== undefined) {
          parts.push(`Срок до ${meta.termMax}`);
        }
        conditionDisplay = parts.join(", ");
      } else {
        conditionDisplay = rule.description || "";
      }
      return {
        rate: rule.rate,
        conditionDisplay: conditionDisplay || "Без условий",
      };
    });

    const rateValues = conditions.map((c) => c.rate).sort((a, b) => a - b);
    const minRate = rateValues[0];
    const maxRate = rateValues[rateValues.length - 1];

    return {
      display:
        minRate === maxRate ? `${minRate}%` : `${minRate}% — ${maxRate}%`,
      type: "dynamic",
      details: {
        min: minRate,
        max: maxRate,
        conditions,
      },
    };
  }

  // Статическая ставка
  return {
    display: (
      <div className="rate-static-container">
        {offer.shortRate && (
          <span className="rate-short">{offer.shortRate}% →</span>
        )}
        <span className="rate-main">{offer.rate}%</span>
        {offer.twoRate && <span className="rate-two">{offer.twoRate}%</span>}
      </div>
    ),
    type: "static",
  };
};

export const getDisplaySubsidy = (
  offer: AdminOffer,
  dynamicDataMap?: Record<string, DynamicData> | DynamicData,
): DisplaySubsidyResult => {
  console.log(`🔍 getDisplaySubsidy for offer ${offer.id}:`, offer);

  // 🔥 Проверяем, передан ли dynamicDataMap
  let subsidies = null;

  if (dynamicDataMap) {
    // Если это прямой объект DynamicData (как в OfferCard)
    if ("subsidies" in dynamicDataMap) {
      subsidies = (dynamicDataMap as DynamicData).subsidies;
      console.log(`📊 Got subsidies from direct DynamicData:`, subsidies);
    } else {
      // Если это Record<string, DynamicData>
      const offerData = (dynamicDataMap as Record<string, DynamicData>)[
        offer.id
      ];
      subsidies = offerData?.subsidies;
      console.log(`📊 Got subsidies from Record:`, subsidies);
    }
  }

  // Если нет в map, проверяем в самом оффере
  if (
    !subsidies &&
    offer.dynamicSubsidies &&
    offer.dynamicSubsidies.length > 0
  ) {
    subsidies = offer.dynamicSubsidies;
    console.log(`📊 Got subsidies from offer.dynamicSubsidies:`, subsidies);
  }

  // 1. Проверяем динамические субсидии
  if (subsidies && subsidies.length > 0) {
    console.log(`📊 Found ${subsidies.length} subsidies`);

    // Собираем все субсидии с условиями
    const conditions = subsidies
      .map((rule: any) => {
        const val = parseFloat(rule.subsidyPercent);
        if (isNaN(val) || val <= 0) return null;

        let conditionDisplay = "";
        if (rule.conditionMetadata) {
          const meta = rule.conditionMetadata;
          const parts = [];
          if (meta.pvMin !== null && meta.pvMin !== undefined) {
            parts.push(`ПВ от ${meta.pvMin}%`);
          }
          if (meta.pvMax !== null && meta.pvMax !== undefined) {
            parts.push(`ПВ до ${meta.pvMax}%`);
          }
          if (meta.amountMin !== null && meta.amountMin !== undefined) {
            parts.push(`Сумма от ${meta.amountMin}`);
          }
          if (meta.amountMax !== null && meta.amountMax !== undefined) {
            parts.push(`Сумма до ${meta.amountMax}`);
          }
          if (meta.termMin !== null && meta.termMin !== undefined) {
            parts.push(`Срок от ${meta.termMin}`);
          }
          if (meta.termMax !== null && meta.termMax !== undefined) {
            parts.push(`Срок до ${meta.termMax}`);
          }
          conditionDisplay = parts.join(", ");
        } else {
          conditionDisplay = rule.description || "";
        }

        return {
          subsidyPercent: val,
          conditionDisplay: conditionDisplay || "Без условий",
        };
      })
      .filter((item: any) => item !== null);

    if (conditions.length === 0) {
      return { display: "—", type: "none" };
    }

    const subsidyValues = conditions
      .map((c) => c.subsidyPercent)
      .sort((a, b) => a - b);
    const minSubsidy = subsidyValues[0];
    const maxSubsidy = subsidyValues[subsidyValues.length - 1];

    const display =
      minSubsidy === maxSubsidy
        ? `${minSubsidy}%`
        : `${minSubsidy}% — ${maxSubsidy}%`;

    return {
      display,
      type: "dynamic",
      details: {
        min: minSubsidy,
        max: maxSubsidy,
        conditions,
      },
    };
  }

  // 2. Фиксированная субсидия
  if (offer.subsidyPercent && offer.subsidyPercent > 0) {
    return { display: `${offer.subsidyPercent}%`, type: "fixed" };
  }

  // 3. Нет субсидии
  return { display: "—", type: "none" };
};

export const renderComplexesList = (
  complexesList: string[] | null | undefined,
) => {
  if (!complexesList || complexesList.length === 0) {
    return <span className="complex-tag">Все ЖК</span>;
  }
  return complexesList.map((complex, index) => (
    <span key={index} className="complex-tag">
      {complex}
    </span>
  ));
};
