import { useState, useEffect } from "react";
import { ProgramConfig } from "../../utils/types";

export const usePrograms = () => {
  const [programs, setPrograms] = useState<ProgramConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/programs/config");
        const result = await response.json();

        if (result.success && result.data) {
          setPrograms(result.data.programs);
        } else {
          setError(result.error || "Failed to load programs");
        }
      } catch (err) {
        setError("Error loading programs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  const getProgramByType = (type: string): ProgramConfig | undefined => {
    return programs.find((p) => p.type === type);
  };

  return {
    programs,
    loading,
    error,
    getProgramByType,
  };
};
