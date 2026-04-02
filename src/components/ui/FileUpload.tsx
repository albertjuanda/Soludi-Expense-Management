import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  value?: string;
  onChange: (fileName: string | undefined) => void;
  accept?: string;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png',
  label = 'Upload Receipt',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onChange(file.name);
    }
  }, [onChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file.name);
    }
  }, [onChange]);

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <File size={16} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-indigo-900 truncate">{value}</p>
          <p className="text-xs text-indigo-600">Receipt attached</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="p-1 rounded text-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
        ${isDragging
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
        <Upload size={20} className="text-slate-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click to browse</p>
        <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
      </div>
    </label>
  );
};

export default FileUpload;
