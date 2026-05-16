import React, { forwardRef } from "react";

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  accept?: string;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    { className = "", onChange, multiple = false, accept = "", ...props },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        type="file"
        onChange={onChange}
        multiple={multiple}
        accept={accept}
        className={`w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-brand-blue file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:cursor-not-allowed disabled:bg-slate-50 ${className}`}
        {...props}
      />
    );
  },
);

FileInput.displayName = "FileInput";

export default FileInput;
