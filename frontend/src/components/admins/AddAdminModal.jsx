import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PlusIcon } from "@heroicons/react/24/outline";

export function AddAdminModal({ isOpen, onClose, onAdd, companies }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // Pre-select the first company when the modal opens or when the list of companies loads
  useEffect(() => {
    if (isOpen && companies.length > 0 && !companyId) {
      setCompanyId(companies[0].id);
    }
  }, [isOpen, companies, companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !companyId) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      await onAdd({ nombre: name, email, password, companyId });
      onClose(); // Close the modal on success
    } catch (err) {
      setError(err.message || "No se pudo agregar el admin.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setIsAdding(false);
    if (companies.length > 0) {
      setCompanyId(companies[0].id);
    } else {
      setCompanyId("");
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Admin">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new-admin-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <Input
            id="new-admin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="new-admin-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <Input
            id="new-admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="new-admin-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <Input
            id="new-admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="assign-company"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assign to Company
          </label>
          <select
            id="assign-company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {companies.length === 0 ? (
              <option value="" disabled>
                No companies available
              </option>
            ) : (
              companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.nombre}
                </option>
              ))
            )}
          </select>
        </div>
        {error && <Alert type="error">{error}</Alert>}
        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isAdding || companies.length === 0}>
            {isAdding ? (
              <Spinner size="sm" color="text-white" className="mr-2" />
            ) : (
              <PlusIcon className="h-5 w-5 mr-1.5" />
            )}
            {isAdding ? "Adding..." : "Add Admin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
