// src/pages/ProjectsPage/ProjectsPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import "./ProjectsPage.css";
import { useProjects } from "../../hooks/useProjects";
import { ProjectInfo } from "../../utils/types";

export const ProjectsPage: React.FC = () => {
  const { 
    projects, 
    loading, 
    error,
    getBanksForProject 
  } = useProjects();
  
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(
    null,
  );
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Группируем предложения по типам программ
  const groupedByProgram = useMemo(() => {
    if (!selectedProject?.eligiblePrograms) return {};

    const grouped: Record<string, any> = {};

    selectedProject.eligiblePrograms.forEach((program) => {
      if (program.offers && program.offers.length > 0) {
        grouped[program.type] = program;
      }
    });

    return grouped;
  }, [selectedProject]);

  // Сортируем программы в нужном порядке
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

  // 🔥 Получаем банки для выбранного ЖК через хук
  const availableBanks = useMemo(() => {
    if (!selectedProject) return [];
    return getBanksForProject(selectedProject.id) || [];
  }, [selectedProject, getBanksForProject]);

  // 🔥 Получаем банки из предложений и фильтруем их
  const banksFromOffers = useMemo(() => {
    if (!selectedProject?.eligiblePrograms) return [];

    const banksSet = new Set<string>();

    selectedProject.eligiblePrograms.forEach((program) => {
      if (program.offers && program.offers.length > 0) {
        program.offers.forEach((offer) => {
          if (availableBanks.includes(offer.bank)) {
            banksSet.add(offer.bank);
          }
        });
      }
    });

    return Array.from(banksSet);
  }, [selectedProject, availableBanks]);

  // 🔥 Финальный список банков для отображения
  const displayBanks = useMemo(() => {
    if (availableBanks.length > 0) {
      return availableBanks;
    }
    return banksFromOffers;
  }, [availableBanks, banksFromOffers]);

  // 🔥 Фильтруем офферы по доступным банкам
  const getFilteredOffers = (offers: any[]) => {
    return offers.filter((offer) => displayBanks.includes(offer.bank));
  };

  // 🔥 Функция для отображения субсидии (динамическая или статическая)
  const getDisplaySubsidy = (offer: any) => {
    const hasDynamicSubsidy = offer.dynamicSubsidyPercent && offer.dynamicSubsidyPercent.length > 0;
    
    if (hasDynamicSubsidy) {
      const subsidies = offer.dynamicSubsidyPercent
        .map((rule: any) => rule.subsidyPercent)
        .filter((val: number) => val !== undefined && val !== null)
        .sort((a: number, b: number) => a - b);
      
      if (subsidies.length === 0) return "—";
      
      const minSubsidy = subsidies[0];
      const maxSubsidy = subsidies[subsidies.length - 1];
      
      if (minSubsidy === maxSubsidy) {
        return `${minSubsidy}%`;
      }
      
      return `${minSubsidy}% — ${maxSubsidy}%`;
    }
    
    if (offer.subsidyPercent > 0) {
      return `${offer.subsidyPercent}%`;
    }
    
    return "—";
  };

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

  // 🔥 Обработчик открытия ссылки
  const handleOpenLink = (link: string) => {
    if (link) {
      window.open(link, '_blank');
    }
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
                <div className="details-header-actions">
                  <span
                    className={`status-badge ${getStatusClass(selectedProject.status)}`}
                  >
                    {selectedProject.status}
                  </span>
                  {/* 🔥 КНОПКА СО ССЫЛКОЙ НА ПРОЕКТ (используем materialsLink) */}
                  {selectedProject.materialsLink && (
                    <button
                      className="project-link-button"
                      onClick={() => handleOpenLink(selectedProject.materialsLink!)}
                      title="Открыть страницу проекта"
                    >
                      <span className="link-icon">🔗</span>
                      Сайт проекта
                    </button>
                  )}
                </div>
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
                    {displayBanks.length > 0 ? (
                      displayBanks.map((bank) => (
                        <span key={bank} className="bank-tag">
                          {bank}
                        </span>
                      ))
                    ) : (
                      <span className="bank-tag-empty">
                        Нет доступных банков
                      </span>
                    )}
                  </div>
                </div>

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

                {/* 🔥 АККОРДЕОН ПО ТИПАМ ПРОГРАММ */}
                {sortedProgramTypes.length > 0 && (
                  <div className="details-section mortgage-modern-section">
                    <div className="section-label">
                      🏦 Ипотечные программы
                      <span className="programs-count-badge">
                        {sortedProgramTypes.length} типов
                      </span>
                    </div>

                    <div className="programs-modern-grid">
                      {sortedProgramTypes.map((programType) => {
                        const program = groupedByProgram[programType];
                        const isExpanded = expandedProgram === programType;
                        
                        const filteredOffers = getFilteredOffers(program.offers || []);

                        return (
                          <div
                            key={programType}
                            className={`program-modern-card ${isExpanded ? "expanded" : ""}`}
                            style={{
                              borderColor: isExpanded
                                ? program.color
                                : "#e5e7eb",
                            }}
                          >
                            <div
                              className="program-modern-header"
                              onClick={() =>
                                setExpandedProgram(
                                  isExpanded ? null : programType,
                                )
                              }
                              style={{
                                background: isExpanded
                                  ? `linear-gradient(135deg, ${program.color}15 0%, ${program.color}08 100%)`
                                  : "#f8fafc",
                              }}
                            >
                              <div className="program-modern-info">
                                <span className="program-modern-icon">
                                  {program.icon}
                                </span>
                                <span className="program-modern-name">
                                  {program.label}
                                </span>
                                <span
                                  className="program-modern-badge"
                                  style={{ background: program.color }}
                                >
                                  {filteredOffers.length} предложений
                                </span>
                              </div>
                              <div className="program-modern-rate">
                                <span className="expand-icon">
                                  {isExpanded ? "−" : "+"}
                                </span>
                              </div>
                            </div>

                            {isExpanded && filteredOffers.length > 0 && (
                              <div className="program-modern-offers">
                                <div className="offer-table-header">
                                  <span className="header-bank">Банк</span>
                                  <span className="header-rate">Ставка</span>
                                  <span className="header-subsidy">
                                    Субсидия
                                  </span>
                                  <span className="header-pv">Мин. ПВ</span>
                                  <span className="header-info">
                                    Информация
                                  </span>
                                </div>

                                {filteredOffers.map((offer, idx) => {
                                  const hasDynamicRatesIU =
                                    offer.dynamicRatesIU &&
                                    offer.dynamicRatesIU.length > 0;

                                  const hasDynamicRates =
                                    offer.dynamicRates &&
                                    offer.dynamicRates.length > 0 &&
                                    !hasDynamicRatesIU;

                                  const isExcessLimit =
                                    offer.excessLimit === true;

                                  const getMinPV = () => {
                                    if (hasDynamicRatesIU) {
                                      return offer.dynamicRatesIU[0]
                                        .minPVPercent;
                                    }
                                    return offer.minPVPercent;
                                  };

                                  const getDisplayRate = () => {
                                    if (hasDynamicRatesIU) {
                                      return offer.dynamicRatesIU.map(
                                        (rule, i) => (
                                          <div
                                            key={i}
                                            className="dynamic-rate-item"
                                          >
                                            <span className="dynamic-rate-value">
                                              {rule.rate}%
                                            </span>
                                            <span className="dynamic-rate-condition">
                                              {rule.description ||
                                                `ПВ от ${rule.minPVPercent}%`}
                                            </span>
                                          </div>
                                        ),
                                      );
                                    }

                                    if (isExcessLimit && hasDynamicRates) {
                                      const rates = offer.dynamicRates
                                        .map((r) => r.rate)
                                        .sort((a, b) => a - b);
                                      const minRate = rates[0];
                                      const maxRate = rates[rates.length - 1];

                                      return (
                                        <span className="excess-rate-range-text">
                                          {minRate}% — {maxRate}%
                                        </span>
                                      );
                                    }

                                    return (
                                      <>
                                        {offer.shortRate && (
                                          <span className="offer-modern-rate-short">
                                            {offer.shortRate}% →
                                          </span>
                                        )}
                                        <span className="offer-modern-rate">
                                          {offer.rate}%
                                        </span>
                                        {offer.twoRate && (
                                          <span className="offer-modern-rate-two">
                                            {offer.twoRate}%
                                          </span>
                                        )}
                                      </>
                                    );
                                  };

                                  return (
                                    <div
                                      key={idx}
                                      className="offer-modern-item"
                                    >
                                      <div className="offer-modern-left">
                                        <span className="offer-modern-icon">
                                          🏦
                                        </span>
                                        <div className="offer-modern-info">
                                          <span className="offer-modern-name">
                                            {offer.bank}
                                          </span>
                                          <span className="offer-modern-desc">
                                            {offer.program}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="offer-modern-rate-block">
                                        {getDisplayRate()}
                                      </div>

                                      <div className="offer-modern-subsidy">
                                        <span className="stat-value">
                                          {getDisplaySubsidy(offer)}
                                        </span>
                                      </div>

                                      <div className="offer-modern-pv">
                                        <span className="stat-value">
                                          {getMinPV()}%
                                        </span>
                                      </div>

                                      <div className="offer-modern-info-text">
                                        {offer.description ? (
                                          <span className="info-text">
                                            {offer.description}
                                          </span>
                                        ) : (
                                          <span className="info-text-empty">
                                            —
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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