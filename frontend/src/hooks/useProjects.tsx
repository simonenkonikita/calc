// frontend/src/hooks/useProjects.ts

import { useState, useEffect } from "react";
import { api } from "../services/api";

export interface ProjectInfo {
  id: string;
  name: string;
  status: "строится" | "сдан" | "проект";
  statusIcon: string;
  priceInfo: string;
  paymentTerms: string[];
  promotions: string[];
  banks: string[];
  specialOffers?: string[];
  description?: string;
  materialsLink?: string;
}

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
          setProjects(response.data);
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

  const getProjectById = (id: string): ProjectInfo | undefined => {
    return projects.find((p) => p.id === id);
  };

  return { projects, loading, error, getProjectById };
};