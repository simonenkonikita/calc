// src/pages/ProjectsPage/ProjectsPage.tsx

import React, { useState, useEffect } from "react";
import "./ProjectsPage.css";
import { useProjects } from "../../hooks/useProjects";
import { ProjectInfo } from "../../utils/types";

export const ProjectsPage: React.FC = () => {
  const { projects, loading, error } = useProjects();
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(
    null,
  );

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

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

  const getPriceInfo = (project: ProjectInfo): React.ReactNode => {
    if (!project.apartmentTypes || project.apartmentTypes.length === 0) {
      return "—";
    }

    return (
      <div className="price-types-list">
        {project.apartmentTypes.map((apt, index) => {
          const basePrice = apt.pricePerSquareMeter;
          const withoutPV = apt.surcharges?.withoutDownPayment || 0;
          const partialPV = apt.surcharges?.partialDownPayment || 0;

          return (
            <div key={index} className="price-type-item">
              <div className="price-type-name">{apt.type}</div>
              <div className="price-type-values">
                <span className="price-base">
                  💰 {basePrice.toLocaleString()} ₽/м²
                </span>
                {withoutPV > 0 && (
                  <span className="price-without-pv">
                    🔥 Без ПВ: {(basePrice + withoutPV).toLocaleString()} ₽/м²
                  </span>
                )}
                {partialPV > 0 && (
                  <span className="price-partial-pv">
                    🔥 Частичный ПВ: {(basePrice + partialPV).toLocaleString()}{" "}
                    ₽/м²
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-page">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Повторить</button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="projects-page">
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <p>Нет доступных проектов</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-layout">
        <div className="projects-list-wrapper">
          <div className="projects-list-card">
            <div className="projects-list-header">
              <h2>Проекты</h2>
              <span className="count">{projects.length}</span>
            </div>
            <div className="projects-list-items">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-item ${selectedProject?.id === project.id ? "active" : ""}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <span className="project-icon">{project.statusIcon}</span>
                  <span className="project-name">{project.name}</span>
                  <span
                    className={`project-status-dot ${getStatusDotClass(project.status)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="project-details-wrapper">
          {selectedProject ? (
            <div className="project-details-card">
              <div className="details-header">
                <div className="details-title">
                  <span className="project-icon-large">
                    {selectedProject.statusIcon}
                  </span>
                  <h2>{selectedProject.name}</h2>
                </div>
                <span
                  className={`status-badge ${getStatusClass(selectedProject.status)}`}
                >
                  {selectedProject.status}
                </span>
              </div>

              <div className="details-content">
                {selectedProject.description && (
                  <div className="details-section">
                    <p className="description">{selectedProject.description}</p>
                  </div>
                )}

                <div className="details-section">
                  <div className="section-label">💳 Условия оплаты</div>
                  <ul className="info-list">
                    {selectedProject.paymentTerms.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>

                <div className="details-section">
                  <div className="section-label">💰 Цены</div>
                  <div className="section-value price">
                    {getPriceInfo(selectedProject)}
                  </div>
                </div>

                <div className="details-section">
                  <div className="section-label">🏦 Банки-партнеры</div>
                  <div className="banks-tags">
                    {selectedProject.banks.map((bank) => (
                      <span key={bank} className="bank-tag">
                        {bank}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.promotions &&
                  selectedProject.promotions.length > 0 && (
                    <div className="details-section highlight">
                      <div className="section-label">Акции и предложения</div>
                      <ul className="info-list promotions">
                        {selectedProject.promotions.map((promo, index) => (
                          <li key={index}>{promo}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedProject.specialOffers &&
                  selectedProject.specialOffers.length > 0 && (
                    <div className="details-section special">
                      <div className="section-label">⭐ Спецпредложения</div>
                      <ul className="info-list special">
                        {selectedProject.specialOffers.map((offer, index) => (
                          <li key={index}>{offer}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* 🔥 БЛОК: ДОСТУПНЫЕ ИПОТЕЧНЫЕ ПРОГРАММЫ */}
                {selectedProject.eligiblePrograms &&
                  selectedProject.eligiblePrograms.length > 0 && (
                    <div className="details-section mortgage-programs-section">
                      <div className="section-label">
                        🏦 Доступные ипотечные программы
                      </div>
                      <div className="mortgage-programs-grid">
                        {selectedProject.eligiblePrograms.map((program) => (
                          <div
                            key={program.type}
                            className="mortgage-program-badge"
                            style={{ borderColor: program.color }}
                          >
                            <span className="program-icon">{program.icon}</span>
                            <div className="program-info">
                              <span className="program-name">
                                {program.label}
                              </span>
                              <span className="program-description">
                                {program.description}
                              </span>

                              {program.banks && program.banks.length > 0 && (
                                <div className="program-banks">
                                  <span className="banks-label">🏦 Банки:</span>
                                  <span className="banks-list">
                                    {program.banks.join(", ")}
                                  </span>
                                </div>
                              )}

                              {program.offers && program.offers.length > 0 && (
                                <div className="program-offers">
                                  <span className="offers-label">
                                    📊 Предложений:
                                  </span>
                                  <span className="offers-count">
                                    {program.offers.length}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏗️</div>
              <p>Выберите проект для просмотра информации</p>
              <span className="empty-hint">Кликните на ЖК в списке слева</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
