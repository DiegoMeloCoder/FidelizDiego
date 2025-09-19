import { useState } from "react";
import { useManageCompanies } from "../../hooks/useManageCompanies";
import { AddCompanyForm } from "../../components/companies/AddCompanyForm";
import { EditCompanyModal } from "../../components/companies/EditCompanyModal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PencilSquareIcon,
  ArchiveBoxXMarkIcon,
  ArrowPathIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function ManageCompanies() {
  // --- LÓGICA Y ESTADO ---
  // 1. Usamos nuestro hook personalizado para obtener toda la lógica de negocio y el estado de los datos.
  const {
    companies,
    loading,
    error,
    success,
    addCompany,
    updateCompany,
    toggleCompanyStatus,
  } = useManageCompanies();

  // 2. Estado local que solo pertenece a la UI de esta página:
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // --- MANEJADORES DE EVENTOS DE UI ---
  const handleEditClick = (company) => {
    setEditingCompany(company);
    setIsEditModalOpen(true);
  };

  const handleToggleClick = async (company) => {
    const action = company.status === "active" ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Realmente quieres ${action} la compañía "${
        company.nombre
      }"? Los usuarios asociados también serán ${action.slice(0, -1)}dos.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await toggleCompanyStatus(company);
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || `Falló al ${action} la compañía.`,
          "error"
        );
      }
    }
  };

  // --- RENDERIZADO ---
  // 3. El componente principal ahora solo se preocupa de RENDERIZAR la UI
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-brand-secondary">
        Manage Companies
      </h1>

      {/* Componente del Formulario de Creación */}
      <AddCompanyForm onAddCompany={addCompany} />

      {/* Mensajes de Feedback Globales */}
      <div className="space-y-3 h-10">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      {/* Tabla de Compañías */}
      <div className="overflow-x-auto border border-brand-tertiary rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-brand-tertiary">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-secondary uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-brand-secondary uppercase tracking-wider pr-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 whitespace-nowrap text-sm text-center text-gray-500 py-6"
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={`${company.nombre} logo`}
                          className="h-10 w-10 object-contain rounded-xs border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-100 rounded-xs flex items-center justify-center text-gray-400">
                          <CameraIcon className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {company.nombre}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono ">
                      {company.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right space-x-2 pr-6">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(company)}
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          company.status === "active" ? "danger" : "primary"
                        }
                        onClick={() => handleToggleClick(company)}
                      >
                        {company.status === "active" ? (
                          <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                        )}
                        {company.status === "active"
                          ? "Set Inactive"
                          : "Set Active"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Componente del Modal de Edición */}
      <EditCompanyModal
        company={editingCompany}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateCompany}
      />
    </div>
  );
}

export default ManageCompanies;
