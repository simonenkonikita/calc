// frontend/src/hooks/useProjects.ts

import { useState, useEffect } from "react";
import { api } from "../services/api";
import { ApartmentType, ProjectInfo, RawProjectData } from "../utils/types";

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await api.getProjects();
        if (response.success) {
          const groupedProjects = groupProjectsByComplex(response.data);
          setProjects(groupedProjects);
        } else {
          setError(response.error || "Failed to load projects");
        }
      } catch (err) {
        setError("Error loading projects");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // ============================================================
  // 🔥 ХЕЛПЕРЫ
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
  };
};

// ============================================================
// 🔥 ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ГРУППИРОВКИ
// ============================================================

const groupProjectsByComplex = (data: RawProjectData[]): ProjectInfo[] => {
  const groupedMap = new Map<string, ProjectInfo>();

  data.forEach((item) => {
    const { apartmentType, pricePerSquareMeter, surcharges, ...projectData } =
      item;

    if (!groupedMap.has(item.id)) {
      groupedMap.set(item.id, {
        id: item.id,
        name: item.complexName,
        status: item.status,
        statusIcon: item.statusIcon,
        description: item.description,
        priceInfo: item.priceInfo,
        paymentTerms: item.paymentTerms,
        promotions: item.promotions,
        banks: item.banks,
        specialOffers: item.specialOffers,
        apartmentTypes: [],
      });
    }

    const project = groupedMap.get(item.id)!;
    project.apartmentTypes.push({
      type: apartmentType,
      pricePerSquareMeter,
      surcharges,
    });
  });

  return Array.from(groupedMap.values());
};
