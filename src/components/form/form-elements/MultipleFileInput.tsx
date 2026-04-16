import React, { useState, useEffect } from "react";
import FileInput from "../input/FileInput";
import Label from "../Label";

interface MultiFileInputProps {
  label?: string;
  onFilesSelect: (files: File[]) => void;
}

const MultiFileInput: React.FC<MultiFileInputProps> = ({
  label = "Upload Images",
  onFilesSelect,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));

    setSelectedFiles(files);
    setPreviewUrls(urls);
    onFilesSelect(files);
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedUrls = previewUrls.filter((_, i) => i !== index);

    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedUrls);
    onFilesSelect(updatedFiles);
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <FileInput
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="custom-class"
      />

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="rounded-lg border shadow max-h-32 object-cover w-full"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full px-1 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiFileInput;
