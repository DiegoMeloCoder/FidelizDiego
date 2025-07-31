import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export function EditAdminModal({ admin, isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (admin) {
      setName(admin.nombre || "");
      setIsActive(admin.isActive);
    }
  }, [admin]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Admin name cannot be empty.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave(admin.id, { nombre: name, isActive });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Do not render anything if the modal is not open or no admin is selected
  if (!isOpen || !admin) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Admin: ${admin.nombre || admin.email}`}
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="edit-admin-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Admin Name
          </label>
          <Input
            id="edit-admin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="edit-admin-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email (Read-only)
          </label>
          <Input
            id="edit-admin-email"
            type="email"
            value={admin.email}
            readOnly
            disabled
            className="bg-gray-100 mt-0 w-full cursor-not-allowed"
          />
        </div>
        <div className="flex items-center">
          <input
            id="edit-admin-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="edit-admin-active"
            className="ml-2 block text-sm text-gray-900"
          >
            Active (User can log in)
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
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Spinner size="sm" color="text-white" className="mr-2" />
            ) : (
              <PencilSquareIcon className="h-4 w-4 mr-1.5" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditAdminModal;
