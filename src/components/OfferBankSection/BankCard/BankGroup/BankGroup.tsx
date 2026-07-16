// src/components/BankGroup/BankGroup.tsx
import React from "react";
import { BankCategory } from "../BankCategory/BankCategory";
import "./BankGroup.css";
import { CATEGORY_ORDER } from "../../../../utils/constants";
import { BankProgramResultWithIndex } from "../../../../utils/types";

interface BankGroupProps {
  bankName: string;
  bankData: Record<string, BankProgramResultWithIndex[]>;
  filteredBankResults: BankProgramResultWithIndex[];
  selectedCards: Set<number>;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  complexName: string;
  formatMoney: (amount: number) => string;
  onCardClick: (index: number) => void;
  hasProgramsInCategory: (
    bankData: Record<string, BankProgramResultWithIndex[]>,
    categoryKey: string,
  ) => boolean;
}

export const BankGroup: React.FC<BankGroupProps> = ({
  bankName,
  bankData,
  filteredBankResults,
  selectedCards,
  showOverstatement,
  isSpecialMortgageMode,
  complexName,
  formatMoney,
  onCardClick,
  hasProgramsInCategory,
}) => {
  const hasAnyPrograms = Object.values(bankData).some((arr) => arr.length > 0);

  if (!hasAnyPrograms) return null;

  return (
    <div className="bank-group">
      <div className="bank-group-header">
        <h2 className="bank-group-title">🏦 {bankName}</h2>
        <span className="bank-group-count">
          {filteredBankResults.filter((o) => o.bank === bankName).length}
        </span>
      </div>

      <div className="bank-categories">
        {CATEGORY_ORDER.map((category) => {
          if (!hasProgramsInCategory(bankData, category.key)) {
            return null;
          }

          const programs = bankData[category.key];

          return (
            <BankCategory
              key={category.key}
              categoryLabel={category.label}
              programs={programs}
              selectedCards={selectedCards}
              showOverstatement={showOverstatement}
              isSpecialMortgageMode={isSpecialMortgageMode}
              complexName={complexName}
              formatMoney={formatMoney}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>
    </div>
  );
};
