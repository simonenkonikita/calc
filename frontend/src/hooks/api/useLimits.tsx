import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Limits } from "../../utils/types";

export const useLimits = () => {
  const [limits, setLimits] = useState<Limits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLimits = async () => {
      try {
        setLoading(true);
        const response = await api.getLimits();
        if (response.success) {
          setLimits(response.data);
        } else {
          setError(response.error || "Failed to load limits");
        }
      } catch (err) {
        setError("Error loading limits");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLimits();
  }, []);

  return { limits, loading, error };
};
