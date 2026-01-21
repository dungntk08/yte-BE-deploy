import { X, Download, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../services/api';

interface DiseaseReportDTO {
  diseaseName: string;
  totalCase: number;
}

interface SchoolResponseDTO {
  id: number;
  schoolCode?: string;
  schoolName: string;
  address?: string;
}

interface MedicalCampaignResponseDTO {
  id: number;
  school: SchoolResponseDTO;
  schoolYear: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  status: string;
  note?: string;
  totalStudents: number;
  totalStudentsExamined: number;
}

interface MedicalResultReport {
  medicalCampaignResponseDTO: MedicalCampaignResponseDTO;
  diseaseReports: DiseaseReportDTO[];
  // Thừa cân
  overWeightCount: number;
  // Suy dinh dưỡng
  underWeightCount: number;
  // Béo phì
  obesityCount: number;
  // Tỷ lệ khám
  averageExamined: number;
}

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
  campaignId?: number;
}

export function HealthReportModal({ isOpen, onClose, students, campaignId }: HealthReportModalProps) {
  const [reportData, setReportData] = useState<MedicalResultReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && campaignId) {
      loadReportData(campaignId);
    }
  }, [isOpen, campaignId]);

  const loadReportData = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<MedicalResultReport>(
        `/medical-result-details/medicalReport/${campaignId}`
      );
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error loading report data:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Use data from API if available, otherwise fallback to student counting
  const campaign = reportData?.medicalCampaignResponseDTO;
  const diseaseReports = reportData?.diseaseReports || [];

  const totalStudents = campaign?.totalStudents || students.length;
  const examinedStudents = campaign?.totalStudentsExamined || students.filter(s => s.status === 'Đã khám').length;
  const examinationRate = reportData?.averageExamined?.toFixed(1) || (totalStudents > 0 ? ((examinedStudents / totalStudents) * 100).toFixed(1) : '0');

  // Nutrition data from API
  const nutritionData = {
    underWeight: reportData?.underWeightCount || 0,
    overWeight: reportData?.overWeightCount || 0,
    obesity: reportData?.obesityCount || 0,
  };

  // Split disease reports into two columns
  const halfLength = Math.ceil(diseaseReports.length / 2);
  const leftColumnReports = diseaseReports.slice(0, halfLength);
  const rightColumnReports = diseaseReports.slice(halfLength);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This will trigger the print dialog which can save as PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Actions */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between print:hidden">
          <h2>Biên bản kết quả khám sức khỏe</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              In biên bản
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Tải PDF
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải dữ liệu báo cáo...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-600">{error}</div>
            </div>
          ) : (
          <div className="max-w-4xl mx-auto bg-white" id="report-content">
            {/* Header */}
            <div className="flex justify-between mb-8 text-center">
              <div className="flex-1">
                <div className="uppercase">UBND PHƯỜNG BỐ ĐỀ</div>
                <div className="uppercase underline">TRẠM Y TẾ</div>
              </div>
              <div className="flex-1">
                <div className="uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="uppercase underline">Độc lập-Tự do-Hạnh phúc</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="uppercase mb-2">BIÊN BẢN</h1>
              <p>Thông nhất kết quả khám, kiểm tra sức khỏe học sinh</p>
              <p>năm học {campaign?.schoolYear || '2025 - 2026'}</p>
            </div>

            {/* School Information */}
            <div className="mb-6 space-y-2">
              <div>1. Tên trường: {campaign?.school?.schoolName || 'THCS Bố Đề'}</div>
              <div>2. Địa chỉ: {campaign?.school?.address || ''}</div>
              <div>3. Tổng số học sinh: {totalStudents} học sinh</div>
              <div>
                4. Tổng số học sinh được khám: {examinedStudents} học sinh 
                <span className="ml-4">Tỷ lệ khám đạt: {examinationRate} %</span>
              </div>
            </div>

            {/* Statistics Table */}
            <div className="mb-4">
              <p className="italic mb-2">* Trong đó:</p>
              <table className="w-full border-collapse border border-gray-900 text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-900 p-2 bg-gray-50">Tên bệnh</th>
                    <th className="border border-gray-900 p-2 bg-gray-50 w-24">Số mắc</th>
                    <th className="border border-gray-900 p-2 bg-gray-50">Tên bệnh</th>
                    <th className="border border-gray-900 p-2 bg-gray-50 w-24">Số mắc</th>
                  </tr>
                </thead>
                <tbody>
                  {leftColumnReports.map((leftReport, index) => {
                    const rightReport = rightColumnReports[index];
                    return (
                      <tr key={index}>
                        <td className="border border-gray-900 p-2">{leftReport.diseaseName}</td>
                        <td className="border border-gray-900 p-2 text-center">{leftReport.totalCase}</td>
                        {rightReport ? (
                          <>
                            <td className="border border-gray-900 p-2">{rightReport.diseaseName}</td>
                            <td className="border border-gray-900 p-2 text-center">{rightReport.totalCase}</td>
                          </>
                        ) : (
                          <>
                            <td className="border border-gray-900 p-2"></td>
                            <td className="border border-gray-900 p-2"></td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Nutrition Status */}
            <div className="mb-8">
              <p className="italic">* Tình trạng dinh dưỡng:</p>
              <div className="flex gap-4 ml-4">
                <span>- Suy dinh dưỡng: {nutritionData.underWeight}</span>
                <span>- Thừa cân: {nutritionData.overWeight}</span>
                <span>- Béo phì: {nutritionData.obesity}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between text-center mt-16 page-break-inside-avoid">
              <div className="flex-1">
                <p className="italic">Ngày ... tháng ... năm 202...</p>
                <p className="uppercase mb-20">TM.BAN GIÁM HIỆU TRƯỜNG</p>
              </div>
              <div className="flex-1">
                <p className="italic">Ngày ... tháng ... năm 202...</p>
                <p className="uppercase mb-20">TM. ĐOÀN KHÁM</p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
