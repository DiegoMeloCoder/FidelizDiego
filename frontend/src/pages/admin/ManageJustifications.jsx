import { useState, useEffect } from "react";
// Firestore imports removed
import apiClient from "../../services/api"; // Import API client
import { useAuth } from "../../contexts/AuthContext.jsx"; // Keep useAuth for companyId check
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PlusIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline"; // Icons

function ManageJustifications() {
  const { userData } = useAuth();
  const [justifications, setJustifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add Form State
  const [newJustificationText, setNewJustificationText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJustification, setEditingJustification] = useState(null);
  const [editText, setEditText] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Function to clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setAddError("");
      setListError("");
      setEditError("");
      setSuccessMessage("");
    }, 4000);
  };

  // Fetch justifications
  useEffect(() => {
    if (userData?.company?.id) {
      // Fetch only if ID is available
      fetchJustifications();
    } else if (userData !== null) {
      setListError(
        "La información de la empresa del administrador no está disponible."
      );
      setLoading(false);
    }
    // If userData is null (still loading initial profile), loading remains true
  }, [userData?.company?.id]); // <-- Use nested ID

  const fetchJustifications = async () => {
    setLoading(true);
    setListError("");
    setSuccessMessage("");
    try {
      // Fetch justifications using API (backend handles filtering and sorting)
      const response = await apiClient.get("/justifications");
      const list = response.data.map((j) => ({
        ...j,
        estaActiva: j.estaActiva !== undefined ? j.estaActiva : true,
      }));
      setJustifications(list);
    } catch (err) {
      console.error("Error fetching justifications:", err);
      setListError(err.message || "No se pudieron cargar las justificaciones.");
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Add Justification
  const handleAddJustification = async (e) => {
    e.preventDefault();
    if (!newJustificationText.trim()) {
      setAddError("El texto de la justificación no puede estar vacío.");
      clearMessages();
      return;
    }
    // Backend uses the authenticated admin's company ID
    // if (!userData?.company?.id) { // <-- Use nested ID
    //   setAddError("Cannot add justification: Admin's company ID is missing."); clearMessages(); return;
    // }
    setAdding(true);
    setAddError("");
    setListError("");
    setSuccessMessage("");
    try {
      setNewJustificationText("");
      setSuccessMessage("Justificación agregada exitosamente.");
      fetchJustifications();
      clearMessages();
    } catch (err) {
      console.error("Error adding justification:", err);
      setAddError(err.message || "No se pudo agregar la justificación.");
      clearMessages();
    } finally {
      setAdding(false);
    }
  };

  // Edit Justification - Open Modal
  const handleEditClick = (justification) => {
    // Backend handles preventing edit of global, but we can keep the UI check
    // Use nested ID for comparison
    if (
      justification.companyId !== userData?.company?.id ||
      justification.esPredeterminada
    ) {
      setEditError(
        "No se pueden editar justificaciones predeterminadas o globales."
      );
      clearMessages();
      return;
    }
    setEditingJustification(justification);
    setEditText(justification.textoJustificacion);
    setEditIsActive(
      justification.estaActiva !== undefined ? justification.estaActiva : true
    );
    setEditError("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  // Edit Justification - Save Changes
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || !editingJustification) {
      setEditError("El texto de la justificación no puede estar vacío.");
      clearMessages();
      return;
    }
    if (
      editingJustification.companyId !== userData?.company?.id ||
      editingJustification.esPredeterminada
    ) {
      setEditError(
        "No se pueden guardar cambios en una justificación predeterminada o global."
      );
      clearMessages();
      return;
    }
    setSaving(true);
    setEditError("");
    setListError("");
    setSuccessMessage("");
    try {
      const response = await apiClient.put(
        `/justifications/${editingJustification.id}`,
        {
          textoJustificacion: editText.trim(),
          estaActiva: editIsActive,
        }
      );
      const updatedJustification = response.data; // API returns updated justification

      // Update local state
      setJustifications((prev) =>
        prev.map((j) =>
          j.id === updatedJustification.id ? updatedJustification : j
        )
      );
      closeModal();
      setSuccessMessage("Justificación actualizada exitosamente.");
      clearMessages();
    } catch (err) {
      console.error("Error updating justification:", err);
      setEditError(err.message || "No se pudo actualizar la justificación.");
      clearMessages();
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active Status (Activate/Deactivate)
  const handleToggleActive = async (justification) => {
    if (
      justification.companyId !== userData?.company?.id ||
      justification.esPredeterminada
    ) {
      setListError(
        "No se pueden activar/desactivar justificaciones predeterminadas o globales aquí."
      );
      clearMessages();
      return;
    }
    const newState = !(justification.estaActiva !== false);
    const action = newState ? "activar" : "desactivar";
    if (
      window.confirm(
        `¿Estás seguro de que deseas ${action} la justificación: "${justification.textoJustificacion}"?`
      )
    ) {
      setListError("");
      setSuccessMessage("");
      try {
        const response = await apiClient.patch(
          `/justifications/${justification.id}/toggle-status`
        );
        const updatedJustification = response.data.justification;
        setJustifications((prev) =>
          prev.map((j) =>
            j.id === updatedJustification.id ? updatedJustification : j
          )
        );
        setSuccessMessage(response.data.message);
        clearMessages();
      } catch (err) {
        console.error(`Error ${action}ing justification:`, err);
        setListError(err.message || `No se pudo ${action} la justificación.`);
        clearMessages();
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJustification(null);
    setEditText("");
    setEditIsActive(true);
  };

  // Define Tailwind classes for table cells
  const thStyle =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50";
  const tdStyle = "px-4 py-4 text-sm"; // Removed whitespace-nowrap for description

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center">
        <DocumentMagnifyingGlassIcon className="h-7 w-7 mr-2 text-cyan-600" />
        Administrar Justificaciones de Puntos
      </h1>

      {/* Add Justification Form */}
      <form
        onSubmit={handleAddJustification}
        className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-3"
      >
        <h2 className="text-lg font-medium text-gray-700">
          Agregar Nueva Justificación de la Empresa
        </h2>
        <div>
          <label
            htmlFor="new-justification-text"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Texto de la Justificación
          </label>
          <Input
            id="new-justification-text"
            type="text"
            value={newJustificationText}
            onChange={(e) => setNewJustificationText(e.target.value)}
            placeholder="ej: Superó la Meta de Ventas del Q1"
            required
            className="mt-0 w-full"
          />
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
            {adding ? "Agregando..." : "Agregar Justificación"}
          </Button>
        </div>
      </form>

      {/* Display feedback messages */}
      <div className="space-y-3">
        {listError && <Alert type="error">{listError}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}
      </div>

      {/* Justifications List */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={thStyle}>Texto de la Justificación</th>
                <th className={thStyle}>Tipo</th>
                <th className={thStyle}>Estado</th>
                <th className={`${thStyle} text-right pr-6`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {justifications.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className={`${tdStyle} text-center text-gray-500 py-6`}
                  >
                    No se encontraron justificaciones. Agregue justificaciones
                    específicas de la empresa arriba.
                  </td>
                </tr>
              ) : (
                justifications.map((justification) => {
                  // Use nested ID for comparison
                  const isCompanySpecific =
                    justification.companyId === userData?.company?.id &&
                    !justification.esPredeterminada; // <-- Use nested ID
                  const isGlobal =
                    justification.companyId === null ||
                    justification.esPredeterminada === true;
                  const isActive = justification.estaActiva !== false; // Default to active if undefined

                  return (
                    <tr
                      key={justification.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className={`${tdStyle} text-gray-900`}>
                        {justification.textoJustificacion}
                      </td>
                      <td className={tdStyle}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isGlobal
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {isGlobal ? "Global" : "Empresa"}
                        </span>
                      </td>
                      <td className={tdStyle}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className={`${tdStyle} text-right space-x-2 pr-6`}>
                        {isCompanySpecific ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditClick(justification)}
                              className="inline-flex items-center"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-1" />{" "}
                              Editar
                            </Button>
                            {isActive ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleToggleActive(justification)
                                }
                                className="inline-flex items-center"
                              >
                                <XCircleIcon className="h-4 w-4 mr-1" />{" "}
                                Desactivar
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleToggleActive(justification)
                                }
                                className="inline-flex items-center"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />{" "}
                                Activar
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            N/A (Global)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingJustification && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Editar Justificación`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label
                htmlFor="edit-justification-text"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Texto de la Justificación
              </label>
              <Input
                id="edit-justification-text"
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                required
                className="mt-0 w-full"
              />
            </div>
            <div>
              <label
                htmlFor="edit-justification-active"
                className="flex items-center cursor-pointer"
              >
                <input
                  id="edit-justification-active"
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Activa (Puede ser seleccionada para asignación de puntos)
                </span>
              </label>
            </div>
            {editError && <Alert type="error">{editError}</Alert>}
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancelar
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
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageJustifications;
