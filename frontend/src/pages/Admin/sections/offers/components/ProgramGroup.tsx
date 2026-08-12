// frontend/src/pages/Admin/sections/offers/components/ProgramGroup.tsx

import React from "react";
import { ProgramGroupProps } from "../types";
import { OfferCard } from "./OfferCard";
import "./ProgramGroup.css";

export const ProgramGroup: React.FC<ProgramGroupProps> = ({
  programId,
  programLabel,
  programType,
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
  const getProgramTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      base: "Базовая ипотека",
      full: "Субсидия / Весь срок",
      short: "Субсидия / Короткий срок",
      family: "Семейная ипотека",
      it: "ИТ ипотека",
      tranche: "Траншевая ипотека",
    };
    return labels[type] || type;
  };

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

  const getProgramTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      base: "#6b7280",
      full: "#f59e0b",
      short: "#ef4444",
      family: "#8b5cf6",
      it: "#3b82f6",
      tranche: "#ec4899",
    };
    return colors[type] || "#6b7280";
  };

  const typeIcon = getProgramTypeIcon(programType);
  const typeLabel = getProgramTypeLabel(programType);
  const typeColor = getProgramTypeColor(programType);

  return (
    <div className="program-group">
      <div className="program-group-header">
        <div className="program-group-title">
          <span className="program-icon">{typeIcon}</span>
          <span className="program-label">{programLabel}</span>
          <span className="program-type-badge" style={{ backgroundColor: typeColor }}>
            {typeLabel}
          </span>
        </div>
        <span className="program-offers-count">
          {offers.length} {offers.length === 1 ? "оффер" : "офферов"}
        </span>
      </div>

      <div className="program-offers-list">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
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