import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function useUserProfile() {
  const { currentUser, userData, fetchUserProfile } = useAuth();

  // --- Estado del Formulario de Perfil ---
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  // --- Estado del Formulario de Sugerencia ---
  const [requestedItem, setRequestedItem] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // --- Estados de Carga y Feedback ---
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");

  // Cargar datos iniciales del perfil
  useEffect(() => {
    if (userData) {
      setPhoneNumber(userData.phoneNumber || "");
      setSelectedInterests(userData.interests || []);
    }
  }, [userData]);

  // --- Lógica de Mutación de Datos ---
  const handleProfileUpdate = async (profileData) => {
    setLoadingUpdate(true);
    setUpdateSuccess("");
    setUpdateError("");
    try {
      await apiClient.put("/auth/profile", profileData);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      }
      setUpdateSuccess("Perfil actualizado correctamente.");
    } catch (err) {
      setUpdateError(err.message || "Error al actualizar el perfil.");
      throw err;
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleRewardRequest = async (requestData) => {
    setLoadingRequest(true);
    setRequestSuccess("");
    setRequestError("");
    try {
      await apiClient.post("/rewards/requests", requestData);
      setRequestSuccess("¡Sugerencia enviada exitosamente!");
    } catch (err) {
      setRequestError(err.message || "Error al enviar la sugerencia.");
      throw err;
    } finally {
      setLoadingRequest(false);
    }
  };

  return {
    // Datos del perfil
    userData,
    phoneNumber,
    setPhoneNumber,
    selectedInterests,
    setSelectedInterests,
    // Datos de sugerencia
    requestedItem,
    setRequestedItem,
    additionalNotes,
    setAdditionalNotes,
    // Estados y funciones
    loadingUpdate,
    loadingRequest,
    updateSuccess,
    updateError,
    requestSuccess,
    requestError,
    handleProfileUpdate,
    handleRewardRequest,
  };
}
