import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PlusIcon, CameraIcon } from "@heroicons/react/24/outline";

export function AddCompanyForm({ onAddCompany }) {
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [motto, setMotto] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [tertiaryColor, setTertiaryColor] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      await onAddCompany(
        {
          nombre: name,
          motto,
          primaryColor,
          secondaryColor,
          tertiaryColor,
        },
        logoFile
      );
      // Reset form on success
      setName("");
      setLogoFile(null);
      setLogoPreview(null);
      setMotto("");
      setPrimaryColor("");
      setSecondaryColor("");
      setTertiaryColor("");
    } catch (err) {
      setError(err.message || "Failed to add company.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4"
    >
      <h2 className="text-lg font-medium text-gray-700">Add New Company</h2>

      {/* Basic Info */}
      <div>
        <label
          htmlFor="new-company-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Company Name *
        </label>
        <Input
          id="new-company-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter company name..."
          required
          className="mt-0 w-full"
        />
      </div>

      {/* Branding Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Logo Upload */}
        <div>
          <label
            htmlFor="new-logo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Logo (Optional)
          </label>
          <div className="flex items-center space-x-3">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-12 w-12 object-contain rounded border border-gray-300"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                <CameraIcon className="h-6 w-6" />
              </div>
            )}
            <Input
              id="new-logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="mt-0 w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
        {/* Motto */}
        <div>
          <label
            htmlFor="new-motto"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Company Motto (Optional)
          </label>
          <Input
            id="new-motto"
            type="text"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Enter company motto..."
            className="mt-0 w-full"
          />
        </div>
      </div>

      {/* Color Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Colors (Optional - HEX format e.g., #RRGGBB)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              id="new-primary-color"
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="Primary (e.g., #4f46e5)"
              className="mt-0 w-full"
              maxLength={7}
            />
          </div>
          <div>
            <Input
              id="new-secondary-color"
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="Secondary (e.g., #374151)"
              className="mt-0 w-full"
              maxLength={7}
            />
          </div>
          <div>
            <Input
              id="new-tertiary-color"
              type="text"
              value={tertiaryColor}
              onChange={(e) => setTertiaryColor(e.target.value)}
              placeholder="Tertiary (e.g., #d1d5db)"
              className="mt-0 w-full"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isAdding} variant="primary">
          {isAdding ? (
            <Spinner size="sm" color="text-white" className="mr-2" />
          ) : (
            <PlusIcon className="h-5 w-5 mr-1.5" />
          )}
          {isAdding ? "Adding..." : "Add Company"}
        </Button>
      </div>
    </form>
  );
}
