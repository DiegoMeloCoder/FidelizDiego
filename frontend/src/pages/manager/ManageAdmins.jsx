import { useState, useMemo } from "react";
import { useManageAdmins } from "../../hooks/useManageAdmins";
import { AddAdminModal } from "../../components/admins/AddAdminModal";
import { EditAdminModal } from "../../components/admins/EditAdminModal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PlusIcon,
  PencilSquareIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function ManageAdmins() {
  // Usamos nuestro hook para obtener toda la lógica y el estado.
  const {
    admins,
    companies,
    loading,
    error,
    success,
    addAdmin,
    updateAdmin,
    toggleAdminStatus,
  } = useManageAdmins();

  // Estado local solo para la UI.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Memoizamos el mapa de compañías para evitar recálculos innecesarios
  const companyMap = useMemo(() => {
    return companies.reduce((map, company) => {
      map[company.id] = company.nombre;
      return map;
    }, {});
  }, [companies]);

  // --- Manejadores de Eventos de UI ---
  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleToggleClick = async (admin) => {
    const action = admin.isActive ? "deactivate" : "activate";
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to ${action} the admin "${
        admin.nombre || admin.email
      }"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });

    if (result.isConfirmed) {
      try {
        await toggleAdminStatus(admin);
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || `Failed to ${action} admin.`,
          "error"
        );
      }
    }
  };

  // --- Renderizado ---
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Add New Admin
        </Button>
      </div>

      <div className="h-10">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      <div className="overflow-x-auto border rounded-md">
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase pr-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {admin.nombre}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {companyMap[admin.companyId] || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-2 pr-6">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditClick(admin)}
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={admin.isActive ? "danger" : "primary"}
                      onClick={() => handleToggleClick(admin)}
                    >
                      {admin.isActive ? (
                        <UserMinusIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                      )}
                      {admin.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addAdmin}
        companies={companies}
      />

      <EditAdminModal
        admin={editingAdmin}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateAdmin}
      />
    </div>
  );
}

export default ManageAdmins;
