import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import medicalResultService from '../services/medicalResultService';
import campaignService, { MedicalCampaign } from '../services/campaignService';
import schoolService, { SchoolResponseDTO } from '../services/schoolService';
import schoolClassService, { SchoolClassResponseDTO } from '../services/schoolClassService';
import { AddSchoolModal } from './AddSchoolModal';
import { AddSchoolClassModal } from './AddSchoolClassModal';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: number; // Làm optional vì giờ chọn từ dropdown
  onImportSuccess: () => void;
}

export function ImportExcelModal({ isOpen, onClose, campaignId, onImportSuccess }: ImportExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<MedicalCampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(campaignId || null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  
  // Thêm state cho schools và classes
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [loadingSchools, setLoadingSchools] = useState(false);
  
  const [classes, setClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Modal states
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  // Load campaigns khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
      loadSchools();
    }
  }, [isOpen]);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const data = await campaignService.getAllCampaigns();
      setCampaigns(data);
      // Nếu có campaignId từ props, set làm mặc định
      if (campaignId && !selectedCampaignId) {
        setSelectedCampaignId(campaignId);
      }
    } catch (err: any) {
      setError('Không thể tải danh sách đợt khám');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadSchools = async () => {
    setLoadingSchools(true);
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (err: any) {
      setError('Không thể tải danh sách trường học');
    } finally {
      setLoadingSchools(false);
    }
  };

  // Load classes khi school được chọn
  useEffect(() => {
    if (selectedSchoolId) {
      loadClasses(selectedSchoolId);
    } else {
      setClasses([]);
      setSelectedClassId(null);
    }
  }, [selectedSchoolId]);

  const loadClasses = async (schoolId: number) => {
    setLoadingClasses(true);
    try {
      const data = await schoolClassService.getSchoolClassesBySchool(schoolId);
      setClasses(data);
    } catch (err: any) {
      setError('Không thể tải danh sách lớp học');
    } finally {
      setLoadingClasses(false);
    }
  };

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
    if (!selectedCampaignId) {
      setError('Vui lòng chọn đợt khám trước');
      return;
    }
    if (!selectedSchoolId) {
      setError('Vui lòng chọn trường học trước');
      return;
    }
    if (!selectedClassId) {
      setError('Vui lòng chọn lớp học trước');
      return;
    }
    
    setDownloading(true);
    setError(null);
    try {
      const blob = await medicalResultService.downloadTemplate(selectedCampaignId, selectedSchoolId, selectedClassId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mau-ket-qua-kham-campaign-${selectedCampaignId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải file mẫu';
      setError(String(errorMsg));
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedCampaignId) {
      setError('Vui lòng chọn đợt khám trước');
      return;
    }
    if (!selectedSchoolId) {
      setError('Vui lòng chọn trường học trước');
      return;
    }
    if (!selectedClassId) {
      setError('Vui lòng chọn lớp học trước');
      return;
    }
    
    if (!selectedFile) {
      setError('Vui lòng chọn file để upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const message = await medicalResultService.importExcel(selectedCampaignId, selectedSchoolId, selectedClassId, selectedFile);
      setSuccess(message || 'Import kết quả khám thành công');
      setSelectedFile(null);
      
      // Gọi callback để refresh data
      setTimeout(() => {
        onImportSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi import file';
      setError(String(errorMsg));
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setSelectedCampaignId(campaignId || null);
    setSelectedSchoolId(null);
    setSelectedClassId(null);
    setClasses([]);
    onClose();
  };

  const handleSchoolAdded = async () => {
    await loadSchools();
    setIsAddSchoolModalOpen(false);
  };

  const handleClassAdded = async () => {
    if (selectedSchoolId) {
      await loadClasses(selectedSchoolId);
    }
    setIsAddClassModalOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
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
          {/* Campaign Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn đợt khám <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCampaignId || ''}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value ? Number(e.target.value) : null);
                setError(null);
              }}
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingCampaigns ? 'Đang tải...' : 'Chọn đợt khám'}
              </option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.campaignName} - {campaign.schoolYear}
                </option>
              ))}
            </select>
          </div>

          {/* School Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn trường học <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={selectedSchoolId || ''}
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value ? Number(e.target.value) : null);
                  setError(null);
                }}
                disabled={loadingSchools}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingSchools ? 'Đang tải...' : 'Chọn trường học'}
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsAddSchoolModalOpen(true)}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                title="Thêm trường học mới"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Thêm</span>
              </button>
            </div>
          </div>

          {/* Class Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Chọn lớp học <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={selectedClassId || ''}
                onChange={(e) => {
                  setSelectedClassId(e.target.value ? Number(e.target.value) : null);
                  setError(null);
                }}
                disabled={!selectedSchoolId || loadingClasses}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedSchoolId 
                    ? 'Vui lòng chọn trường học trước' 
                    : loadingClasses 
                    ? 'Đang tải...' 
                    : 'Chọn lớp học'}
                </option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.className} - Khối {classItem.grade}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsAddClassModalOpen(true)}
                disabled={!selectedSchoolId}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Thêm lớp học mới"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Thêm</span>
              </button>
            </div>
          </div>

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

      {/* Add School Modal */}
      <AddSchoolModal
        isOpen={isAddSchoolModalOpen}
        onClose={() => setIsAddSchoolModalOpen(false)}
        onSuccess={handleSchoolAdded}
      />

      {/* Add Class Modal */}
      {selectedSchoolId && (
        <AddSchoolClassModal
          isOpen={isAddClassModalOpen}
          onClose={() => setIsAddClassModalOpen(false)}
          onSuccess={handleClassAdded}
          school={schools.find(s => s.id === selectedSchoolId)!}
        />
      )}
    </div>
  );
}
