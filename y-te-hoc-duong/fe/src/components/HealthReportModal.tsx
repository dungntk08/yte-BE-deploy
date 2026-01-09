import { X, Download, Printer } from 'lucide-react';

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
}

export function HealthReportModal({ isOpen, onClose, students }: HealthReportModalProps) {
  if (!isOpen) return null;

  // Calculate statistics
  const totalStudents = students.length;
  const examinedStudents = students.filter(s => s.status === 'Đã khám').length;
  const examinationRate = totalStudents > 0 ? ((examinedStudents / totalStudents) * 100).toFixed(1) : 0;

  // Count health issues
  const countHealthIssue = (field: string) => {
    return students.filter(s => s.healthData?.[field] === true).length;
  };

  // Count nutrition status
  const countNutrition = {
    sdd: countHealthIssue('sdd'),
    overweight: countHealthIssue('overweight'),
    obesity: countHealthIssue('obesity'),
  };

  const healthStats = [
    { name: 'Cận thị đúng số', count: countHealthIssue('myopia_correct') },
    { name: 'Cận thị chưa đúng số', count: countHealthIssue('myopia_incorrect') },
    { name: 'Viễn thị', count: countHealthIssue('hyperopia') },
    { name: 'Loạn thị', count: countHealthIssue('astigmatism') },
    { name: 'Lác', count: countHealthIssue('strabismus') },
    { name: 'TD tật khúc xạ', count: countHealthIssue('refractive_error') },
    { name: 'Viêm kết mạc', count: countHealthIssue('vkm') },
    { name: 'Viêm mũi họng', count: countHealthIssue('nose_inflammation') + countHealthIssue('throat_inflammation') },
    { name: 'Viêm tai giữa', count: countHealthIssue('ear_infection') },
    { name: 'Sâu răng', count: countHealthIssue('cavities') },
    { name: 'Mất răng', count: 0 },
    { name: 'Răng đã hàn', count: 0 },
    { name: 'Viêm lợi', count: countHealthIssue('gingivitis') },
  ];

  const healthStats2 = [
    { name: 'Cong cột sống', count: countHealthIssue('scoliosis') },
    { name: 'Vẹo cột sống', count: 0 },
    { name: 'Bệnh khác về cơ xương khớp', count: countHealthIssue('flat_feet') + countHealthIssue('limb_deformity') },
    { name: 'Viêm da', count: countHealthIssue('eczema') + countHealthIssue('fungal_infection') },
    { name: 'Vẩy nến', count: 0 },
    { name: 'Bệnh khác về da liễu', count: countHealthIssue('skin_allergy') },
    { name: 'Tâm thần phân liệt', count: 0 },
    { name: 'Rối loạn tâm thần', count: countHealthIssue('anxiety') + countHealthIssue('depression') + countHealthIssue('behavioral_disorder') },
    { name: 'Hẹn phế quản', count: 0 },
    { name: 'Thấp tim', count: countHealthIssue('heart_disease') },
    { name: 'Bướu cổ', count: 0 },
    { name: 'Dị tật bẩm sinh', count: 0 },
    { name: 'Bệnh khác về nội khoa', count: countHealthIssue('respiratory_disease') + countHealthIssue('digestive_disease') },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This will trigger the print dialog which can save as PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
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
              <p>năm học 2025 - 2026</p>
            </div>

            {/* School Information */}
            <div className="mb-6 space-y-2">
              <div>1. Tên trường: THCS Bố Đề</div>
              <div>2. Tổng số lớp: 20 lớp</div>
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
                  {healthStats.map((stat, index) => (
                    <tr key={index}>
                      <td className="border border-gray-900 p-2">{stat.name}</td>
                      <td className="border border-gray-900 p-2 text-center">{stat.count}</td>
                      {healthStats2[index] ? (
                        <>
                          <td className="border border-gray-900 p-2">{healthStats2[index].name}</td>
                          <td className="border border-gray-900 p-2 text-center">{healthStats2[index].count}</td>
                        </>
                      ) : (
                        <>
                          <td className="border border-gray-900 p-2"></td>
                          <td className="border border-gray-900 p-2"></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Nutrition Status */}
            <div className="mb-8">
              <p className="italic">* Tình trạng dinh dưỡng:</p>
              <div className="flex gap-4 ml-4">
                <span>- Nhẹ cân, thấp còi: {countNutrition.sdd}</span>
                <span>- Thừa cân: {countNutrition.overweight}</span>
                <span>- Béo phì: {countNutrition.obesity}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between text-center mt-16">
              <div className="flex-1">
                <p className="italic">Ngày ... tháng ... năm 202...</p>
                <p className="uppercase mb-16">TM.BAN GIÁM HIỆU TRƯỜNG</p>
              </div>
              <div className="flex-1">
                <p className="italic">Ngày ... tháng ... năm 202...</p>
                <p className="uppercase mb-16">TM. ĐOÀN KHÁM</p>
              </div>
            </div>
          </div>
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
        }
      `}</style>
    </div>
  );
}
