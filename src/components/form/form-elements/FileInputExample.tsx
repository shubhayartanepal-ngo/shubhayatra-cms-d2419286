import React, { useState, useEffect } from "react";
import FileInput from "../input/FileInput";
import Label from "../Label";

interface FileInputExampleProps {
  onFileSelect: (file: File) => void;
  label?: string;
}

export default function FileInputExample({
  label,
  onFileSelect,
}: FileInputExampleProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div>
      <Label>{label ? label : "Upload File"}</Label>
      <FileInput onChange={handleFileChange} className="custom-class" />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="mt-2 max-h-40 rounded-lg border shadow"
        />
      )}
    </div>
  );
}
