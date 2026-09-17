// src/components/BankCard/BankCard.tsx
import React from "react";

import "./BankCard.css";
import "./BankExcessWarning.css";

import { BankCardBadges } from "./BankCardBadges/BankCardBadges";
import { BankCardHeader } from "./BankCardHeader/BankCardHeader";
import { DynamicInfoPopup } from "../../../../../components/DynamicInfo/DynamicInfoPopup";
import { useConfig } from "../../../../../hooks/api/useConfig";
import { getBadge } from "../../../../../utils/badge/getBadge";
import { getExcessBadge } from "../../../../../utils/badge/getExcessBadge";
import { getExcessBadgeTwoContract } from "../../../../../utils/badge/getExcessBadgeTwoContract";
import { getLimitBadge } from "../../../../../utils/badge/getLimitBadge";
import { getAvailabilityIssues } from "../../../../../utils/badge/getAvailabilityBadge";
import { getTermYearsBadge } from "../../../../../utils/badge/getTermYearsBadge";
import { getTrancheBadge } from "../../../../../utils/badge/getTrancheBadge";
import { BankProgramResultWithIndex } from "../../../../../utils/types";
import { BankCardDetails } from "./BankCardDetails/BankCardDetails";

interface BankCardProps {
  offer: BankProgramResultWithIndex;
  isSelected: boolean;
  isShortWithSubsidy: boolean;
  isTwoContracts: boolean;
  isTrancheUnavailable: boolean;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  complexName: string;
  loanTermYears: number;
  formatMoney: (amount: number) => string;
  onClick: (index: number) => void;
  loanTermMonths: number;
  dynamicRateData?: {
    display: string;
    details: {
      min: number;
      max: number;
      conditions: Array<{ rate?: number; conditionDisplay: string }>;
    };
  };
  dynamicSubsidyData?: {
    display: string;
    details: {
      min: number;
      max: number;
      conditions: Array<{
        subsidyPercent?: number;
        conditionDisplay: string;
      }>;
    };
  };
}

export const BankCard: React.FC<BankCardProps> = ({
  offer,
  isSelected,
  isShortWithSubsidy,
  isTwoContracts,
  isTrancheUnavailable,
  showOverstatement,
  isSpecialMortgageMode,
  complexName,
  formatMoney,
  onClick,
  loanTermMonths,
  dynamicRateData,
  dynamicSubsidyData,
}) => {
  const { config: configData } = useConfig();
  const badge = getBadge(offer);
  const excessBadge = getExcessBadge(offer);
  const limitBadge = getLimitBadge(offer, configData);
  const termBadge = getTermYearsBadge(offer);
  const trancheBadge = getTrancheBadge(offer, complexName);
  const badgeTwoContract = getExcessBadgeTwoContract(
    offer,
    isSpecialMortgageMode,
  );

  // 🔥 Причины недоступности
  const availabilityIssues = getAvailabilityIssues({
    offer,
    loanTermMonths,
  });
  const isUnavailable = availabilityIssues.length > 0;

  return (
    <div
      className={`bank-card ${isSelected ? "selected" : ""} ${
        isUnavailable ? "unavailable" : ""
      }`}
      onClick={() => {
        if (isUnavailable) return;
        onClick(offer._originalIndex);
      }}
    >
      <BankCardBadges
        badge={badge}
        limitBadge={limitBadge}
        excessBadge={excessBadge}
        termBadge={termBadge}
        trancheBadge={trancheBadge}
        badgeTwoContract={badgeTwoContract}
      />

      {/* 🔥 ШАПКА всегда видна — программа, ставка, платёж */}
      <BankCardHeader
        offer={offer}
        isShortWithSubsidy={isShortWithSubsidy}
        isTwoContracts={isTwoContracts}
        formatMoney={formatMoney}
        isUnavailable={isUnavailable}
      />

      {/* 🔥 Динамические данные — тоже показываем */}
      {(dynamicRateData || dynamicSubsidyData) && (
        <div className="bank-card-dynamic-info">
          {dynamicRateData && (
            <span className="dynamic-badge-wrapper">
              <span className="dynamic-badge-label">📊 Ставка:</span>
              <DynamicInfoPopup
                type="rate"
                display={dynamicRateData.display}
                details={dynamicRateData.details}
                bankName={offer.bank}
                programName={offer.program}
              />
            </span>
          )}

          {dynamicRateData && dynamicSubsidyData && (
            <span className="dynamic-badge-divider">|</span>
          )}

          {dynamicSubsidyData && (
            <span className="dynamic-badge-wrapper">
              <span className="dynamic-badge-label">💰 Субсидия:</span>
              <DynamicInfoPopup
                type="subsidy"
                display={dynamicSubsidyData.display}
                details={dynamicSubsidyData.details}
                bankName={offer.bank}
                programName={offer.program}
              />
            </span>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 🔥 ЕСЛИ НЕДОСТУПНО — вместо деталей показываем причины */}
      {/* ============================================================ */}
      {isUnavailable ? (
        <div className="unavailable-issues-list">
          {availabilityIssues.map((issue, idx) => (
            <div key={idx} className="unavailable-issue">
              {/* Заголовок: иконка + текст в одну строку */}
              <div className="unavailable-issue-header">
                <span className="unavailable-issue-icon">{issue.icon}</span>
                <span className="unavailable-issue-title">{issue.title}</span>
              </div>

              {/* Метрики — label слева, value справа */}
              <div className="unavailable-issue-metrics">
                {issue.metrics.map((m, i) => (
                  <div key={i} className="unavailable-metric-row">
                    <span className="unavailable-metric-label">{m.label}</span>
                    <span
                      className={`unavailable-metric-value ${
                        m.variant === "danger" ? "danger" : ""
                      }`}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Рекомендация */}
              <div className="unavailable-issue-recommendation">
                {issue.recommendation}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <BankCardDetails
            offer={offer}
            showOverstatement={showOverstatement}
            isSpecialMortgageMode={isSpecialMortgageMode}
            isTwoContracts={isTwoContracts}
            formatMoney={formatMoney}
          />

          {offer.excessLimitAmount && offer.excessLimitAmount > 0 && (
            <div className="bank-excess">
              Сверхлимит: {formatMoney(offer.excessLimitAmount)}
            </div>
          )}

          {(offer.type === "family" || offer.type === "it") &&
            offer.isLimitExceeded && (
              <div className="bank-excess-warning-overlay">
                <div className="excess-overlay-icon">🚫</div>
                <div className="excess-overlay-title">
                  Ипотека с выбранными параметрами невозможна
                </div>
              </div>
            )}

          {isTrancheUnavailable && (
            <div className="bank-excess-warning-overlay">
              <div className="excess-overlay-icon">❌</div>
              <div className="excess-overlay-title">
                Траншевая ипотека недоступна
              </div>
              <div className="excess-overlay-hint">
                В данном комплексе траншевая ипотека не поддерживается
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
