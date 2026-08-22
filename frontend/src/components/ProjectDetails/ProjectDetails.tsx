// src/pages/ProjectsPage/components/ProjectDetails/ProjectDetails.tsx
import React from "react";
import "./ProjectDetails.css";

import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfoSection } from "./ProjectInfo";
import { ProjectPrograms } from "./ProjectPrograms";
import { ProjectInfo } from "../../utils/types";

interface ProjectDetailsProps {
  project: ProjectInfo | null;
  onSelectProject: (id: string) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  if (!project) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏗️</div>
        <p>Выберите проект для просмотра информации</p>
        <span className="empty-hint">Кликните на ЖК в списке слева</span>
      </div>
    );
  }

  return (
    <div className="project-details-card">
      <ProjectHeader project={project} />
      <div className="details-content">
        <ProjectInfoSection project={project} />
        <ProjectPrograms project={project} />
      </div>
    </div>
  );
};
