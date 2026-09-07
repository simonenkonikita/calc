import React, { useState, useMemo } from "react";
import "./ProjectsPage.css";
import { useProjects } from "../../hooks/api/useProjects";
import { useAuthExtended } from "../../hooks/ui/useAuth";
import { ProjectsList } from "../../components/ProjectsList/ProjectsList";
import { ProjectDetails } from "../../components/ProjectDetails/ProjectDetails";

export const ProjectsPage: React.FC = () => {
  const { projects, loading, error } = useProjects();
  const { user, isAdmin } = useAuthExtended();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  // 🔥 Фильтруем проекты в зависимости от роли пользователя
  const filteredProjects = useMemo(() => {
    // Если пользователь - администратор, показываем все проекты
    if (isAdmin) {
      return projects;
    }

    // Если пользователь - представитель компании (developer_admin или другая роль)
    // показываем только проекты его компании
    if (user?.companyId) {
      return projects.filter((project) => project.companyId === user.companyId);
    }

    // Если у пользователя нет companyId, возвращаем пустой массив
    return [];
  }, [projects, user, isAdmin]);

  // 🔥 Автоматически выбираем первый проект из отфильтрованного списка
  React.useEffect(() => {
    if (filteredProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(filteredProjects[0].id);
    }
    // Если выбранный проект не входит в отфильтрованный список, сбрасываем выбор
    if (
      selectedProjectId &&
      !filteredProjects.some((p) => p.id === selectedProjectId)
    ) {
      setSelectedProjectId(
        filteredProjects.length > 0 ? filteredProjects[0].id : null,
      );
    }
  }, [filteredProjects, selectedProjectId]);

  const selectedProject =
    filteredProjects.find((p) => p.id === selectedProjectId) || null;

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

  if (filteredProjects.length === 0) {
    return (
      <div className="projects-page empty">
        <EmptyState isAdmin={isAdmin} hasCompanyId={!!user?.companyId} />
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-layout">
        <ProjectsList
          projects={filteredProjects}
          selectedId={selectedProjectId}
          onSelect={setSelectedProjectId}
        />
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

const EmptyState = ({
  isAdmin,
  hasCompanyId,
}: {
  isAdmin: boolean;
  hasCompanyId: boolean;
}) => (
  <div className="empty-state">
    <div className="empty-icon">🏗️</div>
    <p>
      {isAdmin
        ? "Нет доступных проектов"
        : hasCompanyId
          ? "У вашей компании пока нет проектов"
          : "Вам не назначена компания. Обратитесь к администратору."}
    </p>
    {!isAdmin && !hasCompanyId && (
      <span className="empty-hint">
        Для доступа к проектам необходимо быть привязанным к компании
      </span>
    )}
  </div>
);
