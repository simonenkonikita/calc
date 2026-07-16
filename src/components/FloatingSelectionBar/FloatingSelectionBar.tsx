// src/components/FloatingSelectionBar/FloatingSelectionBar.tsx
import React from "react";
import { BankProgramResult } from "../../utils/types";
import { CopyButton } from "./CopyButton/CopyButton";
import { SelectAllButton } from "./SelectAllButton/SelectAllButton";
import { DeselectAllButton } from "./DeselectAllButton/DeselectAllButton";
import { PrintButton } from "./PrintButton/PrintButton";
import { SelectionCounter } from "./SelectionCounter/SelectionCounter";
import { printSelectedOffers } from "../../utils/printSelectedOffers";
import "./FloatingSelectionBar.css";

interface FloatingSelectionBarProps {
  selectedCards: Set<number>;
  filteredBankResults: BankProgramResult[];
  complexName: string;
  area: number;
  formatMoney: (amount: number) => string;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  loanTermYears: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const FloatingSelectionBar: React.FC<FloatingSelectionBarProps> = ({
  selectedCards,
  filteredBankResults,
  complexName,
  area,
  formatMoney,
  showOverstatement,
  isSpecialMortgageMode,
  loanTermYears,
  onSelectAll,
  onDeselectAll,
}) => {
  const handlePrint = () => {
    printSelectedOffers({
      selectedCards,
      filteredBankResults,
      complexName,
      area,
      formatMoney,
      showOverstatement,
      isSpecialMortgageMode,
      loanTermYears,
    });
  };

  return (
    <div className="floating-selection-bar">
      <div className="floating-bar-content">
        <SelectionCounter count={selectedCards.size} />

        <SelectAllButton onClick={onSelectAll} />

        <CopyButton
          selectedCards={selectedCards}
          filteredBankResults={filteredBankResults}
          complexName={complexName}
          area={area}
          formatMoney={formatMoney}
          showOverstatement={showOverstatement}
          isSpecialMortgageMode={isSpecialMortgageMode}
          loanTermYears={loanTermYears}
        />

        <PrintButton
          onClick={handlePrint}
          disabled={selectedCards.size === 0}
        />

        <DeselectAllButton onClick={onDeselectAll} />
      </div>
    </div>
  );
};
