import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PencilSquareIcon, CameraIcon } from "@heroicons/react/24/outline";
import { PREDEFINED_TAGS } from "../../utils/constants";

export function EditRewardModal({ reward, isOpen, onClose, onSave }) {
  // State for form fields
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
      setImagePreview(null);
      setRemoveCurrentImage(false);
    }
  }, [reward]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveCurrentImage(false); // A new file overrides the removal flag
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImageClick = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
  };

  const handleTagChange = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const pointsNum = parseInt(points, 10);
    if (!name.trim() || isNaN(pointsNum) || pointsNum <= 0) {
      setError("Please enter a valid name and positive points value.");
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
          stock: stock === "" ? null : parseInt(stock, 10),
          isActive,
          tags,
        },
        imageFile,
        removeCurrentImage
      );
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save changes.");
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
          <Input
            label="Nombre de Recompensa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Puntos Requeridos"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            required
            min="1"
          />
        </div>
        <Input
          label="Cantidad (Vacío = Infinito)"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          min="0"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PREDEFINED_TAGS.map((tag) => (
              <label
                key={tag}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen de Recompensa
          </label>
          <div className="flex items-center space-x-3">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="New preview"
                className="h-16 w-16 object-cover rounded-md border"
              />
            ) : reward.imageUrl && !removeCurrentImage ? (
              <img
                src={reward.imageUrl}
                alt="Current reward"
                className="h-16 w-16 object-cover rounded-md border"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                <CameraIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="flex-grow">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(reward.imageUrl || imagePreview) && !removeCurrentImage && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveImageClick}
                  className="mt-2"
                >
                  Eliminar Imagen
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="edit-reward-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
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
