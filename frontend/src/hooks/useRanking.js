import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useRanking() {
  const { userData, currentUser, authLoading } = useAuth();

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limitCount = 20;

  const fetchRanking = useCallback(async () => {
    if (!userData?.company?.id) {
      if (userData) {
        setError(
          "La información de la empresa del usuario no está disponible para cargar el ranking."
        );
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/history/ranking");
      const list = response.data.data.ranking.map((employee, index) => ({
        ...employee,
        rank: index + 1, // Add the rank number based on the sorted list from the API
      }));
      setRanking(list.slice(0, limitCount)); // Limit the list on the client side
    } catch (err) {
      console.error("Error fetching ranking:", err);
      setError(err.message || "No se pudo cargar el ranking.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (!authLoading) {
      fetchRanking();
    }
  }, [authLoading, fetchRanking]);

  return {
    ranking,
    loading: loading || authLoading,
    error,
    limitCount,
    currentUser,
  };
}
