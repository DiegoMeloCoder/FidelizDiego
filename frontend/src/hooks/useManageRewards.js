import { useState, useEffect, useCallback } from "react";
import apiClient, {
  uploadRewardImage,
  uploadGlobalRewardImage,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useManageRewards() {
  const { userData } = useAuth();

  // --- Estado de los Datos ---
  const [rewards, setRewards] = useState([]);

  // --- Estados de Carga y Feedback ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Lógica de Feedback ---
  const clearMessages = useCallback(() => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  }, []);

  // --- Lógica de Obtención de Datos ---
  const fetchRewards = useCallback(async () => {
    if (!userData) return; // Wait for user data to be available

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

  // --- Lógica de Mutación de Datos (CRUD) ---
  const addReward = async (rewardData, imageFile) => {
    let uploadedImageUrl = null;
    if (imageFile) {
      try {
        const uploadFunction =
          userData?.role === "Manager"
            ? uploadGlobalRewardImage
            : uploadRewardImage;
        const uploadResponse = await uploadFunction(imageFile);
        uploadedImageUrl = uploadResponse.imageUrl;
      } catch (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }
    }

    const payload = { ...rewardData, imageUrl: uploadedImageUrl };
    const response = await apiClient.post("/rewards", payload);
    const addedReward = response.data; // The backend returns the full reward object

    setRewards((prev) =>
      [...prev, addedReward].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    setSuccess(`Recompensa "${addedReward.nombre}" agregada exitosamente.`);
    clearMessages();
  };

  const updateReward = async (rewardId, updateData, imageFile, removeImage) => {
    let imageUrlPayload;
    if (imageFile) {
      try {
        const uploadFunction =
          userData?.role === "Manager"
            ? uploadGlobalRewardImage
            : uploadRewardImage;
        const uploadResponse = await uploadFunction(imageFile);
        imageUrlPayload = uploadResponse.imageUrl;
      } catch (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }
    } else if (removeImage) {
      imageUrlPayload = null;
    }

    const payload = { ...updateData };
    if (imageUrlPayload !== undefined) {
      payload.imageUrl = imageUrlPayload;
    }

    const response = await apiClient.put(`/rewards/${rewardId}`, payload);
    const updatedReward = response.data;
    setRewards((prev) =>
      prev.map((r) => (r.id === updatedReward.id ? updatedReward : r))
    );
    setSuccess(
      `Recompensa "${updatedReward.nombre}" actualizada exitosamente.`
    );
    clearMessages();
  };

  const toggleRewardStatus = async (reward) => {
    const response = await apiClient.patch(
      `/rewards/${reward.id}/toggle-status`
    );
    const updatedReward = response.data.data.reward;
    setRewards((prev) =>
      prev.map((r) => (r.id === updatedReward.id ? updatedReward : r))
    );
    setSuccess(response.data.data.message);
    clearMessages();
  };

  return {
    rewards,
    loading,
    error,
    success,
    addReward,
    updateReward,
    toggleRewardStatus,
    userRole: userData?.role,
  };
}
