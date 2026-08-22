import React, { useState } from "react";
import { ProjectDetails } from "../../components/ProjectDetails/ProjectDetails";
import { useProjects } from "../../hooks/api/useProjects";

export const MortgageProgramsPage: React.FC = () => {
  const { projects, loading, error } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  if (loading) {
    return (
      <div className="projects-page loading">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page error">
        <ErrorState error={error} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="projects-page empty">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-layout">
        <ProjectDetails
          project={selectedProject}
          onSelectProject={setSelectedProjectId}
        />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="loading-state">
    <div className="spinner"></div>
    <p>Загрузка проектов...</p>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className="error-state">
    <p>❌ {error}</p>
    <button onClick={() => window.location.reload()}>Повторить</button>
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">🏗️</div>
    <p>Нет доступных проектов</p>
  </div>
);
