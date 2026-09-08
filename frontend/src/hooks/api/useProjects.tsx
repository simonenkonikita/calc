// frontend/src/hooks/useProjects.ts

import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { ApartmentType, ProjectInfo } from "../../utils/types";

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.getProjects();

        if (response.success) {
          // 🔥 Группируем данные по проектам
          const groupedProjects = groupProjectsByComplex(response.data || []);
          setProjects(groupedProjects);
        } else {
          setError(response.error || "Ошибка загрузки проектов");
          setProjects([]);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("Не удалось загрузить проекты");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // ============================================================
  // ХЕЛПЕРЫ
  // ============================================================

  const getProjectById = (id: string): ProjectInfo | undefined => {
    return projects.find((p) => p.id === id);
  };

  const getProjectByName = (name: string): ProjectInfo | undefined => {
    return projects.find((p) => p.name === name);
  };

  const getApartmentTypes = (projectId: string): ApartmentType[] => {
    const project = getProjectById(projectId);
    return project?.apartmentTypes || [];
  };

  const getPriceForType = (projectId: string, type: string): number => {
    const types = getApartmentTypes(projectId);
    const found = types.find((t) => t.type === type);
    return found?.pricePerSquareMeter || 0;
  };

  const getSurchargesForType = (
    projectId: string,
    type: string,
  ): { withoutDownPayment: number; partialDownPayment: number } => {
    const types = getApartmentTypes(projectId);
    const found = types.find((t) => t.type === type);
    return (
      found?.surcharges || { withoutDownPayment: 0, partialDownPayment: 0 }
    );
  };

  const getBanksForProject = (projectId: string): string[] => {
    const project = getProjectById(projectId);
    return project?.banks || [];
  };

  const getMinPrice = (projectId: string): number => {
    const types = getApartmentTypes(projectId);
    if (types.length === 0) return 0;
    return Math.min(...types.map((t) => t.pricePerSquareMeter));
  };

  const getMaxPrice = (projectId: string): number => {
    const types = getApartmentTypes(projectId);
    if (types.length === 0) return 0;
    return Math.max(...types.map((t) => t.pricePerSquareMeter));
  };

  const getProjectLink = (projectId: string): string | undefined => {
    const project = getProjectById(projectId);
    return project?.materialsLink;
  };

  return {
    projects,
    loading,
    error,
    getProjectById,
    getProjectByName,
    getApartmentTypes,
    getPriceForType,
    getSurchargesForType,
    getBanksForProject,
    getMinPrice,
    getMaxPrice,
    getProjectLink,
  };
};

// ============================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ГРУППИРОВКИ
// ============================================================

const groupProjectsByComplex = (data: any[]): ProjectInfo[] => {
  const groupedMap = new Map<string, ProjectInfo>();

  data.forEach((item) => {
    const projectId = item.id;

    if (!groupedMap.has(projectId)) {
      groupedMap.set(projectId, {
        id: item.id,
        name: item.complexName || item.name,
        status: item.status || "проект",
        statusIcon: item.statusIcon || "🏠",
        companyId: item.companyId,
        company: item.company,
        description: item.description || "",
        priceInfo: item.priceInfo || "",
        paymentTerms: item.paymentTerms || [],
        promotions: item.promotions || [],
        banks: item.banks || [],
        specialOffers: item.specialOffers || [],
        apartmentTypes: [],
        eligiblePrograms: item.eligiblePrograms || [],
        materialsLink: item.materialsLink || undefined,
        isActive: item.isActive !== undefined ? item.isActive : true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    const project = groupedMap.get(projectId)!;

    // Если есть данные о типе квартиры
    if (item.apartmentType) {
      project.apartmentTypes.push({
        type: item.apartmentType,
        pricePerSquareMeter: item.pricePerSquareMeter || 0,
        surcharges: item.surcharges || {
          withoutDownPayment: 0,
          partialDownPayment: 0,
        },
      });
    }

    // Если есть банки
    if (item.banks && Array.isArray(item.banks)) {
      project.banks = [...new Set([...project.banks, ...item.banks])];
    }

    // Если есть условия оплаты
    if (item.paymentTerms && Array.isArray(item.paymentTerms)) {
      project.paymentTerms = [
        ...new Set([...project.paymentTerms, ...item.paymentTerms]),
      ];
    }

    // Если есть акции
    if (item.promotions && Array.isArray(item.promotions)) {
      project.promotions = [
        ...new Set([...project.promotions, ...item.promotions]),
      ];
    }

    // Если есть спецпредложения
    if (item.specialOffers && Array.isArray(item.specialOffers)) {
      project.specialOffers = [
        ...new Set([...project.specialOffers, ...item.specialOffers]),
      ];
    }
  });

  return Array.from(groupedMap.values());
};
