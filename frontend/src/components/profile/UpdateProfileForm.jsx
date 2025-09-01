import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Spinner from "../ui/Spinner";
import { PREDEFINED_CATEGORIES } from "../../utils/constants";

export function UpdateProfileForm({ userData, onUpdate }) {
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || "");
  const [selectedInterests, setSelectedInterests] = useState(
    userData.interests || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInterestChange = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await onUpdate({ phoneNumber, interests: selectedInterests });
      setSuccess("Perfil actualizado correctamente.");
    } catch (err) {
      setError(err.message || "Error al actualizar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-lg shadow"
    >
      <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
        Información Personal
      </h2>
      {success && <Alert type="success">{success}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <p className="mt-1 text-gray-900">{userData.nombre || "-"}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <p className="mt-1 text-gray-900">{userData.email}</p>
      </div>

      <Input
        label="Número de Teléfono"
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Ej: 3001234567"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mis Intereses
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PREDEFINED_CATEGORIES.map((interest) => (
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
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          {isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
