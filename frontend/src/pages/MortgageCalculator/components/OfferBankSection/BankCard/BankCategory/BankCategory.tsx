// src/components/BankCategory/BankCategory.tsx

import React from "react";
import "./BankCategory.css";
import { BankCard } from "../BankCard";
import { BankProgramResultWithIndex } from "../../../../utils/types";

interface BankCategoryProps {
  categoryLabel: string;
  categoryColor?: string;
  programs: BankProgramResultWithIndex[];
  selectedCards: Set<number>;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  complexName: string;
  loanTermYears: number;
  formatMoney: (amount: number) => string;
  onCardClick: (index: number) => void;
  getDynamicDataForOffer?: (offer: BankProgramResultWithIndex) => {
    dynamicRateData?: any;
    dynamicSubsidyData?: any;
  } | null;
}

export const BankCategory: React.FC<BankCategoryProps> = ({
  categoryLabel,
  categoryColor = "#6b7280",
  programs,
  selectedCards,
  showOverstatement,
  isSpecialMortgageMode,
  complexName,
  loanTermYears,
  formatMoney,
  onCardClick,
  getDynamicDataForOffer,
}) => {
  return (
    <div className="category-group">
      <div className="category-header">
        <h3 className="category-title">{categoryLabel}</h3>
      </div>

      <div className="banks-list">
        {programs.map((offer) => {
          const isSelected = selectedCards.has(offer._originalIndex);
          const isShortWithSubsidy =
            offer.type === "short" &&
            offer.monthlyPaymentAfter !== undefined &&
            offer.monthlyPaymentAfter !== null;

          const isTwoContracts = offer.isTwoContracts === true;

          // ✅ Проверяем траншевую ипотеку через данные из офера
          const isTrancheUnavailable = !!(
            offer.type === "tranche" &&
            (!offer.trancheSecondDate ||
              (offer.complexes && !offer.complexes.includes(complexName)))
          );

          const dynamicData = getDynamicDataForOffer?.(offer);

          return (
            <BankCard
              key={offer._originalIndex}
              offer={offer}
              isSelected={isSelected}
              isShortWithSubsidy={isShortWithSubsidy}
              isTwoContracts={isTwoContracts}
              isTrancheUnavailable={isTrancheUnavailable}
              showOverstatement={showOverstatement}
              isSpecialMortgageMode={isSpecialMortgageMode}
              complexName={complexName}
              loanTermYears={loanTermYears}
              formatMoney={formatMoney}
              onClick={onCardClick}
              dynamicRateData={dynamicData?.dynamicRateData}
              dynamicSubsidyData={dynamicData?.dynamicSubsidyData}
            />
          );
        })}
      </div>
    </div>
  );
};
