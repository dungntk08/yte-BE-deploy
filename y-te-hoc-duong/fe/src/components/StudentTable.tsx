import {
  Search,
  UserPlus,
  FileDown,
  Settings,
  FileText,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
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

export function StudentTable() {
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
  const [students, setStudents] = useState<Student[]>([]);
  const [examPeriods, setExamPeriods] = useState<ExamPeriod[]>(
    [],
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] =
    useState<boolean>(true);

  // Load danh sách đợt khám khi component mount
  useEffect(() => {
    loadExamPeriods();
  }, []);

  // Load danh sách học sinh khi chọn đợt khám
  useEffect(() => {
    if (selectedCampaignId) {
      loadStudents(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const loadExamPeriods = async () => {
    try {
      const periods = await examPeriodService.getExamPeriods();
      setExamPeriods(periods);
      setBackendConnected(true);
      // Tự động chọn đợt khám đầu tiên nếu có
      if (periods.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(periods[0].id!);
      }
    } catch (err: any) {
      // Chỉ log lỗi nếu không phải Network Error (backend chưa chạy)
      if (err.code !== "ERR_NETWORK") {
        console.error("Error loading exam periods:", err);
      }
      setBackendConnected(false);

      // Sử dụng mock data khi backend chưa sẵn sàng
      const mockPeriods: ExamPeriod[] = [
        {
          id: 1,
          schoolYear: "2025-2026",
          campaignName: "Đợt khám học kỳ 1 - 2025",
          startDate: "2025-01-01",
          endDate: "2025-06-30",
          status: "IN_PROGRESS",
          note: "Đợt khám định kỳ (Mock data - Backend chưa kết nối)",
          totalStudents: 0,
          totalStudentsExamined: 0,
        },
      ];
      setExamPeriods(mockPeriods);
      setSelectedCampaignId(mockPeriods[0].id!);
    }
  };

  const loadStudents = async (campaignId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data =
        await studentService.getStudentsByCampaign(campaignId);
      setStudents(data);
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
    if (!selectedCampaignId) {
      setError("Vui lòng chọn đợt khám trước");
      return;
    }

    try {
      const newStudent = await studentService.createStudent({
        campaignId: selectedCampaignId,
        fullName: studentData.full_name,
        gender:
          studentData.gender === "Nam" ? "MALE" : "FEMALE",
        dob: studentData.dob,
        address: studentData.address,
        identityNumber: studentData.identity_number,
      });
      setStudents((prev) => [newStudent, ...prev]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi thêm học sinh",
      );
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      confirm(`Bạn có chắc chắn muốn xóa học sinh ${name}?`)
    ) {
      try {
        await studentService.deleteStudent(id);
        setStudents((prev) => prev.filter((s) => s.id !== id));
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Có lỗi xảy ra khi xóa học sinh",
        );
      }
    }
  };

  const handleHealthDataChange = async (
    studentId: number,
    field: string,
    value: boolean,
  ) => {
    // Cập nhật UI ngay lập tức
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            medicalResults: student.medicalResults?.map(
              (result) => {
                // Logic map field name to medical result
                // Tùy thuộc vào cấu trúc medicalResults của bạn
                return result;
              },
            ),
          };
        }
        return student;
      }),
    );

    // TODO: Gọi API cập nhật kết quả khám nếu backend có endpoint riêng
    // Hiện tại backend chưa có endpoint PUT /medical-results/{id}
    // Bạn có thể cần thêm endpoint này hoặc update qua student
  };

  const handleExportExcel = async () => {
    if (!selectedCampaignId) {
      setError("Vui lòng chọn đợt khám");
      return;
    }

    try {
      const blob = await medicalResultService.exportExcel(
        selectedCampaignId,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ket-qua-kham-suc-khoe-campaign-${selectedCampaignId}.xlsx`;
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
    if (selectedCampaignId) {
      loadStudents(selectedCampaignId);
    }
  };

  // Helper function để lấy giá trị kết quả khám từ medicalResults
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
    return result?.resultValue || false;
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
        : students.map((s) => s.id),
    );
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
  };

  const handleSave = (updatedStudent: Student) => {
    // Here you would typically update the student in your data source
    console.log("Saving student:", updatedStudent);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1>Danh sách học sinh</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsExamPeriodModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              <Settings className="w-4 h-4" />
              Quản lý đợt khám
            </button>
            <button
              onClick={() => setIsHealthReportModalOpen(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              <FileText className="w-4 h-4" />
              Tải biên bản
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!selectedCampaignId}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              <FileDown className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={() => setIsImportExcelModalOpen(true)}
              disabled={!selectedCampaignId}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              <FileDown className="w-4 h-4" />
              Import Excel
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!selectedCampaignId}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
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

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Đợt khám
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={selectedCampaignId || ""}
              onChange={(e) =>
                setSelectedCampaignId(Number(e.target.value))
              }
            >
              {examPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.campaignName} - {period.schoolYear}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Tìm kiếm
            </label>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, CCCD..."
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr
                  className="text-white"
                  style={{ backgroundColor: "#2191b0" }}
                >
                  <th
                    className="border border-gray-300 p-2 sticky left-0 z-10"
                    style={{ backgroundColor: "#2191b0" }}
                    rowSpan={3}
                  >
                    TT
                  </th>
                  <th
                    className="border border-gray-300 p-2 sticky left-12 z-10 min-w-[180px]"
                    style={{ backgroundColor: "#2191b0" }}
                    rowSpan={3}
                  >
                    Họ và tên học sinh
                  </th>

                  {/* Ngày đăng nhận sinh */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={2}
                  >
                    Ngày đăng nhận sinh
                  </th>

                  {/* Địa chỉ */}
                  <th
                    className="border border-gray-300 p-2 min-w-[100px]"
                    rowSpan={3}
                  >
                    Địa chỉ
                  </th>

                  {/* Sinh lý danh dinh dưỡng các cước */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={2}
                  >
                    Sinh lý danh dinh dưỡng các cước
                  </th>

                  {/* Dinh dưỡng */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={4}
                  >
                    Dinh dưỡng
                  </th>

                  {/* Mắt */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={7}
                  >
                    Mắt
                  </th>

                  {/* Răng */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={4}
                  >
                    Răng
                  </th>

                  {/* Tai mũi họng */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={4}
                  >
                    Tai mũi họng
                  </th>

                  {/* Cơ xương khớp */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={3}
                  >
                    Cơ xương khớp
                  </th>

                  {/* Da liễu */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={3}
                  >
                    Da liễu
                  </th>

                  {/* Tâm thần */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={3}
                  >
                    Tâm thần
                  </th>

                  {/* Nội khoa */}
                  <th
                    className="border border-gray-300 p-2"
                    colSpan={5}
                  >
                    Nội khoa
                  </th>

                  {/* TB chung */}
                  <th
                    className="border border-gray-300 p-2"
                    rowSpan={3}
                  >
                    TB chung
                  </th>

                  {/* Ghi chú */}
                  <th
                    className="border border-gray-300 p-2"
                    rowSpan={3}
                  >
                    Ghi chú
                  </th>

                  {/* Xóa */}
                  <th
                    className="border border-gray-300 p-2"
                    rowSpan={3}
                  >
                    Xóa
                  </th>
                </tr>

                {/* Second row */}
                <tr
                  className="text-white"
                  style={{ backgroundColor: "#2191b0" }}
                >
                  {/* Ngày đăng nhận sinh */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Nam
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Nữ
                  </th>

                  {/* Sinh lý */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Cân
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Cao
                  </th>

                  {/* Dinh dưỡng */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    SDD
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Thừa cân
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Béo phì
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    VK
                  </th>

                  {/* Mắt */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Cận đúng số
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Cận chưa đúng số
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Viễn thị
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Loạn thị
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Lác
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    TD tật khúc xạ
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    VKM
                  </th>

                  {/* Răng */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Sâu
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Mất
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Hàn
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Viêm lợi
                  </th>

                  {/* Tai mũi họng */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Viêm mũi
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Viêm họng
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Viêm tai
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Giảm thính lực
                  </th>

                  {/* Cơ xương khớp */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Cong CS
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Vẹo CS
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Bệnh khác
                  </th>

                  {/* Da liễu */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Viêm da
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Vẩy nến
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Bệnh khác
                  </th>

                  {/* Tâm thần */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Lo âu
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Trầm cảm
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    RLT
                  </th>

                  {/* Nội khoa */}
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Hẹp PQ
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Thấp tim
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Bướu cổ
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    DT BS
                  </th>
                  <th
                    className="border border-gray-300 p-1"
                    rowSpan={2}
                  >
                    Bệnh khác
                  </th>
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
                    <td className="border border-gray-300 p-2 text-center sticky left-0 bg-inherit z-[5]">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 p-2 sticky left-12 bg-inherit z-[5]">
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

                    {/* Địa chỉ */}
                    <td className="border border-gray-300 p-2 text-xs">
                      {student.address ||
                        "Khối 6 Phường Đồi Cung"}
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
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "SDD",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "sdd",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Thừa cân",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "overweight",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Béo phì",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "obesity",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Mắt */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Cận đúng số",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "myopia_correct",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Cận chưa đúng số",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "myopia_incorrect",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Viễn thị",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "hyperopia",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Loạn thị",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "astigmatism",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Lác",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "strabismus",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "TD tật khúc xạ",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "refractive_error",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "VKM",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "vkm",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Răng */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Sâu răng",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "cavities",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Viêm lợi",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "gingivitis",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Tai mũi họng */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Viêm mũi",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "nose_inflammation",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Viêm họng",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "throat_inflammation",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Viêm tai",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "ear_infection",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Giảm thính lực",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "hearing_loss",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Cơ xương khớp */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Cong cột sống",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "scoliosis",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Bệnh khác CXK",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "flat_feet",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Da liễu */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Viêm da",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "eczema",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Bệnh khác Da liễu",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "skin_allergy",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Tâm thần */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Lo âu",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "anxiety",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Trầm cảm",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "depression",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "RLT hành vi",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "behavioral_disorder",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* Nội khoa */}
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Hô hấp",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "respiratory_disease",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Tim mạch",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "heart_disease",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <input
                        type="checkbox"
                        checked={getMedicalResultValue(
                          student,
                          "Tiêu hóa",
                        )}
                        onChange={(e) =>
                          handleHealthDataChange(
                            student.id!,
                            "digestive_disease",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4"
                      />
                    </td>

                    {/* TB chung */}
                    <td className="border border-gray-300 p-2 text-center">
                      <select className="text-xs border-0 bg-transparent">
                        <option>Khỏe</option>
                        <option>TB</option>
                        <option>Yếu</option>
                      </select>
                    </td>

                    {/* Ghi chú */}
                    <td className="border border-gray-300 p-2">
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

                    {/* Xóa */}
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() =>
                          handleDelete(
                            student.id!,
                            student.fullName,
                          )
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Hàng trên mỗi trang:</span>
            <select className="border border-gray-300 rounded px-2 py-1">
              <option>50</option>
              <option>100</option>
              <option>200</option>
            </select>
            <span className="ml-4">
              Tổng số: {students.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
              3
            </button>
          </div>
        </div>
      </div>

      <EditStudentModal
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleSave}
      />

      <ViewStudentModal
        student={viewingStudent}
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
      />

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      <ImportExcelModal
        isOpen={isImportExcelModalOpen}
        onClose={() => setIsImportExcelModalOpen(false)}
        campaignId={selectedCampaignId || 0}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}