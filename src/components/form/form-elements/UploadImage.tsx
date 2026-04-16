import React, { useState, useEffect, useRef } from "react";
import Label from "../Label";
import FileInput from "../input/FileInput";
import { Pencil } from "lucide-react";
// import { DEFAULT_IMAGE_URL } from "../../../constants/defaultImageUrl.constants";

interface UploadImageProps {
  onFileSelect: (file: File) => void;
  label?: string;
  initialImageUrl?: string;
  editable?: boolean;
}

export default function UploadImage({
  label,
  onFileSelect,
  initialImageUrl,
  editable = true,
}: UploadImageProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    initialImageUrl,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    if (initialImageUrl) setPreviewUrl(initialImageUrl);
  }, [initialImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Label>{label || "Upload Profile Image"}</Label>

      <div className="relative w-24 h-24 rounded-full border-4 border-gray-100 shadow-lg group overflow-visible">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile Preview"
            className="object-cover w-24 h-24 rounded-full"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-full">
            No Image
          </div>
        )}

        {/* Floating Pencil Icon - half in, half out */}
        {editable !== false && (
          <label
            onClick={triggerFileSelect}
            className="absolute -top-1 -right-1 w-[34px] h-[34px] rounded-full bg-white border border-gray-200 shadow-md cursor-pointer transition-all duration-200 hover:bg-gray-100 flex items-center justify-center"
          >
            <Pencil className="text-gray-500 text-sm w-4 h-4" />
          </label>
        )}
      </div>

      {/* Hidden File Input - still styled using your FileInput */}
      <FileInput
        onChange={handleFileChange}
        className="hidden"
        // Forward the ref so we can click it via label
        ref={fileInputRef}
      />
    </div>
  );
}
