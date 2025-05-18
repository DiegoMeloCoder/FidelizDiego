import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert"; // Para feedback
import apiClient from "../../services/api"; // Importar cliente API

// Lista predefinida de intereses (debería coincidir con la del backend/config)
const predefinedInterests = [
  "Deportes",
  "Tecnología",
  "Viajes",
  "Hogar",
  "Gastronomía",
  "Moda",
  "Bienestar",
  "Lectura",
  "Música",
  "Cine/Series",
  "Mascotas",
  "Videojuegos",
  "Arte/Cultura",
  "Aire Libre",
];
// Lista predefinida de sugerencias de recompensa (debería coincidir con la del backend)
const predefinedSuggestions = [
  "Suscripción Streaming (Música)",
  "Suscripción Streaming (Video)",
  "Bono Restaurante",
  "Bono Ropa/Moda",
  "Entradas Cine",
  "Experiencia Aventura",
  "Artículo Deportivo",
  "Artículo Tecnológico",
  "Donación Caridad",
  "Día Libre Adicional",
  "Otro (ver notas)",
];

function ProfilePage() {
  // Add currentUser to the destructuring
  const {
    currentUser,
    userData,
    loading: authLoading,
    fetchUserProfile,
  } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [requestedItem, setRequestedItem] = useState(""); // State for selected suggestion
  const [additionalNotes, setAdditionalNotes] = useState(""); // State for optional notes
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestError, setRequestError] = useState("");

  // Cargar datos iniciales del perfil cuando userData esté disponible
  useEffect(() => {
    if (userData) {
      setPhoneNumber(userData.phoneNumber || "");
      setSelectedInterests(userData.interests || []);
    }
  }, [userData]);

  const handleInterestChange = (interest) => {
    setSelectedInterests(
      (prev) =>
        prev.includes(interest)
          ? prev.filter((i) => i !== interest) // Deseleccionar
          : [...prev, interest] // Seleccionar
    );
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    setUpdateSuccess("");
    setUpdateError("");
    try {
      // Llamar a PUT /api/v1/auth/profile con { phoneNumber, interests: selectedInterests }
      const response = await apiClient.put("/auth/profile", {
        phoneNumber,
        interests: selectedInterests,
      });
      // Pasar currentUser a fetchUserProfile para refrescar correctamente
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        console.warn("Intento de refrescar perfil sin currentUser disponible");
        // Opcionalmente, forzar recarga de página o mostrar error
      }
      setUpdateSuccess("Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setUpdateError(
        err.response?.data?.message || "Error al actualizar el perfil."
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleRewardRequest = async (e) => {
    e.preventDefault();
    if (!requestedItem) {
      // Check if an item is selected
      setRequestError("Por favor, selecciona una sugerencia de la lista.");
      return;
    }
    if (requestedItem === "Otro (ver notas)" && !additionalNotes.trim()) {
      setRequestError(
        "Por favor, especifica tu sugerencia en las notas adicionales."
      );
      return;
    }
    setLoadingRequest(true);
    setRequestSuccess("");
    setRequestError("");
    try {
      // Llamar a POST /api/v1/rewards/requests con { requestedItem, additionalNotes }
      const payload = { requestedItem };
      if (additionalNotes.trim()) {
        payload.additionalNotes = additionalNotes.trim();
      }
      const response = await apiClient.post("/rewards/requests", payload);
      setRequestSuccess("Sugerencia enviada. ¡Gracias!");
      setRequestedItem(""); // Limpiar selección
      setAdditionalNotes(""); // Limpiar notas
    } catch (err) {
      console.error("Error enviando sugerencia:", err);
      setRequestError(
        err.response?.data?.message || "Error al enviar la sugerencia."
      );
    } finally {
      setLoadingRequest(false);
    }
  };

  if (authLoading || !userData) {
    return <div>Cargando perfil...</div>; // O un spinner
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>

      {/* Formulario de Actualización de Perfil */}
      <form
        onSubmit={handleProfileUpdate}
        className="space-y-4 p-6 bg-white rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
          Información Personal
        </h2>
        {updateSuccess && <Alert type="success">{updateSuccess}</Alert>}
        {updateError && <Alert type="error">{updateError}</Alert>}

        {/* Campos existentes (solo lectura por ahora) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <p className="mt-1 text-gray-900">{userData.nombre || "-"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <p className="mt-1 text-gray-900">{userData.email}</p>
        </div>

        {/* Campo Teléfono */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Número de Teléfono
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ej: 3001234567"
            className="mt-1"
          />
        </div>

        {/* Sección Intereses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mis Intereses
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {predefinedInterests.map((interest) => (
              <label
                key={interest}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" variant="primary" disabled={loadingUpdate}>
            {loadingUpdate ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>

      {/* Formulario de Sugerencia de Recompensa */}
      <form
        onSubmit={handleRewardRequest}
        className="space-y-4 p-6 bg-white rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
          Sugerir una Recompensa
        </h2>
        <p className="text-sm text-gray-600">
          ¿Hay alguna recompensa que te gustaría ver en nuestro catálogo?
          Selecciona una opción o "Otro" y déjanos una nota.
        </p>
        {requestSuccess && <Alert type="success">{requestSuccess}</Alert>}
        {requestError && <Alert type="error">{requestError}</Alert>}
        {/* Suggestion Dropdown */}
        <div>
          <label
            htmlFor="requestedItem"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tipo de Recompensa Sugerida
          </label>
          <select
            id="requestedItem"
            name="requestedItem"
            value={requestedItem}
            onChange={(e) => setRequestedItem(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
            required
          >
            <option value="" disabled>
              -- Selecciona una opción --
            </option>
            {predefinedSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion}>
                {suggestion}
              </option>
            ))}
          </select>
        </div>
        {/* Optional Notes Textarea */}
        <div>
          <label
            htmlFor="additionalNotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notas Adicionales (Opcional)
            {requestedItem === "Otro (ver notas)" && (
              <span className="text-red-600">*</span>
            )}{" "}
            {/* Mark as required if 'Otro' selected */}
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Si seleccionaste 'Otro' o quieres dar más detalles, escríbelos aquí..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
            required={requestedItem === "Otro (ver notas)"} // Make required only if 'Otro' is selected
          />
        </div>
        <div className="pt-2">
          <Button type="submit" variant="secondary" disabled={loadingRequest}>
            {loadingRequest ? "Enviando..." : "Enviar Sugerencia"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
