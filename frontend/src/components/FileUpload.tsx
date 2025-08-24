import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const FileUpload: React.FC<Props> = ({ onFileUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const extension = file.name.toLowerCase().split('.').pop();
    if (!allowedTypes.includes(file.type) && !(extension === 'xls' || extension === 'xlsx')) {
      setError('Only .xls or .xlsx Excel files are allowed');
      return false;
    }
    if (file.size === 0) {
      setError('File is empty');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('❌ Please select a file first');
      return;
    }
    try {
      await onFileUpload(selectedFile);
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
        ${dragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-gray-800'
          : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <div className="space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
          {selectedFile ? <File className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
        </div>

        {selectedFile ? (
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Upload
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 text-sm rounded-md"
              >
                Change
              </button>
              <button
                onClick={resetUpload}
                className="p-2 border border-gray-300 text-sm rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-900 dark:text-white">Drop your Excel file here</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">.xls or .xlsx, max 10MB</p>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-sm rounded-md mt-2"
            >
              Browse Files
            </button>
          </>
        )}

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-700 flex items-start dark:bg-red-200">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
