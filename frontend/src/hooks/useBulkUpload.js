import { useState } from "react";
import Papa from "papaparse";

/**
 * Un hook para manejar la lógica de la carga masiva de empleados a través de un archivo CSV.
 * @param {function} onUpload - La función que realiza la llamada a la API.
 */
export function useBulkUpload(onUpload) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);

  /**
   * Maneja la selección de un archivo, lo valida y lo parsea.
   */
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setResults(null);
    setParsedData([]);
    setError("");

    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          if (!res.data || res.data.length === 0) {
            setError("El archivo CSV está vacío o no se pudo procesar.");
            return;
          }

          const requiredHeaders = ["Nombre", "Email"];
          const fileHeaders = res.meta.fields.map((f) => f.trim());

          if (!requiredHeaders.every((h) => fileHeaders.includes(h))) {
            setError(
              `El CSV debe contener las columnas: ${requiredHeaders.join(
                ", "
              )}.`
            );
            return;
          }

          const validData = res.data.filter((row) => row.Nombre && row.Email);
          if (validData.length !== res.data.length) {
            setError(
              "Algunas filas en el archivo no tienen Nombre o Email y serán ignoradas."
            );
          }
          setParsedData(validData);
        },
        error: (err) => {
          setError(`Error al procesar el archivo CSV: ${err.message}`);
        },
      });
    } else {
      setFile(null);
      setError("Por favor, selecciona un archivo CSV válido.");
    }
  };

  /**
   * Inicia el proceso de subida de los datos parseados.
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
   * Genera y descarga un archivo .txt con las credenciales.
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
   * Resetea el estado del hook.
   */
  const reset = () => {
    setFile(null);
    setParsedData([]);
    setError("");
    setIsUploading(false);
    setResults(null);
  };

  return {
    file,
    parsedData,
    error,
    isUploading,
    results,
    handleFileChange,
    handleUpload,
    handleDownloadCredentials,
    reset,
  };
}
