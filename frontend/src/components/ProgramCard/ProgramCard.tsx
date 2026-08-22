// src/pages/ProjectsPage/components/ProgramCard/ProgramCard.tsx
import React from "react";
import "./ProgramCard.css";

interface ProgramCardProps {
  program: {
    type: string;
    label: string;
    icon: string;
    color: string;
    offers: any[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div
      className={`program-modern-card ${isExpanded ? "expanded" : ""}`}
      style={{ borderColor: isExpanded ? program.color : "#e5e7eb" }}
    >
      <div
        className="program-modern-header"
        onClick={onToggle}
        style={{
          background: isExpanded
            ? `linear-gradient(135deg, ${program.color}15 0%, ${program.color}08 100%)`
            : "#f8fafc",
        }}
      >
        <div className="program-modern-info">
          <span className="program-modern-icon">{program.icon}</span>
          <span className="program-modern-name">{program.label}</span>
          <span
            className="program-modern-badge"
            style={{ background: program.color }}
          >
            {program.offers.length} предложений
          </span>
        </div>
        <div className="program-modern-rate">
          <span className="expand-icon">{isExpanded ? "−" : "+"}</span>
        </div>
      </div>

      {isExpanded && children && (
        <div className="program-modern-content">{children}</div>
      )}
    </div>
  );
};
