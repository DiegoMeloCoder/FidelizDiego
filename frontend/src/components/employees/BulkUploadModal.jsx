import { useBulkUpload } from "../../hooks/useBulkUpload";
import Modal from "../ui/Modal";
import { FileUploadStep, UploadResultsStep } from "./BulkUploadSteps";

/**
 * El componente principal del Modal para la Carga Masiva.
 * Orquesta la lógica del hook y renderiza el paso correspondiente.
 */
export function BulkUploadModal({ isOpen, onClose, onUpload }) {
  const {
    parsedData,
    error,
    isUploading,
    results,
    handleFileChange,
    handleUpload,
    handleDownloadCredentials,
    reset,
  } = useBulkUpload(onUpload);

  const handleClose = () => {
    reset();
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
        {!results ? (
          <FileUploadStep
            onFileChange={handleFileChange}
            onUpload={handleUpload}
            parsedData={parsedData}
            error={error}
            isUploading={isUploading}
            onClose={handleClose}
          />
        ) : (
          <UploadResultsStep
            results={results}
            onDownload={handleDownloadCredentials}
            onClose={handleClose}
          />
        )}
      </div>
    </Modal>
  );
}
