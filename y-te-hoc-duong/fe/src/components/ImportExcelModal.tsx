import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import medicalResultService from '../services/medicalResultService';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  onImportSuccess: () => void;
}

export function ImportExcelModal({ isOpen, onClose, campaignId, onImportSuccess }: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('File không đúng định dạng Excel (.xlsx, .xls)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError(null);
    try {
      const blob = await medicalResultService.downloadTemplate(campaignId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mau-ket-qua-kham-campaign-${campaignId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải file mẫu');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file để upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const message = await medicalResultService.importExcel(campaignId, selectedFile);
      setSuccess(message || 'Import kết quả khám thành công');
      setSelectedFile(null);
      
      // Gọi callback để refresh data
      setTimeout(() => {
        onImportSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data || err.response?.data?.message || 'Có lỗi xảy ra khi import file');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-blue-600">Import Excel kết quả khám</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">i</span>
            </div>
            <div className="text-blue-700 text-sm">
              <p className="mb-2">Hướng dẫn import file Excel:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Tải file mẫu Excel bằng nút bên dưới</li>
                <li>Điền thông tin học sinh và kết quả khám vào file mẫu</li>
                <li>Upload file đã điền thông tin</li>
                <li>Hệ thống sẽ tự động import dữ liệu</li>
              </ol>
            </div>
          </div>

          {/* Download Template Section */}
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <span>Bước 1: Tải file mẫu Excel</span>
            </h3>
            <button
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Đang tải...' : 'Tải file mẫu Excel'}
            </button>
          </div>

          {/* Upload Section */}
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Bước 2: Upload file đã điền thông tin</span>
            </h3>
            
            {/* File Input Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <input
                type="file"
                id="excel-file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="excel-file"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-600 mb-1">Click để chọn file Excel</p>
                  <p className="text-xs text-gray-500">Hỗ trợ .xlsx, .xls</p>
                </div>
              </label>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-800">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
          >
            Đóng
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Đang import...' : 'Import dữ liệu'}
          </button>
        </div>
      </div>
    </div>
  );
}
