// hooks/useCopySelectedOffers.ts
import { useState } from "react";
import { formatOfferToText } from "../utils/offers/formatOfferToText";
import { getComplexEmoji } from "../utils/offers/getComplexEmoji";
import { BankProgramResult } from "../utils/types";

interface UseCopySelectedOffersProps {
  selectedCards: Set<number>;
  filteredBankResults: BankProgramResult[];
  complexName: string;
  area: number;
  formatMoney: (amount: number) => string;
  showOverstatement: boolean;
  isSpecialMortgageMode: boolean;
  loanTermYears: number;
}

export const useCopySelectedOffers = ({
  selectedCards,
  filteredBankResults,
  complexName,
  area,
  formatMoney,
  showOverstatement,
  isSpecialMortgageMode,
  loanTermYears,
}: UseCopySelectedOffersProps) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copySelectedOffers = () => {
    if (selectedCards.size === 0) return;

    const selectedResults = filteredBankResults.filter((_, idx) =>
      selectedCards.has(idx),
    );

    const complexEmoji = getComplexEmoji(complexName);
    const header = `${complexEmoji} ${complexName}\nПлощадь: ${area} м²\n`;
    const separator = `\n---\n`;

    const texts = selectedResults.map((offer) => {
      return formatOfferToText(
        offer,
        formatMoney,
        showOverstatement,
        isSpecialMortgageMode,
        loanTermYears,
      );
    });

    const fullText = `${header}${texts.join(separator)}`;

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = fullText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      });
  };

  return { copySelectedOffers, copySuccess };
};
