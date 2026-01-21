import {
  Search,
  UserPlus,
  FileDown,
  Settings,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AddStudentModal } from "./AddStudentModal";
import { EditStudentModal } from "./EditStudentModal";
import { ViewStudentModal } from "./ViewStudentModal";
import { ExamPeriodModal } from "./ExamPeriodModal";
import { HealthReportModal } from "./HealthReportModal";
import { ImportExcelModal } from "./ImportExcelModal";
import studentService, {
  Student,
  MedicalResultDetail,
} from "../services/studentService";
import examPeriodService, {
  ExamPeriod,
} from "../services/examPeriodService";
import medicalResultService from "../services/medicalResultService";
import campaignMedicalConfigService, {
  CampaignMedicalConfigSubResponseDTO,
  MedicalIndicatorResponseDTO,
  MedicalSubIndicatorResponseDTO,
} from "../services/campaignMedicalConfigService";
import schoolService, { SchoolResponseDTO } from "../services/schoolService";
import schoolClassService, { SchoolClassResponseDTO } from "../services/schoolClassService";

interface StudentTableProps {
  campaignId: number;
  campaignName: string;
  onBack: () => void;
}

export function StudentTable({ campaignId, campaignName, onBack }: StudentTableProps) {
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedStudents, setSelectedStudents] = useState<
    string[]
  >([]);
  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] =
    useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExamPeriodModalOpen, setIsExamPeriodModalOpen] =
    useState(false);
  const [isHealthReportModalOpen, setIsHealthReportModalOpen] =
    useState(false);
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] =
    useState(false);
  const [isExportExcelModalOpen, setIsExportExcelModalOpen] =
    useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] =
    useState<boolean>(true);
  
  // Filter và pagination states
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Load schools khi component mount
  useEffect(() => {
    loadSchools();
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

  const loadSchools = async () => {
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (err) {
      console.error('Error loading schools:', err);
    }
  };

  const loadClasses = async (schoolId: number) => {
    try {
      const data = await schoolClassService.getSchoolClassesBySchool(schoolId);
      setClasses(data);
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  // Load danh sách học sinh khi component mount hoặc filter thay đổi
  useEffect(() => {
    // Debounce search: chờ 500ms sau khi user ngừng gõ
    const timeoutId = setTimeout(() => {
      loadStudents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [campaignId, searchKeyword, selectedSchoolId, selectedClassId, currentPage, pageSize]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudentsByCampaign(
        campaignId, 
        searchKeyword || null,
        selectedSchoolId,
        selectedClassId,
        currentPage,
        pageSize
      );
      console.log("Loaded students data:", data);
      // Debug: Log className của học sinh đầu tiên
      if (data.content && data.content.length > 0) {
        console.log("First student:", data.content[0]);
        console.log("First student className:", data.content[0].className);
      }
      setStudents(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
      setBackendConnected(true);
    } catch (err: any) {
      // Chỉ log lỗi nếu không phải Network Error (backend chưa chạy)
      if (err.code !== "ERR_NETWORK") {
        console.error("Error loading students:", err);
      }
      setBackendConnected(false);
      // Không hiển thị lỗi ngay, để user có thể sử dụng các chức năng khác
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (studentData: any) => {
    try {
      // studentData đã được format đúng từ AddStudentModal
      const newStudent = await studentService.createStudent(studentData);
      setStudents((prev) => [newStudent, ...prev]);
      setIsAddModalOpen(false);
      toast.success('Thêm học sinh thành công!');
    } catch (err: any) {
      toast.error('Không thể thêm học sinh');
      throw err;
    }
  };

  const handleHealthDataChange = async (
    studentId: number,
    indicatorNameOrSubName: string,
    value: boolean,
  ) => {
    // Tìm medical result detail ID từ student
    const student = students.find(s => s.id === studentId);
    if (!student?.medicalResults || student.medicalResults.length === 0) {
      toast.error('Không tìm thấy thông tin khám của học sinh');
      return;
    }

    const medicalResultDetail = student.medicalResults.find(
      (result) =>
        result.medicalIndicatorName === indicatorNameOrSubName ||
        result.medicalSubIndicatorName === indicatorNameOrSubName
    );

    if (!medicalResultDetail?.id) {
      toast.error('Không tìm thấy ID của kết quả khám');
      return;
    }

    // Cập nhật UI ngay lập tức (optimistic update)
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            medicalResults: student.medicalResults?.map(
              (result) => {
                if (
                  result.medicalIndicatorName === indicatorNameOrSubName ||
                  result.medicalSubIndicatorName === indicatorNameOrSubName
                ) {
                  return {
                    ...result,
                    resultValue: value,
                  };
                }
                return result;
              },
            ),
          };
        }
        return student;
      }),
    );

    // Gọi API cập nhật vào database
    try {
      await medicalResultService.updateMedicalResultDetail(medicalResultDetail.id, value);
      // toast.success('Cập nhật kết quả khám thành công');
    } catch (err: any) {
      console.error('Error updating medical result:', err);
      toast.error('Không thể cập nhật kết quả khám');
      // Rollback UI nếu API thất bại
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id === studentId) {
            return {
              ...student,
              medicalResults: student.medicalResults?.map(
                (result) => {
                  if (
                    result.medicalIndicatorName === indicatorNameOrSubName ||
                    result.medicalSubIndicatorName === indicatorNameOrSubName
                  ) {
                    return {
                      ...result,
                      resultValue: !value, // Rollback về giá trị cũ
                    };
                  }
                  return result;
                },
              ),
            };
          }
          return student;
        }),
      );
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await medicalResultService.exportExcel(
        campaignId
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ket-qua-kham-suc-khoe-campaign-${campaignId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi xuất Excel",
      );
    }
  };

  const handleImportSuccess = () => {
    loadStudents(campaignId, searchKeyword);
  };

  // Helper function để lấy giá trị kết quả khám từ medicalResults
  // Chỉ trả về true khi resultValue === true, còn lại (false hoặc undefined) đều trả về false
  const getMedicalResultValue = (
    student: Student,
    indicatorName: string,
  ): boolean => {
    if (
      !student.medicalResults ||
      student.medicalResults.length === 0
    ) {
      return false;
    }
    const result = student.medicalResults.find(
      (r) =>
        r.medicalIndicatorName === indicatorName ||
        r.medicalSubIndicatorName === indicatorName,
    );
    
    // Debug log
    if (result) {
      console.log(`Found result for ${indicatorName}:`, result);
    }
    
    // Chỉ return true khi resultValue === true (không dùng || false để tránh convert undefined thành false)
    return result?.resultValue === true;
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedStudents((prev) =>
      prev.length === students.length
        ? []
        : students.map((s) => String(s.id || '')),
    );
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
  };

  const handleSave = (updatedStudent: any) => {
    // Here you would typically update the student in your data source
    console.log("Saving student:", updatedStudent);
    toast.success('Cập nhật học sinh thành công!');
    setEditingStudent(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-screen flex flex-col overflow-hidden max-w-full">
      <div className="p-4 md:p-6 flex-shrink-0 overflow-x-hidden">
        {/* Back button and campaign info */}
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách đợt khám</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="text-lg font-semibold text-blue-600">
            {campaignName}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1>Danh sách học sinh</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <FileDown className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => setIsImportExcelModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FileDown className="w-4 h-4" />
              Import Excel
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              Thêm học sinh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error}
          </div>
        )}

        {!backendConnected && (
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded flex items-start gap-3">
            <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">!</span>
            </div>
            <div className="flex-1 text-sm text-yellow-800">
              <p className="mb-1">
                <strong>Backend chưa kết nối</strong>
              </p>
              <p className="text-xs">
                App đang chạy ở chế độ demo. Để sử dụng đầy đủ
                chức năng:
              </p>
              <ul className="text-xs mt-1 ml-4 list-disc space-y-0.5">
                <li>Chạy backend Java trên port 8080</li>
                <li>
                  Kiểm tra file{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    .env
                  </code>{" "}
                  có đúng URL:{" "}
                  <code className="bg-yellow-100 px-1 rounded">
                    http://localhost:8080/api
                  </code>
                </li>
                <li>Cấu hình CORS trong backend</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mb-4">
          {/* Filter row: Search + Trường + Lớp + Hiển thị cùng 1 hàng */}
          <div className="flex flex-wrap gap-3 items-end">
            {/* Tìm kiếm */}
            <div className="w-48">
              <label className="block text-sm text-gray-600 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm theo tên, CCCD..."
                  className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Trường học */}
            <div className="w-48">
              <label className="block text-sm text-gray-600 mb-1">
                Trường học
              </label>
              <select
                value={selectedSchoolId || ''}
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(0); // Reset về trang đầu
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.schoolName}
                  </option>
                ))}
              </select>
            </div>

            {/* Lớp học */}
            <div className="w-48">
              <label className="block text-sm text-gray-600 mb-1">
                Lớp học
              </label>
              <select
                value={selectedClassId || ''}
                onChange={(e) => {
                  setSelectedClassId(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(0); // Reset về trang đầu
                }}
                disabled={!selectedSchoolId}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm disabled:bg-gray-100"
              >
                <option value="">Tất cả</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className} - Khối {cls.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Số lượng hiển thị */}
            <div className="w-40">
              <label className="block text-sm text-gray-600 mb-1">
                Hiển thị
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0); // Reset về trang đầu
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={1000}>1000</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div 
            className="student-table-container bg-white rounded-lg shadow w-full" 
            style={{
              height: 'calc(100vh - 420px)',
              minHeight: '400px',
              maxHeight: '800px',
              maxWidth: '100%',
              overflowX: 'scroll',
              overflowY: 'scroll',
              scrollbarWidth: 'auto',
              scrollbarColor: '#0EA5E9 #E0F2FE'
            }}
          >
            <style>{`
              /* Custom scrollbar for student table */
              .student-table-container::-webkit-scrollbar {
                width: 18px;
                height: 18px;
              }
              .student-table-container::-webkit-scrollbar-track {
                background: #E0F2FE;
                border-radius: 0;
              }
              .student-table-container::-webkit-scrollbar-thumb {
                background: #0EA5E9;
                border-radius: 0;
                border: 3px solid #E0F2FE;
              }
              .student-table-container::-webkit-scrollbar-thumb:hover {
                background: #0284C7;
              }
              .student-table-container::-webkit-scrollbar-corner {
                background: #E0F2FE;
              }
            `}</style>
            <div>
              <table className="w-full border-collapse text-xs">
              <thead>
                {/* Row 1: Group headers + static columns */}
                <tr
                  className="text-white"
                  style={{ backgroundColor: "#2191b0" }}
                >
                  <th
                    className="border border-gray-300 p-2 sticky left-0 w-[50px]"
                    style={{ backgroundColor: "#2191b0", zIndex: 20 }}
                    rowSpan={3}
                  >
                    TT
                  </th>
                  <th
                    className="border border-gray-300 p-2 sticky"
                    style={{ backgroundColor: "#2191b0", left: "50px", zIndex: 19, width: "250px", minWidth: "250px" }}
                    rowSpan={3}
                  >
                    Họ và tên học sinh
                  </th>

                  {/* Ngày sinh */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={2}
                  >
                    Ngày Sinh
                  </th>

                  {/* Lớp học */}
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "120px", minWidth: "120px" }}
                    rowSpan={3}
                  >
                    Lớp học
                  </th>

                  {/* Trường học */}
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "250px", minWidth: "250px" }}
                    rowSpan={3}
                  >
                    Trường học
                  </th>

                  {/* Địa chỉ */}
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "250px", minWidth: "250px" }}
                    rowSpan={3}
                  >
                    Địa chỉ
                  </th>

                  {/* Căn cước công dân */}
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "150px", minWidth: "150px" }}
                    rowSpan={3}
                  >
                    Căn cước công dân
                  </th>

                  {/* Chiều cao và Cân nặng */}
                  <th
                    className="border border-gray-300 p-2"
                    rowSpan={3}
                  >
                    Cao (cm)
                  </th>
                  <th
                    className="border border-gray-300 p-2"
                    rowSpan={3}
                  >
                    Cân (kg)
                  </th>

                  {/* Hardcoded medical groups */}
                  <th className="border border-gray-300 p-2" colSpan={3}>Dinh dưỡng</th>
                  <th className="border border-gray-300 p-2" colSpan={8}>Mắt</th>
                  <th className="border border-gray-300 p-2" colSpan={4}>Răng</th>
                  <th className="border border-gray-300 p-2" colSpan={3}>Tai mũi họng</th>
                  <th className="border border-gray-300 p-2" colSpan={3}>Cơ xương khớp</th>
                  <th className="border border-gray-300 p-2" colSpan={3}>Da liễu</th>
                  <th className="border border-gray-300 p-2" colSpan={2}>Tâm thần kinh</th>
                  <th className="border border-gray-300 p-2" colSpan={5}>Nội khoa</th>

                  {/* Ghi chú */}
                  <th
                    className="border border-gray-300 p-2"
                    style={{ width: "150px", minWidth: "150px" }}
                    rowSpan={3}
                  >
                    Ghi chú
                  </th>
                </tr>

                {/* Row 2: Gender headers + indicator headers (for indicators without sub-indicators) or indicator names (for those with sub) */}
                <tr
                  className="text-white"
                  style={{ backgroundColor: "#2191b0" }}
                >
                  {/* Gender */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>
                    Nam
                  </th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>
                    Nữ
                  </th>

                  {/* Dinh dưỡng (3) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Suy Dinh Dưỡng</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Thừa cân</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Béo Phì</th>
                  
                  {/* Mắt (8 = 6 simple + 1 with 2 subs) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Viêm kết mạc</th>
                  <th className="border border-gray-300 p-1" colSpan={2}>Cận thị</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Viễn Thị</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Loạn thị</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Lác</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Đục thể thủy tinh</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Tật Khúc Xạ</th>
                  
                  {/* Răng (4) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Sâu răng</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Mất răng</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Viêm lợi</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Răng đã hàn</th>
                  
                  {/* Tai mũi họng (3) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Viêm mũi họng</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Viêm tai giữa</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác (TMH)</th>
                  
                  {/* Cơ xương khớp (3) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Cong cột sống</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Vẹo cột sống</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác (CXK)</th>
                  
                  {/* Da liễu (3) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Viêm da</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Vảy nến</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác (DL)</th>
                  
                  {/* Tâm thần kinh (2) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Rối loạn tâm thần</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Tâm thần phân liệt</th>
                  
                  {/* Nội khoa (5) */}
                  <th className="border border-gray-300 p-1" rowSpan={2}>Hen phế quản</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Thấp tim</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Bướu cổ</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Dị tật bẩm sinh</th>
                  <th className="border border-gray-300 p-1" rowSpan={2}>Bệnh khác (NK)</th>
                </tr>

                {/* Row 3: Sub-indicator headers (only for Cận thị) */}
                <tr
                  className="text-white"
                  style={{ backgroundColor: "#2191b0" }}
                >
                  <th className="border border-gray-300 p-1">Đúng số</th>
                  <th className="border border-gray-300 p-1">Chưa đúng số</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className={
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }
                  >
                    <td className="border border-gray-300 p-2 text-center sticky left-0 bg-inherit w-[50px]" style={{ zIndex: 10 }}>
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 p-2 text-left sticky bg-inherit" style={{ left: "50px", zIndex: 9 }}>
                      {student.fullName}
                    </td>

                    {/* Ngày sinh */}
                    <td className="border border-gray-300 p-2 text-center">
                      {student.gender === "MALE"
                        ? student.dob
                        : ""}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {student.gender === "FEMALE"
                        ? student.dob
                        : ""}
                    </td>

                    {/* Lớp học */}
                    <td className="border border-gray-300 p-2 text-left text-xs">
                      {student.className || "chua co du lieu"}
                    </td>

                    {/* Trường học */}
                    <td className="border border-gray-300 p-2 text-left text-xs">
                      {student.schoolName || ""}
                    </td>

                    {/* Địa chỉ */}
                    <td className="border border-gray-300 p-2 text-left text-xs">
                      {student.address ||
                        "Khối 6 Phường Đồi Cung"}
                    </td>

                    {/* Căn cước công dân */}
                    <td className="border border-gray-300 p-2 text-left">
                      {student.identityNumber || ""}
                    </td>

                    {/* Cân Cao */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="text"
                        value={student.weight || ""}
                        onChange={(e) => {
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? {
                                    ...s,
                                    weight: e.target.value,
                                  }
                                : s,
                            ),
                          );
                        }}
                        className="w-12 text-center border-0 bg-transparent"
                        placeholder="0"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="text"
                        value={student.height || ""}
                        onChange={(e) => {
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? {
                                    ...s,
                                    height: e.target.value,
                                  }
                                : s,
                            ),
                          );
                        }}
                        className="w-12 text-center border-0 bg-transparent"
                        placeholder="0"
                      />
                    </td>

                    {/* Dinh dưỡng */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Suy Dinh Dưỡng")} onChange={(e) => handleHealthDataChange(student.id!, "Suy Dinh Dưỡng", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Thừa cân")} onChange={(e) => handleHealthDataChange(student.id!, "Thừa cân", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Béo Phì")} onChange={(e) => handleHealthDataChange(student.id!, "Béo Phì", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Mắt */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Viêm kết mạc")} onChange={(e) => handleHealthDataChange(student.id!, "Viêm kết mạc", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Đúng số")} onChange={(e) => handleHealthDataChange(student.id!, "Đúng số", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Chưa đúng số")} onChange={(e) => handleHealthDataChange(student.id!, "Chưa đúng số", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Viễn Thị")} onChange={(e) => handleHealthDataChange(student.id!, "Viễn Thị", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Loạn thị")} onChange={(e) => handleHealthDataChange(student.id!, "Loạn thị", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Lác")} onChange={(e) => handleHealthDataChange(student.id!, "Lác", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Đục thể thủy tinh")} onChange={(e) => handleHealthDataChange(student.id!, "Đục thể thủy tinh", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Tật Khúc Xạ")} onChange={(e) => handleHealthDataChange(student.id!, "Tật Khúc Xạ", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Răng */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Sâu răng")} onChange={(e) => handleHealthDataChange(student.id!, "Sâu răng", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Mất răng")} onChange={(e) => handleHealthDataChange(student.id!, "Mất răng", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Viêm lợi")} onChange={(e) => handleHealthDataChange(student.id!, "Viêm lợi", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Răng đã hàn")} onChange={(e) => handleHealthDataChange(student.id!, "Răng đã hàn", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Tai mũi họng */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Viêm mũi họng")} onChange={(e) => handleHealthDataChange(student.id!, "Viêm mũi họng", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Viêm tai giữa")} onChange={(e) => handleHealthDataChange(student.id!, "Viêm tai giữa", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Bệnh khác")} onChange={(e) => handleHealthDataChange(student.id!, "Bệnh khác", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Cơ xương khớp */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Cong cột sống")} onChange={(e) => handleHealthDataChange(student.id!, "Cong cột sống", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Vẹo cột sống")} onChange={(e) => handleHealthDataChange(student.id!, "Vẹo cột sống", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Bệnh khác")} onChange={(e) => handleHealthDataChange(student.id!, "Bệnh khác", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Da liễu */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Viêm da")} onChange={(e) => handleHealthDataChange(student.id!, "Viêm da", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Vảy nến")} onChange={(e) => handleHealthDataChange(student.id!, "Vảy nến", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Bệnh khác")} onChange={(e) => handleHealthDataChange(student.id!, "Bệnh khác", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Tâm thần kinh */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Rối loạn tâm thần")} onChange={(e) => handleHealthDataChange(student.id!, "Rối loạn tâm thần", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Tâm thần phân liệt")} onChange={(e) => handleHealthDataChange(student.id!, "Tâm thần phân liệt", e.target.checked)} className="w-4 h-4" />
                    </td>
                    
                    {/* Nội khoa */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Hen phế quản")} onChange={(e) => handleHealthDataChange(student.id!, "Hen phế quản", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Thấp tim")} onChange={(e) => handleHealthDataChange(student.id!, "Thấp tim", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Bướu cổ")} onChange={(e) => handleHealthDataChange(student.id!, "Bướu cổ", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Dị tật bẩm sinh")} onChange={(e) => handleHealthDataChange(student.id!, "Dị tật bẩm sinh", e.target.checked)} className="w-4 h-4" />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input type="checkbox" checked={getMedicalResultValue(student, "Bệnh khác")} onChange={(e) => handleHealthDataChange(student.id!, "Bệnh khác", e.target.checked)} className="w-4 h-4" />
                    </td>

                    {/* Ghi chú */}
                    <td className="border border-gray-300 p-2" style={{ width: "150px", minWidth: "150px" }}>
                      <input
                        type="text"
                        value={student.notifyFamily || ""}
                        onChange={(e) => {
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === student.id
                                ? {
                                    ...s,
                                    notifyFamily:
                                      e.target.value,
                                  }
                                : s,
                            ),
                          );
                        }}
                        className="w-full text-xs border-0 bg-transparent"
                        placeholder="Nhập ghi chú..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Hiển thị {students.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} của {totalElements}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Đầu
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Trước
            </button>
            <span className="text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Sau
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cuối
            </button>
          </div>
        </div>
      </div>

      <EditStudentModal
        student={editingStudent as any}
        onClose={() => setEditingStudent(null)}
        onSave={handleSave}
      />

      <ViewStudentModal
        student={viewingStudent as any}
        onClose={() => setViewingStudent(null)}
      />

      <ExamPeriodModal
        isOpen={isExamPeriodModalOpen}
        onClose={() => setIsExamPeriodModalOpen(false)}
      />

      <HealthReportModal
        isOpen={isHealthReportModalOpen}
        onClose={() => setIsHealthReportModalOpen(false)}
        students={students}
        campaignId={campaignId}
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
        campaignId={campaignId}
      />

      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        campaignId={campaignId}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}