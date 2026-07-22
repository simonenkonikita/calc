// src/components/BankCard/BankCard.tsx
import React from "react";

import "./BankCard.css";
import "./BankExcessWarning.css"; // ✅ Импорт стилей для оверлея

import { BankCardBadges } from "./BankCardBadges/BankCardBadges";
import { BankCardDetails } from "./BankCardDetails/BankCardDetails";
import { BankCardHeader } from "./BankCardHeader/BankCardHeader";
import { getBadge } from "../../../utils/badge/getBadge";
import { getExcessBadge } from "../../../utils/badge/getExcessBadge";
import { getTermYearsBadge } from "../../../utils/badge/getTermYearsBadge";
import { getTrancheBadge } from "../../../utils/badge/getTrancheBadge";
import { BankProgramResultWithIndex } from "../../../utils/types";
import { getLimitBadge } from "../../../utils/badge/getLimitBadge";
import { getExcessBadgeTwoContract } from "../../../utils/badge/getExcessBadgeTwoContract";

interface BankCardProps {
  offer: BankProgramResultWithIndex;
  isSelected: boolean;
  isShortWithSubsidy: boolean;
  isTwoContracts: boolean;
  isTrancheUnavailable: boolean;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  complexName: string;
  formatMoney: (amount: number) => string;
  onClick: (index: number) => void;
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
}) => {
  // Получаем все бейджи
  const badge = getBadge(offer);
  const excessBadge = getExcessBadge(offer);
  const limitBadge = getLimitBadge(offer);
  const termBadge = getTermYearsBadge(offer);
  const trancheBadge = getTrancheBadge(offer, complexName);
  const badgeTwoContract = getExcessBadgeTwoContract(
    offer,
    isSpecialMortgageMode,
  );

  return (
    <div
      className={`bank-card ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(offer._originalIndex)}
    >
      <BankCardBadges
        badge={badge}
        limitBadge={limitBadge}
        excessBadge={excessBadge}
        termBadge={termBadge}
        trancheBadge={trancheBadge}
        badgeTwoContract={badgeTwoContract}
      />

      <BankCardHeader
        offer={offer}
        isShortWithSubsidy={isShortWithSubsidy}
        isTwoContracts={isTwoContracts}
        formatMoney={formatMoney}
      />

      <BankCardDetails
        offer={offer}
        showOverstatement={showOverstatement}
        isSpecialMortgageMode={isSpecialMortgageMode}
        isTwoContracts={isTwoContracts}
        formatMoney={formatMoney}
      />

      {offer.excessLimit && offer.excessLimit > 0 && (
        <div className="bank-excess">
          Сверхлимит: {formatMoney(offer.excessLimit)}
        </div>
      )}

      {offer.type === "family" && offer.isLimitExceeded && (
        <div className="bank-excess-warning-overlay">
          <div className="excess-overlay-icon">🚫</div>
          <div className="excess-overlay-title">
            Ипотека с выбранными параметрами невозможна
          </div>
          <div className="excess-overlay-hint">
            Превышен лимит семейной ипотеки
          </div>
        </div>
      )}

      {/*   {offer.type === "family" && offer.isTwoContracts && (
        <div className="bank-excess-warning-overlay">
          <div className="excess-overlay-icon">🚫</div>
          <div className="excess-overlay-title">
            Ипотека с выбранными параметрами невозможна
          </div>
          <div className="excess-overlay-hint">
            Превышен лимит семейной ипотеки
          </div>
        </div>
      )} */}

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
    </div>
  );
};
