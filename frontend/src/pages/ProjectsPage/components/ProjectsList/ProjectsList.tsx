// src/pages/ProjectsPage/components/ProjectsList/ProjectsList.tsx
import React from "react";
import "./ProjectsList.css";
import { ProjectInfo } from "../../utils/types";

interface ProjectsListProps {
  projects: ProjectInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  selectedId,
  onSelect,
}) => {
  const getStatusDotClass = (status: string) => {
    switch (status) {
      case "сдан":
        return "dot-sdan";
      case "строится":
        return "dot-stroitsya";
      default:
        return "dot-proekt";
    }
  };

  return (
    <div className="projects-list-wrapper">
      <div className="projects-list-card">
        <div className="projects-list-header">
          <div className="header-left">
            <span className="header-icon">🏗️</span>
            <h2>Жилые комплексы</h2>
          </div>
          <span className="count">{projects.length}</span>
        </div>
        <div className="projects-list-items">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`project-item ${selectedId === project.id ? "active" : ""}`}
              onClick={() => onSelect(project.id)}
            >
              <span className="project-status-badge">
                <span
                  className={`status-dot ${getStatusDotClass(project.status)}`}
                />
              </span>
              <span className="project-name">{project.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
