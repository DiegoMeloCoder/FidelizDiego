import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { PREDEFINED_CATEGORIES } from "../../utils/constants";
import { ImageUploadInput } from "../ui/ImageUploadInput";

export function EditRewardModal({ reward, isOpen, onClose, onSave }) {
  // State for form fields
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  // State for UI feedback
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (reward) {
      setName(reward.nombre || "");
      setPoints(reward.pointsRequired?.toString() || "");
      setStock(
        reward.stock === null || reward.stock === undefined
          ? ""
          : reward.stock.toString()
      );
      setIsActive(reward.isActive);
      setTags(reward.tags || []);
      // Reset image state each time the modal opens
      setImageFile(null);
      setRemoveCurrentImage(false);
    }
  }, [reward]);

  const handleTagChange = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async (e) => {
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

    setIsSaving(true);
    setError("");
    try {
      await onSave(
        reward.id,
        {
          nombre: name,
          pointsRequired: pointsNum,
          stock: stockNum,
          isActive,
          tags,
        },
        imageFile,
        removeCurrentImage
      );
      onClose();
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !reward) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Recompensa: ${reward.nombre}`}
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="edit-reward-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de Recompensa
            </label>
            <Input
              id="edit-reward-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="edit-reward-points"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Puntos Requeridos
            </label>
            <Input
              id="edit-reward-points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              min="1"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="edit-reward-stock"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cantidad (Opcional)
          </label>
          <Input
            id="edit-reward-stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Vacío = Infinito"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas (Opcional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
          label="Imagen de la Recompensa (Opcional)"
          existingImageUrl={reward?.imageUrl}
          onFileChange={setImageFile}
          onFileRemove={() => setRemoveCurrentImage(true)}
        />

        <div className="flex items-center">
          <input
            id="edit-reward-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded-xs"
          />
          <label
            htmlFor="edit-reward-active"
            className="ml-2 block text-sm text-gray-900"
          >
            Activa (Visible para empleados)
          </label>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        <div className="pt-4 flex justify-end space-x-3 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <PencilSquareIcon className="h-4 w-4 mr-1.5" />
            )}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
