// src/pages/ProjectsPage/components/ProjectDetails/ProjectPrograms.tsx
import React, { useState, useMemo } from "react";
import "./ProjectPrograms.css";
import { ProjectInfo } from "../../utils/types";
import { ProgramCard } from "../ProgramCard/ProgramCard";
import { OfferRow } from "../OfferRow/OfferRow";

interface ProjectProgramsProps {
  project: ProjectInfo;
}

export const ProjectPrograms: React.FC<ProjectProgramsProps> = ({
  project,
}) => {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // Группируем предложения по типам программ
  const groupedByProgram = useMemo(() => {
    if (!project.eligiblePrograms) return {};

    const grouped: Record<string, any> = {};
    project.eligiblePrograms.forEach((program) => {
      if (program.offers && program.offers.length > 0) {
        grouped[program.type] = program;
      }
    });
    return grouped;
  }, [project.eligiblePrograms]);

  // Сортируем программы
  const programOrder = ["base", "tranche", "full", "short", "family", "it"];
  const sortedProgramTypes = useMemo(() => {
    const types = Object.keys(groupedByProgram);
    return types.sort((a, b) => {
      const indexA = programOrder.indexOf(a);
      const indexB = programOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedByProgram]);

  if (sortedProgramTypes.length === 0) return null;

  return (
    <div className="details-section mortgage-modern-section">
      <div className="section-label">🏦 Ипотечные программы</div>

      <div className="programs-modern-grid">
        {sortedProgramTypes.map((programType) => {
          const program = groupedByProgram[programType];
          const isExpanded = expandedProgram === programType;

          return (
            <ProgramCard
              key={programType}
              program={program}
              isExpanded={isExpanded}
              onToggle={() =>
                setExpandedProgram(isExpanded ? null : programType)
              }
            >
              {isExpanded && program.offers.length > 0 && (
                <div className="offers-list">
                  {program.offers.map((offer, idx) => (
                    <OfferRow key={idx} offer={offer} />
                  ))}
                </div>
              )}
            </ProgramCard>
          );
        })}
      </div>
    </div>
  );
};
