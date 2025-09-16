import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiClient from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import {
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * Un modal autocontenido para el flujo completo de asignación de puntos.
 * @param {boolean} isOpen - Controla si el modal está visible.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {Array} employees - Lista de empleados activos.
 * @param {Array} justifications - Lista de justificaciones activas.
 * @param {boolean} loadingData - Indica si los datos de empleados/justificaciones están cargando.
 */
export function AssignPointsModal({
  isOpen,
  onClose,
  employees,
  justifications,
  loadingData,
}) {
  // --- Estados del Formulario ---
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedJustificationId, setSelectedJustificationId] = useState("");
  const [points, setPoints] = useState("");

  // --- Estados de Lógica Interna y UI ---
  const [suggestion, setSuggestion] = useState("");
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Efecto para preseleccionar el primer empleado y justificación cuando los datos cargan.
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id);
    }
    if (justifications.length > 0 && !selectedJustificationId) {
      setSelectedJustificationId(justifications[0].id);
    }
  }, [employees, justifications, selectedEmployeeId, selectedJustificationId]);

  // Efecto para obtener sugerencias de puntos cuando cambia la justificación.
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (selectedJustificationId) {
        setLoadingSuggestion(true);
        setSuggestion("");
        try {
          const res = await apiClient.get(
            `/points/suggestions/justification/${selectedJustificationId}`
          );
          setSuggestion(res.data.data.message || "");
        } catch (err) {
          console.error("Error al obtener sugerencia:", err);
          setSuggestion(""); // Limpiar en caso de error
        } finally {
          setLoadingSuggestion(false);
        }
      }
    };
    fetchSuggestion();
  }, [selectedJustificationId]);

  // --- Manejadores de Eventos ---

  const handleGenerateMessages = async () => {
    const employee = employees.find((e) => e.id === selectedEmployeeId);
    const justification = justifications.find(
      (j) => j.id === parseInt(selectedJustificationId)
    );
    if (!employee || !justification || !points) {
      setError(
        "Por favor selecciona un empleado, una justificación y una cantidad de puntos para generar un mensaje."
      );
      return;
    }
    setLoadingMessages(true);
    setError("");
    try {
      const res = await apiClient.post("/points/generate-message", {
        employeeName: employee.nombre,
        justificationText: justification.textoJustificacion,
        points: parseInt(points),
      });
      setGeneratedMessages(res.data.data.suggestions);
    } catch (err) {
      setError(
        err.message || "No se pudo generar el mensaje de reconocimiento."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId || !selectedJustificationId || !points) {
      setError("Por favor completa todos los campos para asignar puntos.");
      return;
    }
    setIsAssigning(true);
    setError("");
    try {
      const res = await apiClient.post("/points/assign", {
        empleadoId: selectedEmployeeId,
        cantidad: parseInt(points),
        justificacionId: parseInt(selectedJustificationId),
      });
      Swal.fire({
        icon: "success",
        title: "¡Puntos Asignados!",
        text: `Se asignaron exitosamente ${res.data.data.assignment.cantidad} puntos.`,
      });
      onClose(); // Cierra el modal en caso de éxito
    } catch (err) {
      setError(err.message || "Ocurrió un error al asignar los puntos.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Puntos a un Empleado"
      size="lg"
    >
      {loadingData ? (
        <div className="flex justify-center items-center p-8">
          <Spinner />
        </div>
      ) : justifications.length === 0 ? (
        <Alert type="warning">
          No se encontraron justificaciones activas. Por favor, agrega o activa
          justificaciones primero.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <div>
            <label
              htmlFor="employee-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seleccionar Empleado
            </label>
            <select
              id="employee-select"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre || emp.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="justification-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seleccionar Justificación
            </label>
            <select
              id="justification-select"
              value={selectedJustificationId}
              onChange={(e) => setSelectedJustificationId(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            >
              {justifications.map((jus) => (
                <option key={jus.id} value={jus.id}>
                  {jus.textoJustificacion}
                </option>
              ))}
            </select>
            {loadingSuggestion && (
              <p className="text-xs text-gray-500 mt-1">
                Cargando sugerencia...
              </p>
            )}
            {suggestion && !loadingSuggestion && (
              <p className="text-xs text-gray-600 bg-gray-100 p-1.5 rounded mt-1">
                💡 {suggestion}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="points-assign"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Puntos a Asignar (+/-)
            </label>
            <Input
              id="points-assign"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Ej: 50 o -10"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateMessages}
              disabled={
                loadingMessages ||
                !selectedEmployeeId ||
                !selectedJustificationId ||
                !points
              }
            >
              {loadingMessages ? (
                <Spinner size="xs" className="mr-1.5" />
              ) : (
                <SparklesIcon className="h-4 w-4 mr-1.5" />
              )}
              {loadingMessages ? "Generando..." : "Generar Mensaje (IA)"}
            </Button>
          </div>

          {generatedMessages.length > 0 && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md space-y-2">
              <p className="text-sm font-medium text-indigo-700 mb-1">
                Mensajes Sugeridos:
              </p>
              {generatedMessages.map((msg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm text-indigo-800 bg-indigo-100/50 p-2 rounded"
                >
                  <span>{msg}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopy(msg, index)}
                    title="Copiar mensaje"
                  >
                    {copiedIndex === index ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isAssigning}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isAssigning}>
              {isAssigning ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <PlusCircleIcon className="h-5 w-5 mr-1.5" />
              )}
              {isAssigning ? "Asignando..." : "Asignar Puntos"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
