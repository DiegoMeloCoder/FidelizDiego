import { useState, useEffect, useRef } from "react";
import Input from "./Input";
import Button from "./Button";
import { CameraIcon } from "@heroicons/react/24/outline";

/**
 * A reusable component for uploading and previewing an image.
 * @param {string} label - The label for the input field.
 * @param {string} existingImageUrl - URL of an existing image to display initially.
 * @param {function} onFileChange - Callback function that receives the selected file object or null.
 * @param {function} onFileRemove - Callback function that signals the intent to remove the existing image.
 */
export function ImageUploadInput({
  label,
  existingImageUrl = null,
  onFileChange,
  onFileRemove,
}) {
  const [preview, setPreview] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef(null);

  // Update preview if the existing image URL changes
  useEffect(() => {
    setPreview(existingImageUrl);
    setIsRemoving(false); // Reset removal state when the prop changes
  }, [existingImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onFileChange(file); // Notify parent of the new file
      setIsRemoving(false);
    }
  };

  const handleRemoveClick = () => {
    setPreview(null);
    onFileChange(null); // Notify parent that the selected file is cleared
    onFileRemove(true); // Notify parent to remove the existing image on save
    setIsRemoving(true);

    // Programmatically reset the file input's value.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div className="shrink-0 h-16 w-16">
          {preview && !isRemoving ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover rounded-md border border-gray-300"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 rounded-md flex items-center justify-center">
              <CameraIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="grow">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {preview && !isRemoving && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemoveClick}
              className="mt-2"
            >
              Eliminar Imagen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
