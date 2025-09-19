import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PencilSquareIcon, CameraIcon } from "@heroicons/react/24/outline";

export function EditCompanyModal({ company, isOpen, onClose, onSave }) {
  // Estado interno del formulario del modal
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [motto, setMotto] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [tertiaryColor, setTertiaryColor] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Populate form when a company is selected for editing
  useEffect(() => {
    if (company) {
      setName(company.nombre || "");
      setStatus(company.status || "active");
      setMotto(company.motto || "");
      setPrimaryColor(company.primaryColor || "");
      setSecondaryColor(company.secondaryColor || "");
      setTertiaryColor(company.tertiaryColor || "");
      // Reset logo-related state
      setLogoFile(null);
      setLogoPreview(null);
      setRemoveCurrentLogo(false);
    }
  }, [company]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setRemoveCurrentLogo(false);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogoClick = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveCurrentLogo(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company name cannot be empty.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave(
        company.id,
        {
          nombre: name,
          status,
          motto,
          primaryColor,
          secondaryColor,
          tertiaryColor,
        },
        logoFile,
        removeCurrentLogo
      );
      onClose(); // Cierra el modal en caso de éxito
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Company: ${company?.nombre}`}
      size="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Name */}
        <div>
          <label
            htmlFor="edit-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Name
          </label>
          <Input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-0 w-full"
          />
        </div>
        {/* Motto */}
        <div>
          <label
            htmlFor="edit-motto"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Motto (Optional)
          </label>
          <Input
            id="edit-motto"
            type="text"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Enter company motto..."
            className="mt-0 w-full"
          />
        </div>
        {/* Logo */}
        <div>
          <label
            htmlFor="edit-logo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Logo (Optional)
          </label>
          <div className="flex items-center space-x-3">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="New logo preview"
                className="h-12 w-12 object-contain rounded-xs border border-gray-300"
              />
            ) : company.logoUrl && !removeCurrentLogo ? (
              <img
                src={company.logoUrl}
                alt="Current logo"
                className="h-12 w-12 object-contain rounded-xs border border-gray-300"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-200 rounded-xs flex items-center justify-center text-gray-400">
                <CameraIcon className="h-6 w-6" />
              </div>
            )}
            <div className="grow">
              <Input
                id="edit-logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mt-0 w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {(company.logoUrl || logoPreview) && !removeCurrentLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogoClick}
                  className="mt-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Logo
                </button>
              )}
              {removeCurrentLogo && (
                <span className="mt-1 text-sm text-red-600">
                  Logo will be removed on save.
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Colors (Optional - HEX)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="edit-primary-color"
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="Primary (e.g., #FFFFFF)"
              className="mt-0 w-full"
              maxLength={7}
            />
            <Input
              id="edit-secondary-color"
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="Secondary (e.g., #333333)"
              className="mt-0 w-full"
              maxLength={7}
            />
            <Input
              id="edit-tertiary-color"
              type="text"
              value={tertiaryColor}
              onChange={(e) => setTertiaryColor(e.target.value)}
              placeholder="Tertiary (e.g., #AABBCC)"
              className="mt-0 w-full"
              maxLength={7}
            />
          </div>
        </div>
        {/* Status */}
        <div>
          <label
            htmlFor="edit-status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-xs focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_payment">Pending Payment</option>
          </select>
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
