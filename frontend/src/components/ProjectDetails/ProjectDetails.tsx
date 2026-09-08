// src/pages/ProjectsPage/components/ProjectDetails/ProjectDetails.tsx

import React, { useState, useEffect } from "react";
import "./ProjectDetails.css";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfoSection } from "./ProjectInfo";
import { ProjectPrograms } from "./ProjectPrograms";
import { ProjectInfo } from "../../utils/types";
import { api } from "../../services/api";

interface ProjectDetailsProps {
  project: ProjectInfo | null;
  onSelectProject: (id: string) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onSelectProject,
}) => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Загружаем программы один раз для всех компонентов
  useEffect(() => {
    if (!project?.id) {
      setPrograms([]);
      return;
    }

    const loadPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProjectPrograms(project.id);

        if (response.success) {
          setPrograms(response.data || []);
        } else {
          setError(response.error || "Failed to load programs");
          setPrograms([]);
        }
      } catch (err) {
        console.error("Error loading programs:", err);
        setError("Ошибка при загрузке программ");
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [project?.id]);

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
        {/* 🔥 Передаем программы в оба компонента */}
        <ProjectInfoSection
          project={project}
          programs={programs}
          loading={loading}
        />
        <ProjectPrograms
          project={project}
          programs={programs}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};
