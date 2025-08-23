import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useAvailableRewards() {
  const { userData, refreshUserData } = useAuth();

  const [rewards, setRewards] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRewards = useCallback(async () => {
    if (!userData) return; // Wait for user data

    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/rewards");
      setRewards(response.data.data.rewards || []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las recompensas.");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // --- Lógica de Mutación de Datos ---
  const redeemReward = async (rewardId) => {
    // The service will handle all business logic (points, stock, etc.)
    const response = await apiClient.post(
      `/redemptions/rewards/${rewardId}/redeem`
    );
    // After a successful redemption, refresh all data
    await refreshUserData(); // Updates user points in the context
    await fetchRewards(); // Refetches rewards to update stock
    return response.data.data; // Return data for success message
  };

  const voteOnReward = async (rewardId, voteType) => {
    const response = await apiClient.post(`/rewards/${rewardId}/vote`, {
      voteType,
    });
    const updatedReward = response.data.data.reward;
    // Update the specific reward in the local state for immediate feedback
    setRewards((prev) =>
      prev.map((r) =>
        r.id === updatedReward.id
          ? {
              ...r,
              likes: updatedReward.likes,
              dislikes: updatedReward.dislikes,
            }
          : r
      )
    );
  };

  return {
    rewards,
    loading,
    error,
    userPoints: userData?.points ?? 0,
    redeemReward,
    voteOnReward,
  };
}
