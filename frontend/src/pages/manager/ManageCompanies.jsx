import { useState, useEffect } from "react";
// Import uploadCompanyLogo as well
import apiClient, { uploadCompanyLogo } from "../../services/api";
import {
  PlusIcon,
  PencilSquareIcon,
  ArchiveBoxXMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import { CameraIcon } from "@heroicons/react/24/solid"; // Icon for placeholder

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  // Add Form State
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newLogoPreview, setNewLogoPreview] = useState(null);
  const [newMotto, setNewMotto] = useState("");
  const [newPrimaryColor, setNewPrimaryColor] = useState("");
  const [newSecondaryColor, setNewSecondaryColor] = useState("");
  const [newTertiaryColor, setNewTertiaryColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);
  const [editMotto, setEditMotto] = useState("");
  const [editPrimaryColor, setEditPrimaryColor] = useState("");
  const [editSecondaryColor, setEditSecondaryColor] = useState("");
  const [editTertiaryColor, setEditTertiaryColor] = useState("");
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Function to clear messages
  const clearMessages = () => {
    setTimeout(() => {
      setAddError("");
      setDeleteError("");
      setListError("");
      setEditError("");
      setSuccessMessage("");
    }, 4000);
  };

  // Fetch companies
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setListError("");
    setSuccessMessage("");
    try {
      const response = await apiClient.get("/companies");
      setCompanies(response.data.data.companies);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setListError(err.message || "Failed to load companies.");
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Add Company
  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      setAddError("Company name cannot be empty.");
      clearMessages();
      return;
    }
    setAdding(true);
    setAddError("");
    setDeleteError("");
    setSuccessMessage("");

    try {
      let uploadedLogoUrl = null;
      // 1. Upload logo if selected
      if (newLogoFile) {
        try {
          // Use the imported uploadCompanyLogo function from api.js
          uploadedLogoUrl = await uploadCompanyLogo(newLogoFile);
        } catch (uploadError) {
          setAddError(`Logo upload failed: ${uploadError.message}`);
          clearMessages();
          setAdding(false);
          return; // Stop if logo upload fails
        }
      }

      // 2. Prepare payload for company creation
      const payload = {
        nombre: newCompanyName.trim(),
        status: "active", // Default status on creation
        logoUrl: uploadedLogoUrl,
        motto: newMotto || null, // Send null if empty
        primaryColor: newPrimaryColor || null,
        secondaryColor: newSecondaryColor || null,
        tertiaryColor: newTertiaryColor || null,
      };

      // 3. Call API to create company
      const response = await apiClient.post("/companies", payload);
      const addedCompany = response.data.data; // API returns the created company

      // 4. Update state and reset form
      setCompanies((prev) => [...prev, addedCompany]);
      setNewCompanyName("");
      setNewLogoFile(null);
      setNewLogoPreview(null);
      setNewMotto("");
      setNewPrimaryColor("");
      setNewSecondaryColor("");
      setNewTertiaryColor("");
      setSuccessMessage(`Company "${addedCompany.nombre}" added successfully.`);
      clearMessages();
    } catch (err) {
      console.error("Error adding company:", err);
      // Use detailed message from interceptor if available
      setAddError(err.message || "Failed to add company.");
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Company - Open Modal
  const handleEditClick = (company) => {
    setEditingCompany(company);
    setEditName(company.nombre);
    setEditStatus(company.status || "active");
    setEditMotto(company.motto || "");
    setEditPrimaryColor(company.primaryColor || "");
    setEditSecondaryColor(company.secondaryColor || "");
    setEditTertiaryColor(company.tertiaryColor || "");
    setEditLogoFile(null);
    setEditLogoPreview(null);
    setRemoveCurrentLogo(false);
    setEditError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Edit Company - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCompany) {
      setEditError("Company name cannot be empty.");
      clearMessages();
      return;
    }
    setSaving(true);
    setEditError("");
    setListError("");
    setSuccessMessage("");

    try {
      let logoUrlPayload; // Undefined initially means no change to logoUrl

      // 1. Upload new logo if selected
      if (editLogoFile) {
        try {
          // Use the imported uploadCompanyLogo function from api.js
          logoUrlPayload = await uploadCompanyLogo(editLogoFile);
        } catch (uploadError) {
          setEditError(`Logo upload failed: ${uploadError.message}`);
          clearMessages();
          setSaving(false);
          return; // Stop if upload fails
        }
      } else if (removeCurrentLogo) {
        // 2. If user explicitly clicked "Remove Logo"
        logoUrlPayload = null; // Explicitly set to null for removal
      }
      // If logoUrlPayload remains undefined, the backend won't update the image field

      // 3. Prepare update payload
      const updatePayload = {
        nombre: editName.trim(),
        status: editStatus,
        motto: editMotto || null, // Send null if empty
        primaryColor: editPrimaryColor || null,
        secondaryColor: editSecondaryColor || null,
        tertiaryColor: editTertiaryColor || null,
      };

      // Only include logoUrl in payload if it needs changing
      if (logoUrlPayload !== undefined) {
        updatePayload.logoUrl = logoUrlPayload;
      }

      // 4. Call API to update company
      const response = await apiClient.put(
        `/companies/${editingCompany.id}`,
        updatePayload
      );
      const updatedCompany = response.data.data; // API returns the updated company

      // 5. Update state and close modal
      setCompanies((prev) =>
        prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
      );
      closeModal();
      setSuccessMessage(
        `Company "${updatedCompany.nombre}" updated successfully.`
      );
      clearMessages();
    } catch (err) {
      console.error("Error updating company:", err);
      // Use detailed message from interceptor if available
      setEditError(err.message || "Failed to update company.");
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Delete Company (Logical Delete - No changes needed)
  const handleDeleteClick = async (companyId, companyName) => {
    if (
      window.confirm(
        `Are you sure you want to set company "${companyName}" to inactive? This is a logical delete.`
      )
    ) {
      setDeleteError("");
      setListError("");
      setSuccessMessage("");
      try {
        const response = await apiClient.patch(
          `/companies/${companyId}/toggle-status`
        );
        const updatedCompany = response.data.data.company;
        setCompanies((prev) =>
          prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
        );
        setSuccessMessage(response.data.data.message);
        clearMessages();
      } catch (err) {
        console.error("Error setting company inactive:", err);
        setDeleteError(
          err.message || `Failed to set company "${companyName}" to inactive.`
        );
        clearMessages();
      }
    }
  };

  // Activate Company (No changes needed)
  const handleActivateClick = async (companyId, companyName) => {
    if (
      window.confirm(
        `Are you sure you want to set company "${companyName}" back to active?`
      )
    ) {
      setDeleteError("");
      setListError("");
      setSuccessMessage("");
      try {
        const response = await apiClient.patch(
          `/companies/${companyId}/toggle-status`
        );
        const updatedCompany = response.data.data.company;
        setCompanies((prev) =>
          prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
        );
        setSuccessMessage(response.data.data.message);
        clearMessages();
      } catch (err) {
        console.error("Error setting company active:", err);
        setDeleteError(
          err.message || `Failed to set company "${companyName}" to active.`
        );
        clearMessages();
      }
    }
  };

  // Close Modal (Reset branding fields)
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setEditName("");
    setEditStatus("active");
    setEditMotto("");
    setEditPrimaryColor("");
    setEditSecondaryColor("");
    setEditTertiaryColor("");
    setEditLogoFile(null);
    setEditLogoPreview(null);
    setRemoveCurrentLogo(false);
  };

  // --- Handlers for Logo Input ---
  const handleNewLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewLogoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setNewLogoFile(null);
      setNewLogoPreview(null);
    }
  };

  const handleEditLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditLogoFile(file);
      setRemoveCurrentLogo(false);
      const reader = new FileReader();
      reader.onloadend = () => setEditLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogoClick = () => {
    setEditLogoFile(null);
    setEditLogoPreview(null);
    setRemoveCurrentLogo(true);
  };
  // --- End Logo Handlers ---

  // Define Tailwind classes for table cells - Apply brand colors
  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider bg-gray-50"; // Use brand-secondary for header text
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm"; // Keep td text default for now

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      {/* Apply brand-secondary to page title */}
      <h1 className="text-3xl font-bold text-brand-secondary">
        Manage Companies
      </h1>

      {/* Add Company Form - Updated Layout */}
      <form
        onSubmit={handleAddCompany}
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
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
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
              {newLogoPreview ? (
                <img
                  src={newLogoPreview}
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
                onChange={handleNewLogoChange}
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
              value={newMotto}
              onChange={(e) => setNewMotto(e.target.value)}
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
                value={newPrimaryColor}
                onChange={(e) => setNewPrimaryColor(e.target.value)}
                placeholder="Primary (e.g., #FFFFFF)"
                className="mt-0 w-full"
                maxLength={7}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sugerencia: Color claro para fondos/texto.
              </p>
            </div>
            <div>
              <Input
                id="new-secondary-color"
                type="text"
                value={newSecondaryColor}
                onChange={(e) => setNewSecondaryColor(e.target.value)}
                placeholder="Secondary (e.g., #333333)"
                className="mt-0 w-full"
                maxLength={7}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sugerencia: Color oscuro para texto/acentos.
              </p>
            </div>
            <div>
              <Input
                id="new-tertiary-color"
                type="text"
                value={newTertiaryColor}
                onChange={(e) => setNewTertiaryColor(e.target.value)}
                placeholder="Tertiary (e.g., #AABBCC)"
                className="mt-0 w-full"
                maxLength={7}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sugerencia: Color de acento para bordes/iconos.
              </p>
            </div>
          </div>
        </div>

        {addError && <Alert type="error">{addError}</Alert>}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={adding}
            variant="primary"
            className="inline-flex items-center"
          >
            {adding ? (
              <Spinner size="sm" color="text-white" className="mr-2" />
            ) : (
              <PlusIcon className="h-5 w-5 mr-1.5" />
            )}
            {adding ? "Adding..." : "Add Company"}
          </Button>
        </div>
      </form>

      {/* Display feedback messages */}
      <div className="space-y-3">
        {addError && <Alert type="error">{addError}</Alert>}
        {deleteError && <Alert type="error">{deleteError}</Alert>}
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Companies List - Updated Table - Apply brand-tertiary to borders */}
      <div className="overflow-x-auto border border-brand-tertiary rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-brand-tertiary">
            <thead>
              <tr>
                <th className={thStyle}>Logo</th>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Status</th>
                <th className={thStyle}>ID</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No companies found.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className={tdStyle}>
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={`${company.nombre} logo`}
                          className="h-10 w-10 object-contain rounded border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <CameraIcon className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {company.nombre}
                    </td>
                    <td className={tdStyle}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          company.status === "active"
                            ? "bg-green-100 text-green-800"
                            : company.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : company.status === "pending_payment"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {company.status.replace("_", " ")}
                      </span>
                    </td>
                    <td
                      className={`${tdStyle} text-gray-500 font-mono text-xs`}
                    >
                      {company.id}
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(company)}
                        className="inline-flex items-center"
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {company.status === "active" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDeleteClick(company.id, company.nombre)
                          }
                          className="inline-flex items-center"
                        >
                          <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" /> Set
                          Inactive
                        </Button>
                      )}
                      {company.status === "inactive" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleActivateClick(company.id, company.nombre)
                          }
                          className="inline-flex items-center"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" /> Set Active
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal - Updated Structure */}
      {isModalOpen && editingCompany && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Edit Company: ${editingCompany.nombre}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
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
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
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
                value={editMotto}
                onChange={(e) => setEditMotto(e.target.value)}
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
                {/* Preview or Current */}
                {editLogoPreview ? (
                  <img
                    src={editLogoPreview}
                    alt="New logo preview"
                    className="h-12 w-12 object-contain rounded border border-gray-300"
                  />
                ) : editingCompany.logoUrl && !removeCurrentLogo ? (
                  <img
                    src={editingCompany.logoUrl}
                    alt="Current logo"
                    className="h-12 w-12 object-contain rounded border border-gray-300"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                    <CameraIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-grow">
                  <Input
                    id="edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleEditLogoChange}
                    className="mt-0 w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {/* Remove Logo Button */}
                  {(editingCompany.logoUrl || editLogoPreview) &&
                    !removeCurrentLogo && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleRemoveLogoClick}
                        className="mt-1 text-red-600 hover:text-red-800"
                      >
                        Remove Logo
                      </Button>
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
                <div>
                  <Input
                    id="edit-primary-color"
                    type="text"
                    value={editPrimaryColor}
                    onChange={(e) => setEditPrimaryColor(e.target.value)}
                    placeholder="Primary (e.g., #FFFFFF)"
                    className="mt-0 w-full"
                    maxLength={7}
                  />
                </div>
                <div>
                  <Input
                    id="edit-secondary-color"
                    type="text"
                    value={editSecondaryColor}
                    onChange={(e) => setEditSecondaryColor(e.target.value)}
                    placeholder="Secondary (e.g., #333333)"
                    className="mt-0 w-full"
                    maxLength={7}
                  />
                </div>
                <div>
                  <Input
                    id="edit-tertiary-color"
                    type="text"
                    value={editTertiaryColor}
                    onChange={(e) => setEditTertiaryColor(e.target.value)}
                    placeholder="Tertiary (e.g., #AABBCC)"
                    className="mt-0 w-full"
                    maxLength={7}
                  />
                </div>
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
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending_payment">Pending Payment</option>
              </select>
            </div>
            {/* Error Alert */}
            {editError && <Alert type="error">{editError}</Alert>}
            {/* Action Buttons */}
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="inline-flex items-center"
              >
                {saving ? (
                  <Spinner size="sm" color="text-white" className="mr-2" />
                ) : (
                  <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageCompanies;
