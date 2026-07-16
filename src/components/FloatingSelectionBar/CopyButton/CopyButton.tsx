// components/CopyButton/CopyButton.tsx
import React from "react";

import "./CopyButton.css";
import { useCopySelectedOffers } from "../../../hooks/useCopySelectedOffers";
import { BankProgramResult } from "../../../utils/types";

interface CopyButtonProps {
  selectedCards: Set<number>;
  filteredBankResults: BankProgramResult[];
  complexName: string;
  area: number;
  formatMoney: (amount: number) => string;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  loanTermYears: number;
  className?: string;
  children?: React.ReactNode;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  selectedCards,
  filteredBankResults,
  complexName,
  area,
  formatMoney,
  showOverstatement,
  isSpecialMortgageMode,
  loanTermYears,
  className = "",
  children,
}) => {
  const { copySelectedOffers, copySuccess } = useCopySelectedOffers({
    selectedCards,
    filteredBankResults,
    complexName,
    area,
    formatMoney,
    showOverstatement,
    isSpecialMortgageMode,
    loanTermYears,
  });

  return (
    <button
      className={`copy-selected-btn ${className}`}
      onClick={copySelectedOffers}
      disabled={selectedCards.size === 0}
    >
      {copySuccess ? "✅ Скопировано!" : children || "📋 Копировать выбранные"}
    </button>
  );
};
