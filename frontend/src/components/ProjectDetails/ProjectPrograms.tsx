// src/pages/ProjectsPage/components/ProjectDetails/ProjectPrograms.tsx

import React, { useState, useMemo } from "react";
import "./ProjectPrograms.css";
import { BankOffer, ProgramInfo, ProjectInfo } from "../../utils/types";
import { ProgramCard } from "../ProgramCard/ProgramCard";
import { OfferRow } from "../OfferRow/OfferRow";

interface ProjectProgramsProps {
  project: ProjectInfo;
  programs: any[]; // 🔥 Получаем программы из пропсов
  loading?: boolean;
  error?: string | null;
}

export const ProjectPrograms: React.FC<ProjectProgramsProps> = ({
  project,
  programs = [],
  loading = false,
  error = null,
}) => {
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  // 🔥 Группируем предложения по типам программ
  const groupedByProgram = useMemo(() => {
    if (!programs || programs.length === 0) return {};

    const grouped: Record<string, ProgramInfo> = {};

    programs.forEach((program) => {
      if (program.offers && program.offers.length > 0) {
        grouped[program.type] = program;
      }
    });

    return grouped;
  }, [programs]);

  // 🔥 Сортируем программы в нужном порядке
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

  // 🔥 Если загрузка
  if (loading) {
    return (
      <div className="details-section mortgage-modern-section">
        <div className="section-label">🏦 Ипотечные программы</div>
        <div className="programs-loading">
          <div className="programs-loader"></div>
          <span>Загрузка программ...</span>
        </div>
      </div>
    );
  }

  // 🔥 Если ошибка
  if (error) {
    return (
      <div className="details-section mortgage-modern-section">
        <div className="section-label">🏦 Ипотечные программы</div>
        <div className="programs-error">
          <span>⚠️ {error}</span>
          <button
            className="programs-retry-btn"
            onClick={() => {
              // Повторная загрузка через перезагрузку компонента
              window.location.reload();
            }}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Если нет программ
  if (sortedProgramTypes.length === 0) {
    return null;
  }

  // 🔥 Рендерим программы
  return (
    <div className="details-section mortgage-modern-section">
      <div className="section-label">
        🏦 Ипотечные программы
        <span className="programs-count">{sortedProgramTypes.length}</span>
      </div>

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
              {isExpanded && program.offers && program.offers.length > 0 && (
                <div className="offers-list">
                  {program.offers.map((offer: BankOffer, idx: number) => (
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
