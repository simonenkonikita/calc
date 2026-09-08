// frontend/src/pages/ProjectsPage/ProjectsPage.tsx

import React, { useState, useMemo, useEffect } from "react";
import "./ProjectsPage.css";

import { useAuthExtended } from "../../hooks/ui/useAuth";
import { ProjectsList } from "./components/ProjectsList/ProjectsList";
import { ProjectDetails } from "./components/ProjectDetails/ProjectDetails";

import adminApi from "../../services/adminApi";
import { useProjects } from "../../hooks/api/useProjects";
import Tabs, { TabItem } from "../Admin/components/Tabs/Tabs";

export const ProjectsPage: React.FC = () => {
  const { projects, loading, error } = useProjects();
  const { user, isAdmin, isDeveloperAdmin, isDeveloperManager } =
    useAuthExtended();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Загружаем компании для табов (только для админа)
  useEffect(() => {
    if (isAdmin) {
      setLoadingCompanies(true);
      adminApi
        .getCompanies()
        .then((data) => {
          setCompanies(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error loading companies:", err))
        .finally(() => setLoadingCompanies(false));
    }
  }, [isAdmin]);

  // Фильтруем проекты по компании и роли
  const filteredProjects = useMemo(() => {
    let result = projects;

    // 🔥 Фильтр по компании (только для админа)
    if (isAdmin && selectedCompanyId !== "all") {
      result = result.filter((p) => p.companyId === selectedCompanyId);
    }

    // 🔥 Для не-админов - только проекты своей компании
    if (!isAdmin) {
      if (user?.companyId) {
        result = result.filter((p) => p.companyId === user.companyId);
      } else {
        result = [];
      }
    }

    return result;
  }, [projects, user, isAdmin, selectedCompanyId]);

  // Автоматически выбираем первый проект
  useEffect(() => {
    if (filteredProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(filteredProjects[0].id);
    }
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

  // 🔥 Формируем табы для админа
  const tabs: TabItem[] = useMemo(() => {
    if (!isAdmin) return [];

    const tabsList: TabItem[] = [
      {
        id: "all",
        label: "Все компании",
        icon: "🏢",
        count: projects.length,
        isActive: true,
      },
    ];

    companies.forEach((company) => {
      const count = projects.filter((p) => p.companyId === company.id).length;
      tabsList.push({
        id: company.id,
        label: company.name,
        icon: "🏗️",
        count: count,
        isActive: company.isActive !== false,
      });
    });

    return tabsList;
  }, [isAdmin, companies, projects]);

  // Состояния загрузки, ошибки и пустого списка
  if (loading) {
    return (
      <div className="projects-page">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <ErrorState error={error} />
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="projects-page">
        <div className="projects-empty-wrapper">
          {isAdmin && tabs.length > 0 && (
            <Tabs
              tabs={tabs}
              selectedId={selectedCompanyId}
              onSelect={setSelectedCompanyId}
            />
          )}
          <EmptyState
            isAdmin={isAdmin}
            hasCompanyId={!!user?.companyId}
            isDeveloper={isDeveloperAdmin || isDeveloperManager}
            selectedCompanyName={
              companies.find((c) => c.id === selectedCompanyId)?.name
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* 🔥 ТАБЫ ДЛЯ АДМИНА */}
      {isAdmin && tabs.length > 0 && (
        <div className="projects-tabs-wrapper">
          <Tabs
            tabs={tabs}
            selectedId={selectedCompanyId}
            onSelect={setSelectedCompanyId}
          />
        </div>
      )}

      {/* 🔥 ИНФОРМАЦИЯ О ТЕКУЩЕЙ КОМПАНИИ ДЛЯ НЕ-АДМИНА */}
      {!isAdmin && user?.companyName && (
        <div className="projects-company-badge">
          <span className="badge-icon">🏢</span>
          <span className="badge-text">{user.companyName}</span>
          <span className="badge-count"></span>
        </div>
      )}

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
  isDeveloper,
  selectedCompanyName,
}: {
  isAdmin: boolean;
  hasCompanyId: boolean;
  isDeveloper: boolean;
  selectedCompanyName?: string;
}) => (
  <div className="empty-state">
    <div className="empty-icon">🏗️</div>
    <p>
      {isAdmin
        ? selectedCompanyName
          ? `Нет проектов в компании "${selectedCompanyName}"`
          : "Нет доступных проектов"
        : isDeveloper
          ? hasCompanyId
            ? "У вашей компании пока нет проектов"
            : "Вам не назначена компания. Обратитесь к администратору."
          : "У вас нет доступа к проектам"}
    </p>
    {isDeveloper && !hasCompanyId && (
      <span className="empty-hint">
        Для доступа к проектам необходимо быть привязанным к компании
      </span>
    )}
    {!isDeveloper && !isAdmin && (
      <span className="empty-hint">
        Только администраторы и сотрудники компаний имеют доступ к проектам
      </span>
    )}
  </div>
);
