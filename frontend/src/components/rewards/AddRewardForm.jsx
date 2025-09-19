import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PlusIcon } from "@heroicons/react/24/outline";
import { PREDEFINED_CATEGORIES } from "../../utils/constants";
import { ImageUploadInput } from "../ui/ImageUploadInput";

export function AddRewardForm({ onAdd }) {
  // State for form fields
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [stock, setStock] = useState("");
  const [tags, setTags] = useState([]);

  const [imageFile, setImageFile] = useState(null);

  // State for UI feedback
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleTagChange = (tag) => {
    setTags(
      (prevTags) =>
        prevTags.includes(tag)
          ? prevTags.filter((t) => t !== tag) // Remove tag if it's already there
          : [...prevTags, tag] // Add tag if it's not
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pointsNum = parseInt(points, 10);
    const stockNum = stock === "" ? null : parseInt(stock, 10);
    if (!name.trim() || isNaN(pointsNum) || pointsNum <= 0) {
      setError(
        "Por favor, ingresa un nombre válido y un valor de puntos positivo."
      );
      return;
    }
    if (stockNum !== null && stockNum < 0) {
      setError("La cantidad (stock) no puede ser un número negativo.");
      return;
    }

    setIsAdding(true);
    setError("");
    try {
      await onAdd(
        {
          nombre: name,
          pointsRequired: pointsNum,
          stock: stockNum,
          tags,
        },
        imageFile
      );
      // Reset form on success
      setName("");
      setPoints("");
      setStock("");
      setImageFile(null);
      setTags([]);
    } catch (err) {
      setError(err.message || "No se pudo agregar la recompensa.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4"
    >
      <h2 className="text-lg font-medium text-gray-700">
        Agregar Nueva Recompensa
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="new-reward-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre de Recompensa
          </label>
          <Input
            id="new-reward-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Tarjeta de Regalo"
            required
          />
        </div>
        <div>
          <label
            htmlFor="new-reward-points"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Puntos Requeridos
          </label>
          <Input
            id="new-reward-points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Ej: 1000"
            required
            min="1"
          />
        </div>
        <div>
          <label
            htmlFor="new-reward-stock"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cantidad (Opcional)
          </label>
          <Input
            id="new-reward-stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Vacío = Infinito"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Etiquetas de Recompensa (Opcional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {PREDEFINED_CATEGORIES.map((tag) => (
            <label
              key={tag}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={tags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                className="rounded-xs text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <ImageUploadInput
        label="Imagen de Recompensa (Opcional)"
        onFileChange={setImageFile}
        onFileRemove={() => setImageFile(null)}
      />

      {error && <Alert type="error">{error}</Alert>}

      <div className="flex justify-end">
        <Button type="submit" disabled={isAdding}>
          {isAdding ? (
            <Spinner size="sm" color="text-white" className="mr-2" />
          ) : (
            <PlusIcon className="h-5 w-5 mr-1.5" />
          )}
          {isAdding ? "Agregando..." : "Agregar Recompensa"}
        </Button>
      </div>
    </form>
  );
}
