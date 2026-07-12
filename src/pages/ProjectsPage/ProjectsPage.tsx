// src/pages/ProjectsPage.tsx

import React, { useState } from "react";
import "./ProjectsPage.css";
import { ProjectInfo, PROJECTS_INFO } from "../../data/projectInfo";

export const ProjectsPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(
    PROJECTS_INFO[0] || null,
  );

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

  return (
    <div className="projects-page">
      <div className="projects-container">
        <div className="projects-header">
          <h1>Информация по проектам</h1>
          <p className="subtitle">
            Выберите ЖК для просмотра подробной информации
          </p>
        </div>

        <div className="projects-layout">
          {/* Список проектов */}
          <div className="projects-list">
            <div className="projects-list-header">
              <h2>Жилые комплексы</h2>
              <span className="count">{PROJECTS_INFO.length}</span>
            </div>
            {PROJECTS_INFO.map((project) => (
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

          {/* Детальная информация */}
          <div className="project-details">
            {selectedProject ? (
              <div className="details-card">
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

                {selectedProject.description && (
                  <div className="details-section">
                    <p className="description">{selectedProject.description}</p>
                  </div>
                )}

                <div className="details-section">
                  <div className="section-label">💰 Цены</div>
                  <div className="section-value price">
                    {selectedProject.priceInfo}
                  </div>
                </div>

                <div className="details-section">
                  <div className="section-label">💳 Условия оплаты</div>
                  <ul className="info-list">
                    {selectedProject.paymentTerms.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>

                {selectedProject.promotions &&
                  selectedProject.promotions.length > 0 && (
                    <div className="details-section highlight">
                      <div className="section-label">
                        🔥 Акции и предложения
                      </div>
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
              </div>
            ) : (
              <div className="no-project-selected">
                <div className="empty-icon">🏗️</div>
                <p>Выберите проект для просмотра информации</p>
                <span className="empty-hint">
                  Кликните на ЖК в списке слева
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
