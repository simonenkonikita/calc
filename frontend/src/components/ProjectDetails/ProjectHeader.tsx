// src/pages/ProjectsPage/components/ProjectDetails/ProjectHeader.tsx
import React from "react";
import "./ProjectHeader.css";
import { ProjectInfo } from "../../utils/types";

interface ProjectHeaderProps {
  project: ProjectInfo;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "сдан":
        return "status-sdan";
      case "строится":
        return "status-stroitsya";
      default:
        return "status-proekt";
    }
  };

  const handleOpenLink = (link: string) => {
    if (link) window.open(link, "_blank");
  };

  return (
    <div className="details-header">
      <div className="details-header-bg">
        <div className="details-header-top">
          <div className="details-title">
            <div className="project-icon-large">{project.statusIcon}</div>
            <div>
              <h2>{project.name}</h2>
              {project.description && (
                <p className="project-subtitle">{project.description}</p>
              )}
              <span
                className={`status-badge ${getStatusClass(project.status)}`}
              >
                {project.status}
              </span>
            </div>
          </div>

          <div className="details-header-right">
            {project.materialsLink && (
              <button
                className="project-link-button"
                onClick={() => handleOpenLink(project.materialsLink!)}
              >
                <svg
                  className="link-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Сайт проекта
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
