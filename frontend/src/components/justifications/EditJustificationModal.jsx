import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export function EditJustificationModal({
  justification,
  isOpen,
  onClose,
  onSave,
}) {
  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // This effect runs when the 'justification' prop changes,
  // populating the form with the data of the selected justification.
  useEffect(() => {
    if (justification) {
      setText(justification.textoJustificacion || "");
      setIsActive(justification.estaActiva);
    }
  }, [justification]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("El texto de la justificación no puede estar vacío.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      // Call the onSave function passed down from the parent page
      await onSave(justification.id, {
        textoJustificacion: text,
        estaActiva: isActive,
      });
      onClose(); // Close the modal on successful save
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  // Do not render anything if the modal is not open or no justification is selected
  if (!isOpen || !justification) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Justificación">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="edit-justification-text"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Texto de la Justificación
          </label>
          <Input
            id="edit-justification-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center">
          <input
            id="edit-active-justification"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded-xs"
          />
          <label
            htmlFor="edit-active-justification"
            className="ml-2 block text-sm text-gray-900"
          >
            Activa (Puede ser seleccionada)
          </label>
        </div>
        {error && <Alert type="error">{error}</Alert>}
        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
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
