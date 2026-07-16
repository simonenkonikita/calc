import React, { useMemo, useState } from "react";
import type {
  BankProgramResultWithIndex,
  OfferBankSectionProps,
} from "../../utils/types";
import "./OfferBankSection.css";

import { getProgramCategory } from "../../utils/category/getProgramCategory";

import { BankFilters } from "./BankFilters/BankFilters";

import { BANK_ORDER } from "../../utils/constants";

import { NoResults } from "./NoResults/NoResults";
import { BankGroup } from "./BankCard/BankGroup/BankGroup";
import { FloatingSelectionBar } from "./FloatingSelectionBar/FloatingSelectionBar";

export const OfferBankSection: React.FC<OfferBankSectionProps> = ({
  bankResults,
  onSelectOffer,
  formatMoney,
  mortgageWithoutDownPayment = false,
  mortgagePartialDownPayment = false,
  loanTermYears,
  area,
  complexName,
}) => {
  const [showOverstatement, setShowOverstatement] = useState(false);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>("all");
  const [selectedProgramTypeFilter, setSelectedProgramTypeFilter] =
    useState<string>("all");
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

  const isSpecialMortgageMode = useMemo(() => {
    return mortgageWithoutDownPayment || mortgagePartialDownPayment;
  }, [mortgageWithoutDownPayment, mortgagePartialDownPayment]);

  const uniqueBanks = useMemo(() => {
    return Array.from(new Set(bankResults.map((offer) => offer.bank)));
  }, [bankResults]);

  const uniqueProgramTypes = useMemo(() => {
    const types = new Set(bankResults.map((offer) => offer.type));
    return Array.from(types);
  }, [bankResults]);

  const isFiltersActive = useMemo(() => {
    return selectedBankFilter !== "all" || selectedProgramTypeFilter !== "all";
  }, [selectedBankFilter, selectedProgramTypeFilter]);

  const filteredBankResults = useMemo(() => {
    let filtered = bankResults;

    if (selectedBankFilter !== "all") {
      filtered = filtered.filter((offer) => offer.bank === selectedBankFilter);
    }

    if (selectedProgramTypeFilter !== "all") {
      filtered = filtered.filter(
        (offer) => offer.type === selectedProgramTypeFilter,
      );
    }

    return filtered;
  }, [bankResults, selectedBankFilter, selectedProgramTypeFilter]);

  // ✅ Создаем массив с индексами для передачи в BankGroup
  const filteredResultsWithIndex = useMemo(() => {
    return filteredBankResults.map((offer, index) => ({
      ...offer,
      _originalIndex: index,
    }));
  }, [filteredBankResults]);

  const groupedData = useMemo(() => {
    const banks: Record<
      string,
      Record<string, BankProgramResultWithIndex[]>
    > = {};

    filteredBankResults.forEach((offer, originalIndex) => {
      const offerWithIndex: BankProgramResultWithIndex = {
        ...offer,
        _originalIndex: originalIndex,
      };

      const bankName = offerWithIndex.bank;
      const category = getProgramCategory(offerWithIndex);

      if (!banks[bankName]) {
        banks[bankName] = {};
      }
      if (!banks[bankName][category]) {
        banks[bankName][category] = [];
      }
      banks[bankName][category].push(offerWithIndex);
    });

    return banks;
  }, [filteredBankResults]);

  const sortedBanks = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => {
      const indexA = BANK_ORDER.indexOf(a);
      const indexB = BANK_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedData]);

  const hasProgramsInCategory = (
    bankData: Record<string, BankProgramResultWithIndex[]>,
    categoryKey: string,
  ) => {
    return bankData[categoryKey] && bankData[categoryKey].length > 0;
  };

  const resetFilters = () => {
    setSelectedBankFilter("all");
    setSelectedProgramTypeFilter("all");
  };

  const getProgramTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      full: "Весь срок",
      short: "Короткий срок",
      family: "Семейная",
      it: "ИТ",
      tranche: "Траншевая",
    };
    return labels[type] || type;
  };

  const toggleCardSelection = (index: number) => {
    setSelectedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCardClick = (index: number) => {
    toggleCardSelection(index);
    onSelectOffer(index);
  };

  const selectAllCards = () => {
    const allIndices = filteredBankResults.map((_, idx) => idx);
    setSelectedCards(new Set(allIndices));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  return (
    <div className="results-section">
      <div className="banks-header-wrapper">
        <h3 className="banks-header">
          Предложения банков ({filteredBankResults.length})
        </h3>

        <BankFilters
          selectedBankFilter={selectedBankFilter}
          selectedProgramTypeFilter={selectedProgramTypeFilter}
          uniqueBanks={uniqueBanks}
          uniqueProgramTypes={uniqueProgramTypes}
          isFiltersActive={isFiltersActive}
          showOverstatement={showOverstatement}
          onBankFilterChange={setSelectedBankFilter}
          onProgramTypeFilterChange={setSelectedProgramTypeFilter}
          onResetFilters={resetFilters}
          onToggleOverstatement={setShowOverstatement}
          getProgramTypeLabel={getProgramTypeLabel}
        />
      </div>

      {sortedBanks.length === 0 ? (
        <NoResults onReset={resetFilters} />
      ) : (
        sortedBanks.map((bankName) => (
          <BankGroup
            key={bankName}
            bankName={bankName}
            bankData={groupedData[bankName]}
            filteredBankResults={filteredResultsWithIndex}
            selectedCards={selectedCards}
            showOverstatement={showOverstatement}
            isSpecialMortgageMode={isSpecialMortgageMode}
            complexName={complexName}
            formatMoney={formatMoney}
            onCardClick={handleCardClick}
            hasProgramsInCategory={hasProgramsInCategory}
          />
        ))
      )}

      {selectedCards.size > 0 && (
        <FloatingSelectionBar
          selectedCards={selectedCards}
          filteredBankResults={filteredBankResults}
          complexName={complexName}
          area={area}
          formatMoney={formatMoney}
          showOverstatement={showOverstatement}
          isSpecialMortgageMode={isSpecialMortgageMode}
          loanTermYears={loanTermYears}
          onSelectAll={selectAllCards}
          onDeselectAll={deselectAllCards}
        />
      )}
    </div>
  );
};
