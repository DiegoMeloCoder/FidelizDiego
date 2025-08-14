import { useState } from "react";
import { useManageJustifications } from "../../hooks/useManageJustifications";
import { AddJustificationForm } from "../../components/justifications/AddJustificationForm";
import { EditJustificationModal } from "../../components/justifications/EditJustificationModal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function ManageJustifications() {
  const {
    justifications,
    loading,
    error,
    success,
    addJustification,
    updateJustification,
    toggleJustificationStatus,
    adminCompanyId,
  } = useManageJustifications();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJustification, setEditingJustification] = useState(null);

  const handleEditClick = (justification) => {
    if (
      justification.esPredeterminada ||
      justification.companyId !== adminCompanyId
    ) {
      Swal.fire(
        "Acción no permitida",
        "Las justificaciones globales o predeterminadas no se pueden editar aquí.",
        "warning"
      );
      return;
    }
    setEditingJustification(justification);
    setIsEditModalOpen(true);
  };

  const handleToggleClick = async (justification) => {
    if (
      justification.esPredeterminada ||
      justification.companyId !== adminCompanyId
    ) {
      Swal.fire(
        "Acción no permitida",
        "El estado de las justificaciones globales no se puede cambiar.",
        "warning"
      );
      return;
    }
    const action = justification.estaActiva ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Realmente quieres ${action} la justificación: "${justification.textoJustificacion}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "No, cancelar",
    });

    if (result.isConfirmed) {
      try {
        await toggleJustificationStatus(justification);
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || `No se pudo ${action} la justificación.`,
          "error"
        );
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <DocumentMagnifyingGlassIcon className="h-7 w-7 mr-2 text-cyan-600" />
        Administrar Justificaciones de Puntos
      </h1>

      <AddJustificationForm onAdd={addJustification} />

      <div className="h-10">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Texto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
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
              {justifications.map((justification) => {
                const isCompanySpecific =
                  !justification.esPredeterminada &&
                  justification.companyId === adminCompanyId;
                return (
                  <tr key={justification.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {justification.textoJustificacion}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isCompanySpecific
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {isCompanySpecific ? "Empresa" : "Global"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          justification.estaActiva
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {justification.estaActiva ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm space-x-2 pr-6">
                      {isCompanySpecific ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditClick(justification)}
                          >
                            <PencilSquareIcon className="h-4 w-4 mr-1" /> Editar
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              justification.estaActiva ? "danger" : "primary"
                            }
                            onClick={() => handleToggleClick(justification)}
                          >
                            {justification.estaActiva ? (
                              <XCircleIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                            )}
                            {justification.estaActiva
                              ? "Desactivar"
                              : "Activar"}
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          N/A (Global)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <EditJustificationModal
        justification={editingJustification}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateJustification}
      />
    </div>
  );
}

export default ManageJustifications;
