import { FileText, Download, Users, Eye, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import medicalResultService from '../services/medicalResultService';
import { useCampaigns } from '../hooks/useCampaigns';
import schoolService, { SchoolResponseDTO } from '../services/schoolService';
import schoolClassService, { SchoolClassResponseDTO } from '../services/schoolClassService';
import { HealthReportModal } from './HealthReportModal';

interface PreviewData {
  headers: string[];
  rows: any[][];
  allRows: any[][]; // Tất cả các dòng bao gồm header rows
  merges: any[]; // Thông tin merge cells
}

export function ReportPage() {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isHealthReportModalOpen, setIsHealthReportModalOpen] = useState(false);

  // States cho card Danh sách học sinh
  const [studentListCampaignId, setStudentListCampaignId] = useState<number | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isExportingStudentList, setIsExportingStudentList] = useState(false);
  
  // States cho card Báo cáo tổng hợp
  const [statisticCampaignId, setStatisticCampaignId] = useState<number | null>(null);
  const [statisticSchoolId, setStatisticSchoolId] = useState<number | null>(null);
  const [statisticClassId, setStatisticClassId] = useState<number | null>(null);
  const [statisticSchools, setStatisticSchools] = useState<SchoolResponseDTO[]>([]);
  const [statisticClasses, setStatisticClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [loadingStatisticSchools, setLoadingStatisticSchools] = useState(false);
  const [loadingStatisticClasses, setLoadingStatisticClasses] = useState(false);
  const [isExportingStatistic, setIsExportingStatistic] = useState(false);
  const [isLoadingStatisticPreview, setIsLoadingStatisticPreview] = useState(false);
  
  // Preview states
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Load schools khi component mount
  useEffect(() => {
    loadSchools();
    loadStatisticSchools();
  }, []);

  // Load classes khi school được chọn
  useEffect(() => {
    if (selectedSchoolId) {
      loadClasses(selectedSchoolId);
    } else {
      setClasses([]);
      setSelectedClassId(null);
    }
  }, [selectedSchoolId]);

  // Load classes cho statistic khi school được chọn
  useEffect(() => {
    if (statisticSchoolId) {
      loadStatisticClasses(statisticSchoolId);
    } else {
      setStatisticClasses([]);
      setStatisticClassId(null);
    }
  }, [statisticSchoolId]);

  const loadSchools = async () => {
    setLoadingSchools(true);
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (err: any) {
      console.error('Error loading schools:', err);
      toast.error('Không thể tải danh sách trường học');
    } finally {
      setLoadingSchools(false);
    }
  };

  const loadClasses = async (schoolId: number) => {
    setLoadingClasses(true);
    try {
      const data = await schoolClassService.getSchoolClassesBySchool(schoolId);
      setClasses(data);
    } catch (err: any) {
      console.error('Error loading classes:', err);
      toast.error('Không thể tải danh sách lớp học');
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadStatisticSchools = async () => {
    setLoadingStatisticSchools(true);
    try {
      const data = await schoolService.getAllSchools();
      setStatisticSchools(data);
    } catch (err: any) {
      console.error('Error loading statistic schools:', err);
      toast.error('Không thể tải danh sách trường học');
    } finally {
      setLoadingStatisticSchools(false);
    }
  };

  const loadStatisticClasses = async (schoolId: number) => {
    setLoadingStatisticClasses(true);
    try {
      const data = await schoolClassService.getSchoolClassesBySchool(schoolId);
      setStatisticClasses(data);
    } catch (err: any) {
      console.error('Error loading statistic classes:', err);
      toast.error('Không thể tải danh sách lớp học');
    } finally {
      setLoadingStatisticClasses(false);
    }
  };

  const handleExportHealthReport = async () => {
    if (!selectedCampaignId) {
      toast.error('Vui lòng chọn đợt khám');
      return;
    }

    try {
      setIsExporting(true);
      const blob = await medicalResultService.exportExcel(selectedCampaignId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bien-ban-kham-suc-khoe-campaign-${selectedCampaignId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tải biên bản thành công!');
    } catch (err: any) {
      console.error('Error exporting health report:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải biên bản');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStudentList = async () => {
    if (!studentListCampaignId) {
      toast.error('Vui lòng chọn đợt khám');
      return;
    }

    try {
      setIsExportingStudentList(true);
      
      // Gọi API với campaignId, schoolId và classId (optional)
      const blob = await medicalResultService.exportExcel(
        studentListCampaignId,
        selectedSchoolId || undefined,
        selectedClassId || undefined
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Tạo tên file dựa vào các filter
      let fileName = `danh-sach-hoc-sinh-campaign-${studentListCampaignId}`;
      if (selectedSchoolId) fileName += `-school-${selectedSchoolId}`;
      if (selectedClassId) fileName += `-class-${selectedClassId}`;
      fileName += '.xlsx';
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tải danh sách học sinh thành công!');
    } catch (err: any) {
      console.error('Error exporting student list:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách');
    } finally {
      setIsExportingStudentList(false);
    }
  };

  const handlePreviewStudentList = async () => {
    if (!studentListCampaignId) {
      toast.error('Vui lòng chọn đợt khám');
      return;
    }

    try {
      setIsLoadingPreview(true);
      
      // Tải file Excel
      const blob = await medicalResultService.exportExcel(
        studentListCampaignId,
        selectedSchoolId || undefined,
        selectedClassId || undefined
      );
      
      // Lưu blob để có thể tải xuống sau
      setPreviewBlob(blob);
      
      // Parse Excel file để preview
      const arrayBuffer = await blob.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Lấy sheet đầu tiên
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Lấy thông tin merge cells
      const merges = worksheet['!merges'] || [];
      
      // Lấy range thực tế của dữ liệu
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Convert sang JSON không điền giá trị mặc định
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length > 0) {
        // Tìm số cột thực tế có dữ liệu
        let maxColWithData = 0;
        jsonData.forEach(row => {
          for (let i = row.length - 1; i >= 0; i--) {
            if (row[i] !== undefined && row[i] !== null && String(row[i]).trim() !== '') {
              maxColWithData = Math.max(maxColWithData, i);
              break;
            }
          }
        });
        
        // Cắt bỏ các cột trống ở cuối
        const cleanedData = jsonData.map(row => row.slice(0, maxColWithData + 1));
        
        // Loại bỏ các dòng hoàn toàn trống ở cuối
        let lastRowWithData = cleanedData.length - 1;
        for (let i = cleanedData.length - 1; i >= 0; i--) {
          const hasData = cleanedData[i].some((cell: any) => 
            cell !== undefined && cell !== null && String(cell).trim() !== ''
          );
          if (hasData) {
            lastRowWithData = i;
            break;
          }
        }
        
        const finalData = cleanedData.slice(0, lastRowWithData + 1);
        
        // Tìm dòng cuối cùng của header (dòng chứa STT, TT hoặc Họ tên)
        // Dữ liệu học sinh bắt đầu ngay sau dòng này
        let lastHeaderRowIndex = -1;
        for (let i = 0; i < finalData.length; i++) {
          const row = finalData[i];
          
          // Tìm dòng có STT hoặc TT (thường là dòng cuối của header)
          const hasSTT = row.some((cell: any) => {
            const cellStr = String(cell || '').trim().toLowerCase();
            return cellStr === 'stt' || cellStr === 'tt' || 
                   (cellStr.includes('stt') && cellStr.length < 5) ||
                   (cellStr.includes('tt') && cellStr.length < 5);
          });
          
          if (hasSTT) {
            lastHeaderRowIndex = i;
            break;
          }
          
          // Hoặc tìm dòng có "Họ và tên", "Họ tên"
          const hasName = row.some((cell: any) => {
            const cellStr = String(cell || '').trim().toLowerCase();
            return cellStr.includes('họ') && cellStr.includes('tên');
          });
          
          if (hasName) {
            lastHeaderRowIndex = i;
            break;
          }
        }
        
        // Dữ liệu bắt đầu ngay sau dòng header cuối cùng
        const dataStartIndex = lastHeaderRowIndex >= 0 ? lastHeaderRowIndex + 1 : 0;
        
        const allRows = finalData;
        const headers = finalData[0] as string[];
        const rows = finalData.slice(dataStartIndex);
        
        setPreviewData({ headers, rows, allRows, merges });
        setPreviewTitle('Danh sách học sinh đã khám');
        setShowPreview(true);
      } else {
        toast.error('File không có dữ liệu');
      }
    } catch (err: any) {
      console.error('Error previewing student list:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xem trước');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadFromPreview = () => {
    if (!previewBlob) return;
    
    const url = window.URL.createObjectURL(previewBlob);
    const a = document.createElement('a');
    a.href = url;
    
    let fileName = '';
    if (previewTitle.includes('Danh sách học sinh')) {
      fileName = `danh-sach-hoc-sinh-campaign-${studentListCampaignId}`;
      if (selectedSchoolId) fileName += `-school-${selectedSchoolId}`;
      if (selectedClassId) fileName += `-class-${selectedClassId}`;
    } else if (previewTitle.includes('Báo cáo tổng hợp')) {
      fileName = `bao-cao-tong-hop-campaign-${statisticCampaignId}`;
      if (statisticSchoolId) fileName += `-school-${statisticSchoolId}`;
      if (statisticClassId) fileName += `-class-${statisticClassId}`;
    }
    fileName += '.xlsx';
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Tải file thành công!');
    setShowPreview(false);
  };

  const handleExportStatistic = async () => {
    if (!statisticCampaignId) {
      toast.error('Vui lòng chọn đợt khám');
      return;
    }

    try {
      setIsExportingStatistic(true);
      
      const blob = await medicalResultService.exportStatisticExcel(
        statisticCampaignId,
        statisticSchoolId || undefined,
        statisticClassId || undefined
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let fileName = `bao-cao-tong-hop-campaign-${statisticCampaignId}`;
      if (statisticSchoolId) fileName += `-school-${statisticSchoolId}`;
      if (statisticClassId) fileName += `-class-${statisticClassId}`;
      fileName += '.xlsx';
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tải báo cáo tổng hợp thành công!');
    } catch (err: any) {
      console.error('Error exporting statistic report:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải báo cáo');
    } finally {
      setIsExportingStatistic(false);
    }
  };

  const handlePreviewStatistic = async () => {
    if (!statisticCampaignId) {
      toast.error('Vui lòng chọn đợt khám');
      return;
    }

    try {
      setIsLoadingStatisticPreview(true);
      
      const blob = await medicalResultService.exportStatisticExcel(
        statisticCampaignId,
        statisticSchoolId || undefined,
        statisticClassId || undefined
      );
      
      setPreviewBlob(blob);
      
      // Parse Excel file để preview
      const arrayBuffer = await blob.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const merges = worksheet['!merges'] || [];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length > 0) {
        let maxColWithData = 0;
        jsonData.forEach(row => {
          for (let i = row.length - 1; i >= 0; i--) {
            if (row[i] !== undefined && row[i] !== null && String(row[i]).trim() !== '') {
              maxColWithData = Math.max(maxColWithData, i);
              break;
            }
          }
        });
        
        const cleanedData = jsonData.map(row => row.slice(0, maxColWithData + 1));
        
        let lastRowWithData = cleanedData.length - 1;
        for (let i = cleanedData.length - 1; i >= 0; i--) {
          const hasData = cleanedData[i].some((cell: any) => 
            cell !== undefined && cell !== null && String(cell).trim() !== ''
          );
          if (hasData) {
            lastRowWithData = i;
            break;
          }
        }
        
        const finalData = cleanedData.slice(0, lastRowWithData + 1);
        
        // Tìm dòng cuối cùng của header cho báo cáo thống kê
        let lastHeaderRowIndex = -1;
        for (let i = 0; i < finalData.length; i++) {
          const row = finalData[i];
          
          // Tìm dòng có STT hoặc TT
          const hasSTT = row.some((cell: any) => {
            const cellStr = String(cell || '').trim().toLowerCase();
            return cellStr === 'stt' || cellStr === 'tt' || 
                   (cellStr.includes('stt') && cellStr.length < 5) ||
                   (cellStr.includes('tt') && cellStr.length < 5);
          });
          
          if (hasSTT) {
            lastHeaderRowIndex = i;
            break;
          }
          
          // Hoặc tìm dòng có "Trường" và "Lớp" (header của báo cáo thống kê)
          const hasSchoolClass = row.some((cell: any) => {
            const cellStr = String(cell || '').trim().toLowerCase();
            return cellStr.includes('trường') || cellStr.includes('lớp');
          });
          
          if (hasSchoolClass) {
            lastHeaderRowIndex = i;
            break;
          }
        }
        
        const dataStartIndex = lastHeaderRowIndex >= 0 ? lastHeaderRowIndex + 1 : 0;
        
        const allRows = finalData;
        const headers = finalData[0] as string[];
        const rows = finalData.slice(dataStartIndex);
        
        setPreviewData({ headers, rows, allRows, merges });
        setPreviewTitle('Báo cáo tổng hợp kết quả');
        setShowPreview(true);
      } else {
        toast.error('File không có dữ liệu');
      }
    } catch (err: any) {
      console.error('Error previewing statistic report:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xem trước');
    } finally {
      setIsLoadingStatisticPreview(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Báo cáo</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Tạo và tải các loại báo cáo khám sức khỏe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Card Danh sách học sinh đã khám sức khỏe */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">Danh sách học sinh đã khám</h2>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Xuất danh sách học sinh đã khám sức khỏe theo đợt khám, trường, lớp
            </p>

            {/* Select Campaign */}
            <div className="mb-2 sm:mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Chọn đợt khám <span className="text-red-500">*</span>
              </label>
              <select
                value={studentListCampaignId || ''}
                onChange={(e) => setStudentListCampaignId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={campaignsLoading}
              >
                <option value="">-- Chọn đợt khám --</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.campaignName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select School (Optional) */}
            <div className="mb-2 sm:mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Chọn trường học (Tùy chọn)
              </label>
              <select
                value={selectedSchoolId || ''}
                onChange={(e) => setSelectedSchoolId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loadingSchools}
              >
                <option value="">-- Tất cả trường --</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Class (Optional) */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Chọn lớp học (Tùy chọn)
              </label>
              <select
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={!selectedSchoolId || loadingClasses}
              >
                <option value="">
                  {!selectedSchoolId ? '-- Chọn trường trước --' : '-- Tất cả lớp --'}
                </option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.className} - Khối {classItem.grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePreviewStudentList}
                disabled={!studentListCampaignId || isLoadingPreview}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-md transition-colors ${
                  !studentListCampaignId || isLoadingPreview
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden xs:inline">{isLoadingPreview ? 'Đang tải...' : 'Xem trước'}</span>
                <span className="xs:hidden">{isLoadingPreview ? 'Đang tải...' : 'Xem trước'}</span>
              </button>
              
              <button
                onClick={handleExportStudentList}
                disabled={!studentListCampaignId || isExportingStudentList}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-md transition-colors ${
                  !studentListCampaignId || isExportingStudentList
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">{isExportingStudentList ? 'Đang tải...' : 'Tải xuống'}</span>
                <span className="xs:hidden">{isExportingStudentList ? 'Đang tải...' : 'Tải xuống'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Biên bản khám sức khỏe */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Biên bản khám sức khỏe</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Xem và tải biên bản khám sức khỏe định kỳ cho học sinh theo đợt khám
            </p>

            {/* Select Campaign */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn đợt khám
              </label>
              <select
                value={selectedCampaignId || ''}
                onChange={(e) => setSelectedCampaignId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={campaignsLoading}
              >
                <option value="">-- Chọn đợt khám --</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.campaignName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsHealthReportModalOpen(true)}
              disabled={!selectedCampaignId}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                !selectedCampaignId
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              Xem biên bản
            </button>
          </div>
        </div>

        {/* Card Báo cáo tổng hợp */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">Báo cáo tổng hợp kết quả</h2>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Xuất báo cáo tổng hợp kết quả khám sức khỏe theo đợt khám, trường, lớp
            </p>

            {/* Select Campaign */}
            <div className="mb-2 sm:mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Chọn đợt khám <span className="text-red-500">*</span>
              </label>
              <select
                value={statisticCampaignId || ''}
                onChange={(e) => setStatisticCampaignId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={campaignsLoading}
              >
                <option value="">-- Chọn đợt khám --</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.campaignName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select School (Optional) */}
            <div className="mb-2 sm:mb-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Chọn trường học (Tùy chọn)
              </label>
              <select
                value={statisticSchoolId || ''}
                onChange={(e) => setStatisticSchoolId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingStatisticSchools}
              >
                <option value="">-- Tất cả trường --</option>
                {statisticSchools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Class (Optional) */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Chọn lớp học (Tùy chọn)
              </label>
              <select
                value={statisticClassId || ''}
                onChange={(e) => setStatisticClassId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!statisticSchoolId || loadingStatisticClasses}
              >
                <option value="">
                  {!statisticSchoolId ? '-- Chọn trường trước --' : '-- Tất cả lớp --'}
                </option>
                {statisticClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.className} - Khối {classItem.grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePreviewStatistic}
                disabled={!statisticCampaignId || isLoadingStatisticPreview}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-md transition-colors ${
                  !statisticCampaignId || isLoadingStatisticPreview
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden xs:inline">{isLoadingStatisticPreview ? 'Đang tải...' : 'Xem trước'}</span>
                <span className="xs:hidden">{isLoadingStatisticPreview ? 'Đang tải...' : 'Xem trước'}</span>
              </button>
              
              <button
                onClick={handleExportStatistic}
                disabled={!statisticCampaignId || isExportingStatistic}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-md transition-colors ${
                  !statisticCampaignId || isExportingStatistic
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">{isExportingStatistic ? 'Đang tải...' : 'Tải xuống'}</span>
                <span className="xs:hidden">{isExportingStatistic ? 'Đang tải...' : 'Tải xuống'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full sm:w-[95vw] max-w-[1800px] h-[95vh] sm:h-[90vh] md:h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-300 bg-gray-50 flex-shrink-0">
              <div className="flex-1 min-w-0 mr-2 sm:mr-4">
                <h2 className="text-sm sm:text-base font-bold text-gray-800 truncate">
                  <span className="hidden sm:inline">Xem trước Excel - </span>{previewTitle}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5 sm:mt-1 truncate hidden sm:block">
                  {previewTitle.includes('Danh sách học sinh') ? (
                    <>
                      Đợt khám: {campaigns.find(c => c.id === studentListCampaignId)?.campaignName}
                      {selectedSchoolId && ` - Trường: ${schools.find(s => s.id === selectedSchoolId)?.schoolName}`}
                      {selectedClassId && ` - Lớp: ${classes.find(c => c.id === selectedClassId)?.className}`}
                    </>
                  ) : (
                    <>
                      Đợt khám: {campaigns.find(c => c.id === statisticCampaignId)?.campaignName}
                      {statisticSchoolId && ` - Trường: ${statisticSchools.find(s => s.id === statisticSchoolId)?.schoolName}`}
                      {statisticClassId && ` - Lớp: ${statisticClasses.find(c => c.id === statisticClassId)?.className}`}
                    </>
                  )}
                </p>
              </div>
              
              {/* Zoom Controls - Hidden on mobile, compact on tablet */}
              <div className="hidden sm:flex items-center gap-1 sm:gap-2 mr-2 sm:mr-3 flex-shrink-0">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  title="Thu nhỏ"
                >
                  -
                </button>
                <span className="text-xs font-medium min-w-[35px] sm:min-w-[40px] text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  title="Phóng to"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-1.5 sm:px-2 h-6 sm:h-7 text-xs bg-gray-200 hover:bg-gray-300 rounded hidden md:block"
                  title="Reset"
                >
                  Reset
                </button>
              </div>
              
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 p-1 flex-shrink-0"
                title="Đóng"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Table with Excel Style */}
            <div 
              className="excel-preview-container flex-1 bg-gray-100 p-2 sm:p-3" 
              style={{ 
                overflowX: 'scroll',
                overflowY: 'scroll',
                scrollbarWidth: 'auto',
                scrollbarColor: '#0EA5E9 #E0F2FE'
              }}
            >
              <style>{`
                /* Custom scrollbar for webkit browsers */
                .excel-preview-container::-webkit-scrollbar {
                  width: 18px;
                  height: 18px;
                }
                .excel-preview-container::-webkit-scrollbar-track {
                  background: #E0F2FE;
                  border-radius: 0;
                }
                .excel-preview-container::-webkit-scrollbar-thumb {
                  background: #0EA5E9;
                  border-radius: 0;
                  border: 3px solid #E0F2FE;
                }
                .excel-preview-container::-webkit-scrollbar-thumb:hover {
                  background: #0284C7;
                }
                .excel-preview-container::-webkit-scrollbar-corner {
                  background: #E0F2FE;
                }
              `}</style>
              <div style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top left',
                width: `${(100 / zoomLevel) * 100}%`,
                display: 'inline-block'
              }}>
              <table 
                className="border-collapse" 
                style={{ 
                  fontFamily: 'Calibri, Arial, sans-serif',
                  fontSize: '10pt',
                  backgroundColor: 'white',
                  borderCollapse: 'collapse',
                  tableLayout: 'auto'
                }}
              >
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  {(() => {
                    // Tìm dòng cuối cùng của header (dòng chứa STT, Họ tên, Tên, TT...)
                    // headerRowCount = số dòng header tính từ đầu file (row 0)
                    let lastHeaderRowIndex = -1;
                    for (let i = 0; i < previewData.allRows.length; i++) {
                      const row = previewData.allRows[i];
                      // Tìm dòng có STT hoặc TT (thường là dòng cuối của header)
                      const hasSTT = row.some((cell: any) => {
                        const cellStr = String(cell || '').trim().toLowerCase();
                        return cellStr === 'stt' || cellStr === 'tt' || 
                               (cellStr.includes('stt') && cellStr.length < 5) ||
                               (cellStr.includes('tt') && cellStr.length < 5);
                      });
                      
                      if (hasSTT) {
                        lastHeaderRowIndex = i;
                        break;
                      }
                      
                      // Hoặc tìm dòng có "Họ và tên", "Họ tên"
                      const hasName = row.some((cell: any) => {
                        const cellStr = String(cell || '').trim().toLowerCase();
                        return cellStr.includes('họ') && cellStr.includes('tên');
                      });
                      
                      if (hasName) {
                        lastHeaderRowIndex = i;
                        break;
                      }
                    }
                    
                    // headerRowCount = tất cả các dòng từ 0 đến lastHeaderRowIndex (bao gồm cả tiêu đề)
                    const headerRowCount = lastHeaderRowIndex >= 0 ? lastHeaderRowIndex + 1 : 1;
                    
                    // Tạo map để track cells đã bị merged
                    const mergedCells = new Set<string>();
                    const cellMergeInfo = new Map<string, { rowSpan: number; colSpan: number }>();
                    
                    // Xử lý thông tin merge từ Excel
                    previewData.merges.forEach((merge: any) => {
                      const startRow = merge.s.r;
                      const endRow = merge.e.r;
                      const startCol = merge.s.c;
                      const endCol = merge.e.c;
                      
                      // Chỉ xử lý merge trong phần header
                      if (startRow < headerRowCount) {
                        const rowSpan = endRow - startRow + 1;
                        const colSpan = endCol - startCol + 1;
                        
                        // Cell gốc sẽ có rowSpan/colSpan
                        cellMergeInfo.set(`${startRow}-${startCol}`, { rowSpan, colSpan });
                        
                        // Đánh dấu các cells bị merged (không render)
                        for (let r = startRow; r <= endRow; r++) {
                          for (let c = startCol; c <= endCol; c++) {
                            if (r !== startRow || c !== startCol) {
                              mergedCells.add(`${r}-${c}`);
                            }
                          }
                        }
                      }
                    });
                    
                    // Xử lý merge dọc cho các nhóm khám có cùng tên (merge ngang colSpan > 1)
                    // Nếu các dòng dưới trong cùng vùng cột có cùng giá trị với cell gốc, thì merge dọc
                    if (headerRowCount > 1) {
                      const horizontalMerges = Array.from(cellMergeInfo.entries())
                        .filter(([key, info]) => info.colSpan > 1)
                        .map(([key, info]) => {
                          const [row, col] = key.split('-').map(Number);
                          return { row, col, rowSpan: info.rowSpan, colSpan: info.colSpan };
                        });
                      
                      horizontalMerges.forEach(merge => {
                        const { row: startRow, col: startCol, colSpan } = merge;
                        const cellValue = previewData.allRows[startRow]?.[startCol];
                        
                        // Bỏ qua nếu là tiêu đề "DANH SÁCH HỌC SINH..." hoặc các tiêu đề chính
                        const cellValueStr = String(cellValue || '').trim().toUpperCase();
                        if (cellValueStr.includes('DANH SÁCH') || 
                            cellValueStr.includes('HỌC SINH') ||
                            cellValueStr.includes('KHÁM SỨC KHỎE') ||
                            cellValueStr.length > 50) {
                          return;
                        }
                        
                        // Kiểm tra các dòng dưới trong cùng vùng cột
                        let canExtendDown = true;
                        for (let r = startRow + 1; r < headerRowCount && canExtendDown; r++) {
                          // Kiểm tra tất cả các cột trong vùng merge ngang
                          for (let c = startCol; c < startCol + colSpan && canExtendDown; c++) {
                            const cellBelow = previewData.allRows[r]?.[c];
                            // Nếu cell bên dưới có giá trị khác với cell gốc, không merge dọc
                            if (cellBelow && String(cellBelow).trim() !== '' && 
                                String(cellBelow).trim() !== String(cellValue).trim()) {
                              canExtendDown = false;
                            }
                          }
                        }
                        
                        // Nếu có thể merge dọc (các dòng dưới cùng tên hoặc trống), cập nhật rowSpan
                        if (canExtendDown && headerRowCount > 1) {
                          const newRowSpan = headerRowCount - startRow;
                          cellMergeInfo.set(`${startRow}-${startCol}`, { rowSpan: newRowSpan, colSpan });
                          
                          // Đánh dấu tất cả các cells trong vùng merge (trừ cell gốc)
                          for (let r = startRow; r < startRow + newRowSpan; r++) {
                            for (let c = startCol; c < startCol + colSpan; c++) {
                              if (r !== startRow || c !== startCol) {
                                mergedCells.add(`${r}-${c}`);
                              }
                            }
                          }
                        }
                      });
                    }
                    
                    // Tự động merge các cột không phân cấp theo chiều dọc (cột đơn lẻ)
                    // Duyệt qua tất cả các cột
                    if (headerRowCount > 1 && previewData.allRows[0]) {
                      const maxCols = Math.max(...previewData.allRows.slice(0, headerRowCount).map(r => r.length));
                      
                      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
                        // Kiểm tra xem cột này đã có merge từ Excel chưa hoặc đã được xử lý chưa
                        let hasExcelMerge = false;
                        for (let r = 0; r < headerRowCount; r++) {
                          if (cellMergeInfo.has(`${r}-${colIndex}`) || mergedCells.has(`${r}-${colIndex}`)) {
                            hasExcelMerge = true;
                            break;
                          }
                        }
                        
                        // Nếu chưa có merge từ Excel, tự động merge theo chiều dọc
                        if (!hasExcelMerge) {
                          // Tìm dòng đầu tiên có giá trị cho cột này
                          let firstRowWithValue = -1;
                          let firstCellValue = null;
                          
                          for (let r = 0; r < headerRowCount; r++) {
                            const cell = previewData.allRows[r]?.[colIndex];
                            if (cell !== undefined && cell !== null && String(cell).trim() !== '') {
                              firstRowWithValue = r;
                              firstCellValue = cell;
                              break;
                            }
                          }
                          
                          // Chỉ merge nếu tìm thấy giá trị và có thể merge từ dòng đó xuống cuối header
                          if (firstRowWithValue >= 0 && firstRowWithValue < headerRowCount - 1) {
                            // Kiểm tra xem các dòng dưới có cùng giá trị hoặc trống không
                            let canMerge = true;
                            for (let r = firstRowWithValue + 1; r < headerRowCount; r++) {
                              const cellBelow = previewData.allRows[r]?.[colIndex];
                              if (cellBelow !== undefined && cellBelow !== null && String(cellBelow).trim() !== '') {
                                // Nếu có giá trị khác, không merge
                                if (String(cellBelow).trim() !== String(firstCellValue).trim()) {
                                  canMerge = false;
                                  break;
                                }
                              }
                            }
                            
                            if (canMerge) {
                              // Set rowSpan cho cell đầu tiên có giá trị
                              const mergeRowSpan = headerRowCount - firstRowWithValue;
                              cellMergeInfo.set(`${firstRowWithValue}-${colIndex}`, { rowSpan: mergeRowSpan, colSpan: 1 });
                              
                              // Đánh dấu các cells bên dưới là merged
                              for (let r = firstRowWithValue + 1; r < headerRowCount; r++) {
                                mergedCells.add(`${r}-${colIndex}`);
                              }
                            }
                          }
                        }
                      }
                    }
                    
                    // Render header rows
                    return previewData.allRows.slice(0, headerRowCount).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, colIndex: number) => {
                          const cellKey = `${rowIndex}-${colIndex}`;
                          
                          // Bỏ qua cells bị merged
                          if (mergedCells.has(cellKey)) {
                            return null;
                          }
                          
                          // Lấy thông tin merge nếu có
                          const mergeInfo = cellMergeInfo.get(cellKey);
                          
                          return (
                            <th
                              key={colIndex}
                              rowSpan={mergeInfo?.rowSpan || 1}
                              colSpan={mergeInfo?.colSpan || 1}
                              style={{
                                border: '1px solid #d0d0d0',
                                padding: '6px 8px',
                                backgroundColor: '#2191b0',
                                color: 'white',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                minWidth: '100px',
                                maxWidth: '250px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '10pt',
                                verticalAlign: 'middle'
                              }}
                              title={cell !== null && cell !== undefined ? String(cell) : ''}
                            >
                              {cell !== null && cell !== undefined ? String(cell) : ''}
                            </th>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </thead>
                <tbody>
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{
                            border: '1px solid #d0d0d0',
                            padding: '5px 8px',
                            backgroundColor: rowIndex % 2 === 0 ? 'white' : '#F2F2F2',
                            textAlign: cellIndex === 0 ? 'center' : 'left',
                            minWidth: '100px',
                            maxWidth: '250px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '10pt'
                          }}
                          title={cell !== null && cell !== undefined ? String(cell) : ''}
                        >
                          {cell !== null && cell !== undefined ? String(cell) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              
              {previewData.rows.length === 0 && (
                <div className="text-center py-8 sm:py-12 text-sm text-gray-500 bg-white rounded shadow">
                  Không có dữ liệu
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-300 p-2 sm:p-3 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 flex-shrink-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                <span className="font-bold text-blue-600">
                  {(() => {
                    // Lấy STT lớn nhất từ cột đầu tiên
                    let maxSTT = 0;
                    previewData.rows.forEach(row => {
                      const sttValue = row[0];
                      if (sttValue !== null && sttValue !== undefined) {
                        const sttNum = Number(sttValue);
                        if (!isNaN(sttNum) && sttNum > maxSTT) {
                          maxSTT = sttNum;
                        }
                      }
                    });
                    return maxSTT;
                  })()}
                </span> học sinh
                <span className="text-gray-500 ml-2 hidden md:inline">| Scroll để xem toàn bộ</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 sm:flex-none px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-xs sm:text-sm"
                >
                  Đóng
                </button>
                <button
                  onClick={handleDownloadFromPreview}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Tải xuống</span>
                  <span className="xs:hidden">Tải xuống</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Report Modal */}
      <HealthReportModal
        isOpen={isHealthReportModalOpen}
        onClose={() => setIsHealthReportModalOpen(false)}
        students={[]}
        campaignId={selectedCampaignId || undefined}
      />
    </div>
  );
}
