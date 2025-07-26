import { useState } from "react";
import { useManageEmployees } from "../../hooks/useManageEmployees";
import { AddEmployeeForm } from "../../components/employees/AddEmployeeForm";
import { EditEmployeeModal } from "../../components/employees/EditEmployeeModal";
import { BulkUploadModal } from "../../components/employees/BulkUploadModal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PencilSquareIcon,
  UserMinusIcon,
  UserPlusIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function ManageEmployees() {
  // Usamos hook personalizado para obtener toda la lógica y el estado.
  const {
    employees,
    engagementScores,
    loading,
    loadingScores,
    error,
    success,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    bulkUploadEmployees,
  } = useManageEmployees();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleToggleClick = async (employee) => {
    const action = employee.isActive ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Realmente quieres ${action} al empleado "${employee.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await toggleEmployeeStatus(employee);
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || `Falló al ${action} el empleado.`,
          "error"
        );
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Administrar Empleados
        </h1>
        <Button onClick={() => setIsBulkModalOpen(true)} variant="secondary">
          <ArrowUpTrayIcon className="h-5 w-5 mr-1.5" />
          Carga Masiva de Empleados
        </Button>
      </div>

      <AddEmployeeForm onAddEmployee={addEmployee} />

      <div className="h-10">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Puntos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Engagement
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase pr-6">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No se encontraron empleados.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.nombre}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {employee.points}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                      {loadingScores ? (
                        <Spinner size="sm" />
                      ) : (
                        engagementScores[employee.id] ?? "-"
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 pr-6">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(employee)}
                      >
                        <PencilSquareIcon className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={employee.isActive ? "danger" : "primary"}
                        onClick={() => handleToggleClick(employee)}
                      >
                        {employee.isActive ? (
                          <UserMinusIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                        )}
                        {employee.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateEmployee}
      />

      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUpload={bulkUploadEmployees}
      />
    </div>
  );
}

export default ManageEmployees;
