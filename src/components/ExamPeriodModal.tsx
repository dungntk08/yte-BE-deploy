import { X, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import examPeriodService, { ExamPeriod } from '../services/examPeriodService';
import schoolService, { SchoolResponseDTO } from '../services/schoolService';
import campaignService from '../services/campaignService';

interface ExamPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ExamPeriodModal({ isOpen, onClose, onRefresh }: ExamPeriodModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<ExamPeriod | null>(null);
  const [formData, setFormData] = useState({
    schoolYear: '',
    campaignName: '',
    startDate: '',
    endDate: '',
    note: '',
    status: 'DRAFT' as 'DRAFT' | 'IN_PROGRESS' | 'CLOSED',
    totalStudents: 0,
    totalStudentsExamined: 0,
  });

  const [examPeriods, setExamPeriods] = useState<ExamPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // State cho schools
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Load danh sách đợt khám khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadExamPeriods();
    }
  }, [isOpen]);

  const loadExamPeriods = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await examPeriodService.getExamPeriods();
      setExamPeriods(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đợt khám');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (period: ExamPeriod) => {
    setEditingPeriod(period);
    setFormData({
      schoolYear: period.schoolYear,
      campaignName: period.campaignName,
      startDate: period.startDate.split('T')[0], // Format: YYYY-MM-DD for date input
      endDate: period.endDate.split('T')[0],
      note: period.note || '',
      status: period.status,
      totalStudents: period.totalStudents || 0,
      totalStudentsExamined: period.totalStudentsExamined || 0,
    });
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingPeriod(null);
    setShowAddForm(false);
    setFormData({
      schoolYear: '',
      campaignName: '',
      startDate: '',
      endDate: '',
      note: '',
      status: 'DRAFT',
      totalStudents: 0,
      totalStudentsExamined: 0,
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Validate
    if (!formData.campaignName || !formData.startDate || !formData.endDate) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        campaignName: formData.campaignName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note,
        status: 'DRAFT' as const,
        totalStudents: formData.totalStudents || 0,
        totalStudentsExamined: formData.totalStudentsExamined || 0,
      };

      if (editingPeriod) {
        // Update existing period
        await examPeriodService.updateExamPeriod(editingPeriod.id!, payload);
        setSuccess('Cập nhật đợt khám thành công!');
      } else {
        // Create new period - sử dụng campaignService
        await campaignService.createCampaign(payload);
        setSuccess('Thêm đợt khám thành công!');
      }

      handleCancelEdit();

      // Reload danh sách
      await loadExamPeriods();
      
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || `Có lỗi xảy ra khi ${editingPeriod ? 'cập nhật' : 'tạo'} đợt khám`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
          <h2>Quản lý đợt khám</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">i</span>
            </div>
            <p className="text-blue-700 text-sm">
              Quản lý các đợt khám sức khỏe định kỳ. Chỉ có thể nhập kết quả khi đợt khám đang MỞ.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              {success}
            </div>
          )}

          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Thêm đợt khám mới
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
              <h3 className="mb-4">{editingPeriod ? 'Chỉnh sửa đợt khám' : 'Thêm đợt khám mới'}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Tên đợt khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.campaignName}
                    onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    placeholder="Ví dụ: Đợt khám học kỳ 1 - 2025"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tổng số học sinh
                  </label>
                  <input
                    type="number"
                    value={formData.totalStudents}
                    onChange={(e) => setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })}
                    placeholder="Nhập tổng số học sinh"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Số học sinh được khám
                  </label>
                  <input
                    type="number"
                    value={formData.totalStudentsExamined}
                    onChange={(e) => setFormData({ ...formData, totalStudentsExamined: parseInt(e.target.value) || 0 })}
                    placeholder="Nhập số học sinh được khám"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Số học sinh được khám ≤ Tổng số học sinh
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Nhập ghi chú (nếu có)"
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    editingPeriod ? 'Đang cập nhật...' : 'Đang thêm...'
                  ) : (
                    editingPeriod ? 'Cập nhật' : 'Thêm đợt khám'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* List of Exam Periods */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading && examPeriods.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Đang tải danh sách đợt khám...
              </div>
            ) : examPeriods.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Chưa có đợt khám nào
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="p-3 text-left">STT</th>
                    <th className="p-3 text-left">Năm học</th>
                    <th className="p-3 text-left">Tên đợt khám</th>
                    <th className="p-3 text-left">Thời gian</th>
                    <th className="p-3 text-left">Tổng HS</th>
                    <th className="p-3 text-left">HS được khám</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {examPeriods.map((period, index) => (
                  <tr key={period.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{period.schoolYear}</td>
                    <td className="p-3">{period.campaignName}</td>
                    <td className="p-3 text-sm">
                      {new Date(period.startDate).toLocaleDateString('vi-VN')} - {new Date(period.endDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3">{period.totalStudents || 0}</td>
                    <td className="p-3">{period.totalStudentsExamined || 0}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded text-xs ${
                          period.status === 'IN_PROGRESS'
                            ? 'bg-green-50 text-green-600'
                            : period.status === 'DRAFT'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {period.status === 'IN_PROGRESS' ? 'Đang tiến hành' : period.status === 'DRAFT' ? 'Nháp' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(period)}
                          className="text-blue-600 hover:text-blue-800" 
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={(period.totalStudentsExamined || 0) > 0}
                          title={
                            (period.totalStudentsExamined || 0) > 0
                              ? 'Không thể xóa đợt khám đã có học sinh'
                              : 'Xóa'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}