import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export function EditEmployeeModal({ employee, isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setName(employee.nombre || "");
      setIsActive(employee.isActive);
    }
  }, [employee]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del empleado no puede estar vacío.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave(employee.id, { nombre: name, isActive });
      onClose();
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Empleado: ${employee.nombre}`}
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="edit-employee-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre del Empleado
          </label>
          <Input
            id="edit-employee-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="edit-employee-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Correo (Solo lectura)
          </label>
          <Input
            id="edit-employee-email"
            type="email"
            value={employee.email}
            readOnly
            disabled
            className="bg-gray-100 mt-0 w-full cursor-not-allowed"
          />
        </div>
        <div className="flex items-center">
          <input
            id="edit-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded-xs focus:ring-indigo-500"
          />
          <label
            htmlFor="edit-active"
            className="ml-2 block text-sm text-gray-900"
          >
            Activo (El usuario puede iniciar sesión)
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
              <Spinner size="sm" color="text-white" className="mr-2" />
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

export default EditEmployeeModal;
