import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import schoolService, { SchoolResponseDTO } from '../services/schoolService';
import schoolClassService, { SchoolClassResponseDTO } from '../services/schoolClassService';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: any) => void;
  campaignId: number;
}

export function AddStudentModal({ isOpen, onClose, onAdd, campaignId }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dob: '',
    address: '',
    identityNumber: '',
    weight: '',
    height: '',
    notifyFamily: '',
    className: '',
    schoolId: null as number | null,
    schoolClassId: null as number | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State cho schools và classes
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  
  const [classes, setClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Load schools khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadSchools();
    }
  }, [isOpen]);

  // Load classes khi school được chọn
  useEffect(() => {
    if (formData.schoolId) {
      loadClasses(formData.schoolId);
    } else {
      setClasses([]);
      setFormData(prev => ({ ...prev, schoolClassId: null }));
    }
  }, [formData.schoolId]);

  const loadSchools = async () => {
    setLoadingSchools(true);
    try {
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (err: any) {
      const errorMsg = typeof err === 'string' ? err : 'Không thể tải danh sách trường học';
      setError(errorMsg);
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
      const errorMsg = typeof err === 'string' ? err : 'Không thể tải danh sách lớp học';
      setError(errorMsg);
    } finally {
      setLoadingClasses(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.dob) {
        setError('Vui lòng chọn ngày sinh');
        setLoading(false);
        return;
      }

      // IMPORTANT: Backend chỉ nhận định dạng dd/MM/yyyy
      // HTML date input (type="date") luôn trả về YYYY-MM-DD, phải convert
      let formattedDob = '';
      if (formData.dob.includes('-')) {
        // Convert từ YYYY-MM-DD (date input format) sang dd/MM/yyyy
        const [year, month, day] = formData.dob.split('-');
        formattedDob = `${day}/${month}/${year}`;
      } else {
        // Nếu đã là dd/MM/yyyy thì giữ nguyên
        formattedDob = formData.dob;
      }

      // Debug: Log format
      console.log('Original dob:', formData.dob);
      console.log('Formatted dob:', formattedDob);

      // Format data theo StudentRequestDTO
      const studentData = {
        campaignId: campaignId,
        fullName: formData.fullName,
        gender: formData.gender,
        dob: formattedDob, // BE expects dd/MM/yyyy format
        address: formData.address,
        identityNumber: formData.identityNumber,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        notifyFamily: formData.notifyFamily,
        className: formData.className,
        schoolId: formData.schoolId,
        schoolClassId: formData.schoolClassId,
      };

      await onAdd(studentData);
    
      // Reset form on success
      setFormData({
        fullName: '',
        gender: 'MALE',
        dob: '',
        address: '',
        identityNumber: '',
        weight: '',
        height: '',
        notifyFamily: '',
        className: '',
        schoolId: null,
        schoolClassId: null,
      });
    } catch (err: any) {
      // Display error from backend - ensure it's a string
      let errorMessage = 'Có lỗi xảy ra khi thêm học sinh';
      if (err?.response?.data?.message) {
        errorMessage = String(err.response.data.message);
      } else if (err?.message) {
        errorMessage = String(err.message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-blue-600">
            <span>Năm học (2025-2026)</span>{' '}
            <span>Thêm học sinh</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start gap-3">
              <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">!</span>
              </div>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">Lỗi</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs">i</span>
            </div>
            <p className="text-blue-700 text-sm">Thêm thông tin học sinh khám sức khỏe</p>
          </div>

          {/* Student Information */}
          <div className="mb-6">
            <h3 className="mb-4">
              <span>Thông tin học sinh</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Trường học */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Trường học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.schoolId || ''}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  disabled={loadingSchools}
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
              </div>

              {/* Lớp học */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Lớp học <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.schoolClassId || ''}
                  onChange={(e) => setFormData({ ...formData, schoolClassId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  disabled={!formData.schoolId || loadingClasses}
                >
                  <option value="">
                    {!formData.schoolId 
                      ? 'Chọn trường trước' 
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
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  CCCD <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.identityNumber}
                  onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                  placeholder="Nhập số CCCD"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Lớp học
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="Nhập lớp học"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cân nặng (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Nhập cân nặng"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Chiều cao (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Nhập chiều cao"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Thông báo về gia đình</label>
                <textarea
                  value={formData.notifyFamily}
                  onChange={(e) => setFormData({ ...formData, notifyFamily: e.target.value })}
                  placeholder="Nhập thông tin cần thông báo về gia đình (nếu có)"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
          
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang thêm...' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
}