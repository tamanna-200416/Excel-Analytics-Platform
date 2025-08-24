import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, AlertCircle } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import toast from 'react-hot-toast';

const UploadPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/excel/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.error || 'Upload failed');
      }

      setIsSuccess(true);
      toast.success('📊 File uploaded successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(message);
      toast.error(`❌ ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 pt-24 pb-16 dark:bg-gray-900">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Your Excel File
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get started by uploading your Excel file (.xls or .xlsx) to create visualizations
        </p>
      </div>

      <Card className="mb-8 dark:bg-gray-800 dark:text-white">
        <CardHeader>
          <CardTitle>Excel File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-200 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Upload Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your file has been uploaded successfully. Redirecting to dashboard...
              </p>
              <div className="animate-pulse">
                <div className="bg-blue-100 h-1 w-24 mx-auto rounded-full"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <FileUpload onFileUpload={handleFileUpload} isLoading={isUploading} />
              </div>

              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-200 border border-red-200 rounded-md p-4 mb-6 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
          Tips for Optimal Results
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-2 mt-0.5">1</span>
            Ensure your Excel file has clear column headers in the first row
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-2 mt-0.5">2</span>
            Clean your data of any empty rows or columns
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-2 mt-0.5">3</span>
            Files up to 10MB are supported
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium mr-2 mt-0.5">4</span>
            Both .xls and .xlsx formats are supported
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPage;
