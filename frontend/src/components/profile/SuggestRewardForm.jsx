import { useState } from "react";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Spinner from "../ui/Spinner";
import { PREDEFINED_REWARD_SUGGESTIONS } from "../../utils/constants";

export function SuggestRewardForm({ onSuggest }) {
  const [requestedItem, setRequestedItem] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedItem) {
      setError("Por favor, selecciona una sugerencia.");
      return;
    }
    if (requestedItem === "Otro (ver notas)" && !additionalNotes.trim()) {
      setError("Por favor, especifica tu sugerencia en las notas.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await onSuggest({ requestedItem, additionalNotes });
      setSuccess("¡Sugerencia enviada exitosamente!");
      setRequestedItem("");
      setAdditionalNotes("");
    } catch (err) {
      setError(err.message || "Error al enviar la sugerencia.");
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
        Sugerir una Recompensa
      </h2>
      <p className="text-sm text-gray-600">
        ¿Hay alguna recompensa que te gustaría ver? ¡Dinos!
      </p>
      {success && <Alert type="success">{success}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div>
        <label
          htmlFor="requestedItem"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tipo de Recompensa Sugerida
        </label>
        <select
          id="requestedItem"
          value={requestedItem}
          onChange={(e) => setRequestedItem(e.target.value)}
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
        >
          <option value="" disabled>
            -- Selecciona una opción --
          </option>
          {PREDEFINED_REWARD_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion}>
              {suggestion}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="additionalNotes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notas Adicionales (Opcional)
        </label>
        <textarea
          id="additionalNotes"
          rows={2}
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Si seleccionaste 'Otro', detalla tu sugerencia aquí..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
          required={requestedItem === "Otro (ver notas)"}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" variant="secondary" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          {isLoading ? "Enviando..." : "Enviar Sugerencia"}
        </Button>
      </div>
    </form>
  );
}
