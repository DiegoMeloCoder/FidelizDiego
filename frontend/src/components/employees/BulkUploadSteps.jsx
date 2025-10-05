import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

/**
 * Componente para el primer paso: seleccionar y validar el archivo CSV.
 */
export function FileUploadStep({
  onFileChange,
  onUpload,
  parsedData,
  error,
  isUploading,
  onClose,
}) {
  return (
    <>
      <p className="text-sm text-gray-600">
        Selecciona un archivo CSV con las columnas: <strong>Nombre</strong>,{" "}
        <strong>Email</strong>.<br />
        <strong className="text-red-600">NO</strong> incluyas una columna de
        contraseña. Las contraseñas temporales serán generadas por el sistema.
      </p>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        onChange={onFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />
      {error && <Alert type="error">{error}</Alert>}
      {parsedData.length > 0 && (
        <Alert type="success">{`Se encontraron ${parsedData.length} filas de empleados válidas para cargar.`}</Alert>
      )}
      <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onUpload}
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
  );
}

/**
 * Componente para el segundo paso: mostrar los resultados de la carga.
 */
export function UploadResultsStep({ results, onDownload, onClose }) {
  return (
    <>
      <h3 className="text-lg font-medium text-gray-900">Carga Completada</h3>
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
            <strong>Importante:</strong> Descarga y distribuye las contraseñas
            temporales de forma segura.
          </p>
          <Button
            variant="secondary"
            onClick={onDownload}
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
        <Button type="button" variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </>
  );
}
