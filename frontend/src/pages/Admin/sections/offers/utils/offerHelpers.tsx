// frontend/src/pages/Admin/sections/offers/utils/offerHelpers.ts

import React from "react";
import { AdminOffer } from "../../../types/admin.types";
import { DynamicData } from "../types";

export const getDisplayRate = (
  offer: AdminOffer,
  dynamicDataMap?: Record<string, DynamicData>,
) => {
  const offerData = dynamicDataMap?.[offer.id];
  const hasDynamicRates = offerData?.rates && offerData.rates.length > 0;

  if (hasDynamicRates) {
    return (
      <div className="rate-dynamic-container">
        {offerData.rates.map((rule: any, i: number) => {
          let conditionDisplay = "";
          if (rule.conditionMetadata) {
            const meta = rule.conditionMetadata;
            const parts = [];
            if (meta.pvMin !== null || meta.pvMax !== null) {
              parts.push(`ПВ ${meta.pvMin ?? "—"}—${meta.pvMax ?? "∞"}`);
            }
            if (meta.amountMin !== null || meta.amountMax !== null) {
              parts.push(
                `Сумма ${meta.amountMin ?? "—"}—${meta.amountMax ?? "∞"}`,
              );
            }
            if (meta.termMin !== null || meta.termMax !== null) {
              parts.push(`Срок ${meta.termMin ?? "—"}—${meta.termMax ?? "∞"}`);
            }
            conditionDisplay = parts.join(", ");
          } else {
            conditionDisplay =
              rule.description ||
              `${rule.conditionType} ${rule.condition} ${rule.value || ""}`;
          }
          return (
            <div key={i} className="rate-dynamic-item">
              <span className="rate-dynamic-value">{rule.rate}%</span>
              <span className="rate-dynamic-condition">{conditionDisplay}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rate-static-container">
      {offer.shortRate && (
        <span className="rate-short">{offer.shortRate}% →</span>
      )}
      <span className="rate-main">{offer.rate}%</span>
      {offer.twoRate && <span className="rate-two">{offer.twoRate}%</span>}
    </div>
  );
};

export const getDisplaySubsidy = (
  offer: AdminOffer,
  dynamicDataMap?: Record<string, DynamicData>,
) => {
  const offerData = dynamicDataMap?.[offer.id];
  const hasDynamicSubsidy =
    offerData?.subsidies && offerData.subsidies.length > 0;
  const hasDynamicSubsidies =
    offer.dynamicSubsidies && offer.dynamicSubsidies.length > 0;

  // 1. Сначала проверяем dynamicDataMap (если есть)
  if (hasDynamicSubsidy) {
    const subsidies = offerData.subsidies
      .map((rule: any) => rule.subsidyPercent)
      .filter((val: number) => val !== undefined && val !== null)
      .sort((a: number, b: number) => a - b);

    if (subsidies.length === 0) return { display: "—", type: "none" };

    const minSubsidy = subsidies[0];
    const maxSubsidy = subsidies[subsidies.length - 1];

    if (minSubsidy === maxSubsidy) {
      return { display: `${minSubsidy}%`, type: "dynamic" };
    }

    return { display: `${minSubsidy}% — ${maxSubsidy}%`, type: "dynamic" };
  }

  // 2. Затем проверяем offer.dynamicSubsidies (из самого оффера)
  if (hasDynamicSubsidies) {
    const subsidies = offer.dynamicSubsidies
      .map((rule: any) => rule.subsidyPercent)
      .filter((val: number) => val !== undefined && val !== null)
      .sort((a: number, b: number) => a - b);

    if (subsidies.length === 0) return { display: "—", type: "none" };

    const minSubsidy = subsidies[0];
    const maxSubsidy = subsidies[subsidies.length - 1];

    if (minSubsidy === maxSubsidy) {
      return { display: `${minSubsidy}%`, type: "dynamic" };
    }

    return { display: `${minSubsidy}% — ${maxSubsidy}%`, type: "dynamic" };
  }

  // 3. Если есть фиксированная субсидия
  if (offer.subsidyPercent > 0) {
    return { display: `${offer.subsidyPercent}%`, type: "fixed" };
  }

  // 4. Нет субсидии
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
