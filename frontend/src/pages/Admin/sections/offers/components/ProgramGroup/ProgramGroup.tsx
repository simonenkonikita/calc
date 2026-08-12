// frontend/src/pages/Admin/sections/offers/components/ProgramGroup.tsx

import React from "react";
import { ProgramGroupProps } from "../../types";
import { OfferCard } from "../OfferCard";
import "./ProgramGroup.css";

export const ProgramGroup: React.FC<ProgramGroupProps> = ({
  programLabel,
  programType,
  programIsActive,
  bankIsActive,
  offers,
  dynamicDataMap,
  onEdit,
  onCopy,
  onDelete,
  onRestore,
  onHardDelete,
  getDisplayRate,
  getDisplaySubsidy,
  renderComplexesList,
}) => {
  const getProgramTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      base: "🏠",
      full: "📈",
      short: "⚡",
      family: "👨‍👩‍👧‍👦",
      it: "💻",
      tranche: "📊",
    };
    return icons[type] || "📋";
  };

  const typeIcon = getProgramTypeIcon(programType);

  return (
    <div className="program-group">
      <div className="program-group-header">
        <div className="program-group-title">
          <span className="program-icon">{typeIcon}</span>
          <span className="program-label">{programLabel}</span>
        </div>
        <div className="program-offers">
          <span className="program-offers-count">
            {offers.length} {offers.length === 1 ? "оффер" : "офферов"}
          </span>
          {programIsActive ? (
            <span className="status-badge active">✅ Активен</span>
          ) : (
            <span className="status-badge inactive">
              ❌ Программа не активен
            </span>
          )}
        </div>
      </div>
      <div className="program-offers-list">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            programIsActive={programIsActive}
            bankIsActive={bankIsActive}
            dynamicData={dynamicDataMap[offer.id]}
            onEdit={onEdit}
            onCopy={onCopy}
            onDelete={onDelete}
            onRestore={onRestore}
            onHardDelete={onHardDelete}
            getDisplayRate={getDisplayRate}
            getDisplaySubsidy={getDisplaySubsidy}
            renderComplexesList={renderComplexesList}
          />
        ))}
      </div>
    </div>
  );
};
