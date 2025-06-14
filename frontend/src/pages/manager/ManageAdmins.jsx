import { useState, useEffect } from "react";
// Firestore and secondary Firebase app imports removed
import apiClient from "../../services/api"; // Import API client
// useAuth might not be needed if manager role is confirmed by backend middleware
// import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PlusIcon,
  PencilSquareIcon,
  UserMinusIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline"; // Icons

function ManageAdmins() {
  // const { currentUser } = useAuth(); // Might not be needed
  const [admins, setAdmins] = useState([]);
  const [companies, setCompanies] = useState([]); // Need companies to assign admins
  const [companyMap, setCompanyMap] = useState({}); // For easy lookup of company names
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(""); // Company to assign admin to
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  // Maybe add company change later if needed
  // const [editCompanyId, setEditCompanyId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Function to clear messages
  const clearMessages = () => {
    setTimeout(() => {
      setAddError("");
      setListError("");
      setEditError("");
      setSuccessMessage("");
    }, 4000);
  };

  // Fetch Admins and Companies
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setListError("");
      setSuccessMessage("");
      try {
        // Fetch Companies using API
        const companyResponse = await apiClient.get("/companies");
        const companyList = companyResponse.data.data.companies;
        setCompanies(companyList);
        const cMap = companyList.reduce((map, company) => {
          map[company.id] = company.nombre; // Use 'nombre' from backend model
          return map;
        }, {});
        setCompanyMap(cMap);
        if (companyList.length > 0) {
          setSelectedCompanyId(companyList[0].id);
        }

        // Fetch Admins using API
        const adminResponse = await apiClient.get("/admins");
        // Ensure isActive defaults to true if missing (though backend should provide it)
        const adminList = adminResponse.data.data.admins.map((admin) => ({
          ...admin,
          isActive: admin.isActive !== undefined ? admin.isActive : true,
        }));
        setAdmins(adminList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setListError(err.message || "Failed to load admins or companies.");
        clearMessages();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Handlers for Add/Edit/Toggle ---

  // Add Admin Handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (
      !newAdminName.trim() ||
      !newAdminEmail.trim() ||
      !newAdminPassword.trim() ||
      !selectedCompanyId
    ) {
      setAddError("Please fill in all fields and select a company.");
      clearMessages();
      return;
    }
    setAdding(true);
    setAddError("");
    setListError("");
    setSuccessMessage("");

    try {
      // Call backend API to create admin (handles both Auth and DB)
      const response = await apiClient.post("/admins", {
        email: newAdminEmail,
        password: newAdminPassword,
        nombre: newAdminName.trim(),
        companyId: selectedCompanyId,
      });
      console.log(response.data.data.user);
      const addedAdmin = response.data.data.user; // API returns the created admin profile

      // Update local state
      setAdmins((prev) => [...prev, addedAdmin]);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setSelectedCompanyId(companies.length > 0 ? companies[0].id : "");
      closeAddModal();
      setSuccessMessage(
        `Admin ${
          addedAdmin.nombre || addedAdmin.email
        } added successfully and assigned to ${companyMap[selectedCompanyId]}.`
      );
      clearMessages();
    } catch (err) {
      console.error("Error adding admin:", err);
      // Use error message from API response if available
      setAddError(
        err.message || "Failed to add admin. Check console for details."
      );
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Admin - Open Modal
  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditName(admin.nombre || ""); // <--- Corregido
    setEditIsActive(admin.isActive);
    // setEditCompanyId(admin.companyId); // For company change later
    setEditError("");
    setSuccessMessage("");
    setIsEditModalOpen(true);
  };

  // Edit Admin - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingAdmin) {
      setEditError("Admin name cannot be empty.");
      clearMessages();
      return;
    }
    setSaving(true);
    setEditError("");
    setListError("");
    setSuccessMessage("");
    try {
      // Call backend API to update admin (handles both Auth and DB)
      const response = await apiClient.put(`/admins/${editingAdmin.id}`, {
        nombre: editName.trim(),
        isActive: editIsActive,
      });
      console.log(response.data.data.user);
      const updatedAdmin = response.data.data.user; // API returns the updated admin profile

      // Update local state
      // Asegurarse de que el objeto actualizado tenga 'nombre'
      const finalUpdatedAdmin = {
        ...updatedAdmin,
        nombre: updatedAdmin.nombre || "",
      };
      setAdmins((prev) =>
        prev.map((adm) =>
          adm.id === finalUpdatedAdmin.id ? finalUpdatedAdmin : adm
        )
      );
      closeEditModal();
      setSuccessMessage(
        `Admin "${
          finalUpdatedAdmin.nombre || finalUpdatedAdmin.email
        }" updated successfully.`
      );
      clearMessages();
    } catch (err) {
      console.error("Error updating admin:", err);
      setEditError(err.message || "Failed to update admin.");
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (admin) => {
    const newState = !admin.isActive;
    const action = newState ? "activate" : "deactivate";
    if (
      window.confirm(
        `Are you sure you want to ${action} admin "${
          admin.nombre || admin.email
        }"?`
      )
    ) {
      // <--- Corregido
      setListError("");
      setSuccessMessage("");
      try {
        // Call backend API to toggle status (handles both Auth and DB)
        const response = await apiClient.patch(
          `/admins/${admin.id}/toggle-status`
        );
        const updatedAdmin = response.data.data.admin; // API returns the updated admin

        // Update local state
        setAdmins((prev) =>
          prev.map((adm) => (adm.id === updatedAdmin.id ? updatedAdmin : adm))
        );
        setSuccessMessage(response.data.message); // Use message from API
        clearMessages();
      } catch (err) {
        console.error(`Error ${action}ing admin:`, err);
        setListError(err.message || `Failed to ${action} admin.`);
        clearMessages();
      }
    }
  };

  // Modal close handlers
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAdmin(null);
    setEditName("");
    setEditIsActive(true);
  };

  // --- Render Logic ---
  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 whitespace-nowrap text-sm";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          className="w-full sm:w-auto inline-flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Add New Admin
        </Button>
      </div>

      {/* Feedback Messages */}
      <div className="space-y-3">
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Admins List */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Name</th>
                <th className={thStyle}>Email</th>
                <th className={thStyle}>Company</th>
                <th className={thStyle}>Status</th>
                <th className={`${thStyle} text-right pr-6`}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No Admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className={`${tdStyle} font-medium text-gray-900`}>
                      {admin.nombre || (
                        <span className="text-gray-400 italic">No Name</span>
                      )}
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>
                      {admin.email}
                    </td>
                    <td className={`${tdStyle} text-gray-500`}>
                      {companyMap[admin.companyId] || (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className={tdStyle}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          admin.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(admin)}
                        className="inline-flex items-center"
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {admin.isActive ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleToggleActive(admin)}
                          className="inline-flex items-center"
                        >
                          <UserMinusIcon className="h-4 w-4 mr-1" /> Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleToggleActive(admin)}
                          className="inline-flex items-center"
                        >
                          <UserPlusIcon className="h-4 w-4 mr-1" /> Activate
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

      {/* Add Admin Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add New Admin"
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
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
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
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
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
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
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
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
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              required
              className="block w-full px-3 py-2 mt-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {companies.length === 0 && (
                <option value="" disabled>
                  No companies available
                </option>
              )}
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.nombre}
                </option> // <--- Corregido
              ))}
            </select>
          </div>
          {addError && <Alert type="error">{addError}</Alert>}
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeAddModal}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={adding || companies.length === 0}
              className="inline-flex items-center"
            >
              {adding ? (
                <Spinner size="sm" color="text-white" className="mr-2" />
              ) : (
                <PlusIcon className="h-5 w-5 mr-1.5" />
              )}
              {adding ? "Adding..." : "Add Admin"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Admin Modal */}
      {isEditModalOpen && editingAdmin && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          title={`Edit Admin: ${editingAdmin.nombre || editingAdmin.email}`}
        >
          {" "}
          {/* <--- Corregido */}
          <form onSubmit={handleSaveEdit} className="space-y-4">
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
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
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
                value={editingAdmin.email}
                readOnly
                disabled
                className="bg-gray-100 mt-0 w-full cursor-not-allowed"
              />
            </div>
            {/* TODO: Add Company Change Dropdown if needed */}
            <div>
              <label
                htmlFor="edit-admin-active"
                className="flex items-center cursor-pointer"
              >
                <input
                  id="edit-admin-active"
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Active (User can log in)
                </span>
              </label>
            </div>
            {editError && <Alert type="error">{editError}</Alert>}
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeEditModal}
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

export default ManageAdmins;
