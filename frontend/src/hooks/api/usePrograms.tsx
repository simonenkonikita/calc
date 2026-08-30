// src/hooks/api/usePrograms.ts

import { useState, useEffect } from "react";
import { ProgramCategory } from "../../utils/types";

export const usePrograms = () => {
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/programs/categories");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          setError(result.error || "Failed to load program categories");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading programs");
        console.error("Error loading programs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryByType = (type: string): ProgramCategory | undefined => {
    return categories.find((c) => c.type === type);
  };

  const getCategoryByKey = (key: string): ProgramCategory | undefined => {
    return categories.find((c) => c.key === key);
  };

  return {
    categories,
    loading,
    error,
    getCategoryByType,
    getCategoryByKey,
  };
};
