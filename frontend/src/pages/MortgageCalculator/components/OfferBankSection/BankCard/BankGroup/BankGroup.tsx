// src/components/BankGroup/BankGroup.tsx

import React from "react";
import { BankCategory } from "../BankCategory/BankCategory";
import "./BankGroup.css";

import {
  BankProgramResultWithIndex,
  ProgramCategory,
} from "../../../../utils/types";

interface BankGroupProps {
  bankName: string;
  bankData: Record<string, BankProgramResultWithIndex[]>;
  filteredBankResults: BankProgramResultWithIndex[];
  selectedCards: Set<number>;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  complexName: string;
  loanTermYears: number;
  formatMoney: (amount: number) => string;
  onCardClick: (index: number) => void;
  hasProgramsInCategory: (
    bankData: Record<string, BankProgramResultWithIndex[]>,
    categoryKey: string,
  ) => boolean;
  getDynamicDataForOffer?: (offer: BankProgramResultWithIndex) => {
    dynamicRateData?: any;
    dynamicSubsidyData?: any;
  } | null;
  // ✅ Добавляем пропс для категорий из API
  categories: ProgramCategory[];
}

export const BankGroup: React.FC<BankGroupProps> = ({
  bankName,
  bankData,
  filteredBankResults,
  selectedCards,
  showOverstatement,
  isSpecialMortgageMode,
  complexName,
  loanTermYears,
  formatMoney,
  onCardClick,
  hasProgramsInCategory,
  getDynamicDataForOffer,
  categories, // ✅ Получаем из пропсов
}) => {
  const hasAnyPrograms = Object.values(bankData).some((arr) => arr.length > 0);

  if (!hasAnyPrograms) return null;

  // ✅ Сортируем категории по displayOrder
  const sortedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div className="bank-group">
      <div className="bank-group-header">
        <h2 className="bank-group-title">🏦 {bankName}</h2>
        <span className="bank-group-count">
          {filteredBankResults.filter((o) => o.bank === bankName).length}
        </span>
      </div>

      <div className="bank-categories">
        {sortedCategories.map((category) => {
          if (!hasProgramsInCategory(bankData, category.key)) {
            return null;
          }

          const programs = bankData[category.key];

          return (
            <BankCategory
              key={category.key}
              categoryLabel={category.label}
              categoryColor={category.color}
              programs={programs}
              selectedCards={selectedCards}
              showOverstatement={showOverstatement}
              isSpecialMortgageMode={isSpecialMortgageMode}
              complexName={complexName}
              loanTermYears={loanTermYears}
              formatMoney={formatMoney}
              onCardClick={onCardClick}
              getDynamicDataForOffer={getDynamicDataForOffer}
            />
          );
        })}
      </div>
    </div>
  );
};
