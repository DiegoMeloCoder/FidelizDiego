import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PlusIcon } from "@heroicons/react/24/outline";

export function AddJustificationForm({ onAdd }) {
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("El texto de la justificación no puede estar vacío.");
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      await onAdd({ textoJustificacion: text });
      setText(""); // Reset form on success
    } catch (err) {
      setError(err.message || "No se pudo agregar la justificación.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-3"
    >
      <h2 className="text-lg font-medium text-gray-700">
        Agregar Nueva Justificación de la Empresa
      </h2>
      <div>
        <label
          htmlFor="new-justification-text"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Texto de la Justificación
        </label>
        <Input
          id="new-justification-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej: Superó la Meta de Ventas del Q1"
          required
        />
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isAdding}>
          {isAdding ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <PlusIcon className="h-5 w-5 mr-1.5" />
          )}
          {isAdding ? "Agregando..." : "Agregar Justificación"}
        </Button>
      </div>
    </form>
  );
}
