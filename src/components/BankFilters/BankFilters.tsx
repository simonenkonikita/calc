// src/components/BankFilters/BankFilters.tsx
import React from "react";
import "./BankFilters.css";

interface BankFiltersProps {
  selectedBankFilter: string;
  selectedProgramTypeFilter: string;
  uniqueBanks: string[];
  uniqueProgramTypes: string[];
  isFiltersActive: boolean;
  showOverstatement: boolean;
  onBankFilterChange: (value: string) => void;
  onProgramTypeFilterChange: (value: string) => void;
  onResetFilters: () => void;
  onToggleOverstatement: (checked: boolean) => void;
  getProgramTypeLabel: (type: string) => string;
}

export const BankFilters: React.FC<BankFiltersProps> = ({
  selectedBankFilter,
  selectedProgramTypeFilter,
  uniqueBanks,
  uniqueProgramTypes,
  isFiltersActive,
  showOverstatement,
  onBankFilterChange,
  onProgramTypeFilterChange,
  onResetFilters,
  onToggleOverstatement,
  getProgramTypeLabel,
}) => {
  return (
    <div className="banks-filters">
      <select
        className="bank-filter-select"
        value={selectedBankFilter}
        onChange={(e) => onBankFilterChange(e.target.value)}
      >
        <option value="all">Все банки ({uniqueBanks.length})</option>
        {uniqueBanks.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
      </select>

      <select
        className="bank-filter-select"
        value={selectedProgramTypeFilter}
        onChange={(e) => onProgramTypeFilterChange(e.target.value)}
      >
        <option value="all">Все типы</option>
        {uniqueProgramTypes.map((type) => (
          <option key={type} value={type}>
            {getProgramTypeLabel(type)}
          </option>
        ))}
      </select>

      <button
        className={`reset-filters-btn ${isFiltersActive ? "active" : "inactive"}`}
        onClick={onResetFilters}
        disabled={!isFiltersActive}
      >
        <span>✕</span> Очистить
      </button>

      <label className="toggle-overstatement">
        <input
          type="checkbox"
          checked={showOverstatement}
          onChange={(e) => onToggleOverstatement(e.target.checked)}
        />
        <span>Показать завышение и субсидию</span>
      </label>
    </div>
  );
};
