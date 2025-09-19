import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import Papa from "papaparse";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export function BulkUploadModal({ isOpen, onClose, onUpload }) {
  // State for file handling and parsing
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");

  // State for the upload process
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null); // Will store { success: [], errors: [] }

  /**
   * Handles the user selecting a new file.
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setResults(null);
    setParsedData([]);

    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
      // Parse the CSV file to validate its content
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const requiredHeaders = ["Nombre", "Email"];
          const fileHeaders = res.meta.fields.map((f) => f.trim());

          if (!requiredHeaders.every((h) => fileHeaders.includes(h))) {
            setError(
              `El archivo CSV debe contener las columnas: ${requiredHeaders.join(
                ", "
              )}.`
            );
            setParsedData([]);
          } else {
            const validData = res.data.filter((row) => row.Nombre && row.Email);
            setParsedData(validData);
          }
        },
        error: (err) => {
          setError(`Error al procesar el archivo CSV: ${err.message}`);
          setParsedData([]);
        },
      });
    } else {
      setFile(null);
      setError("Por favor, selecciona un archivo CSV válido.");
    }
  };

  /**
   * Initiates the upload process by calling the onUpload prop.
   */
  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setError("No hay datos válidos para cargar.");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const employeesToUpload = parsedData.map((row) => ({
        nombre: row.Nombre.trim(),
        email: row.Email.trim(),
      }));
      const uploadResults = await onUpload(employeesToUpload);
      setResults(uploadResults);
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado durante la carga.");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Generates and downloads a .txt file with the credentials of successfully created users.
   */
  const handleDownloadCredentials = () => {
    if (!results?.success?.length) return;

    let textContent =
      "Fideliz - Credenciales de Carga Masiva\n=======================================\n\n";
    results.success.forEach((user) => {
      textContent += `Nombre: ${user.name}\n`;
      textContent += `Email: ${user.email}\n`;
      textContent += `Contraseña Temporal: ${user.tempPassword}\n`;
      textContent += `---------------------------------------\n`;
    });

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "credenciales_carga_masiva.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Resets all component state and calls the parent onClose function.
   */
  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setError("");
    setIsUploading(false);
    setResults(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Carga Masiva de Empleados (CSV)"
      size="lg"
    >
      <div className="space-y-4">
        {/* Step 1: Upload and Parse View */}
        {!results && (
          <>
            <p className="text-sm text-gray-600">
              Selecciona un archivo CSV con las columnas:{" "}
              <strong>Nombre</strong>, <strong>Email</strong>.
              <br />
              <strong className="text-red-600">NO</strong> incluyas una columna
              de contraseña. Las contraseñas temporales serán generadas por el
              sistema.
            </p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {error && <Alert type="error">{error}</Alert>}
            {parsedData.length > 0 && (
              <Alert type="success">{`Se encontraron ${parsedData.length} filas de empleados válidas para cargar.`}</Alert>
            )}
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={parsedData.length === 0 || isUploading}
              >
                {isUploading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <ArrowUpTrayIcon className="h-5 w-5 mr-1.5" />
                )}
                {isUploading ? "Cargando..." : "Iniciar Carga"}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Results View */}
        {results && (
          <>
            <h3 className="text-lg font-medium text-gray-900">
              Carga Completada
            </h3>
            {results.success.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-700">{`${results.success.length} Empleado(s) Creado(s) Exitosamente:`}</h4>
                <div className="max-h-40 overflow-y-auto border rounded-xs p-2 bg-green-50 text-xs space-y-1">
                  {results.success.map((s, i) => (
                    <p key={i}>
                      <strong>{s.name}</strong> ({s.email})
                    </p>
                  ))}
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  <strong>Importante:</strong> Descarga y distribuye las
                  contraseñas temporales de forma segura.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleDownloadCredentials}
                  className="mt-2 text-sm"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-1.5" /> Descargar
                  Credenciales
                </Button>
              </div>
            )}
            {results.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700">{`${results.errors.length} Error(es):`}</h4>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto border rounded-xs p-2 bg-red-50">
                  {results.errors.map((e, i) => (
                    <li key={i}>
                      <strong>{e.email}:</strong> {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-4 flex justify-end border-t border-gray-200 mt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default BulkUploadModal;
