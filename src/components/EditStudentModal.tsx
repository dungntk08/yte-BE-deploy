import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HealthIndicatorsForm } from './HealthIndicatorsForm';

interface Student {
  id: string;
  name: string;
  citizenId: string;
  studentCode: string;
  birthDate: string;
  gender: string;
  class: string;
  status: string;
  healthData?: any;
}

interface EditStudentModalProps {
  student: Student | null;
  onClose: () => void;
  onSave: (student: Student) => void;
}

// Mock health data mẫu khi chưa có BE
const MOCK_HEALTH_DATA = {
  // Chỉ số dinh dưỡng
  sdd: false,
  overweight: false,
  obesity: false,
  
  // Mắt
  myopia_correct: false,
  myopia_incorrect: false,
  hyperopia: false,
  astigmatism: false,
  strabismus: false,
  refractive_error: false,
  vkm: false,
  
  // Tai - Mũi - Họng
  ear_infection: false,
  hearing_loss: false,
  nose_inflammation: false,
  throat_inflammation: false,
  
  // Răng - Hàm - Mặt
  cavities: false,
  gingivitis: false,
  malocclusion: false,
  
  // Cơ - Xương - Khớp
  scoliosis: false,
  flat_feet: false,
  limb_deformity: false,
  
  // Da liễu
  eczema: false,
  fungal_infection: false,
  skin_allergy: false,
  
  // Tâm thần
  anxiety: false,
  depression: false,
  behavioral_disorder: false,
  
  // Nội khoa
  heart_disease: false,
  respiratory_disease: false,
  digestive_disease: false,
};

export function EditStudentModal({ student, onClose, onSave }: EditStudentModalProps) {
  if (!student) return null;

  const [formData, setFormData] = useState({
    full_name: student.name,
    gender: student.gender,
    dob: student.birthDate,
    identity_number: student.citizenId,
    address: 'Khối 6 Phường Đồi Cung',
    weight: '',
    height: '',
    notify_family: '',
  });

  const [healthData, setHealthData] = useState(
    student.healthData && Object.keys(student.healthData).length > 0 
      ? student.healthData 
      : MOCK_HEALTH_DATA
  );

  // Cập nhật formData và healthData khi student thay đổi
  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.name,
        gender: student.gender,
        dob: student.birthDate,
        identity_number: student.citizenId,
        address: 'Khối 6 Phường Đồi Cung',
        weight: '',
        height: '',
        notify_family: '',
      });
      
      setHealthData(
        student.healthData && Object.keys(student.healthData).length > 0 
          ? student.healthData 
          : MOCK_HEALTH_DATA
      );
    }
  }, [student]);

  const handleSubmit = () => {
    onSave({ ...student, ...formData, healthData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-blue-600">
            <span>Năm học (2025-2026)</span>{' '}
            <span>Cập nhật</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <p className="text-blue-700 text-sm">Chỉnh sửa thông tin học sinh (chỉ cho phép sửa: Địa chỉ, Cân nặng, Chiều cao, Kết quả khám sức khỏe, Thông báo gia đình)</p>
          </div>

          {/* Student Information - Read Only */}
          <div className="mb-6">
            <h3 className="mb-4">
              <span>Thông tin cơ bản (Không cho phép chỉnh sửa)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Giới tính
                </label>
                <input
                  type="text"
                  value={formData.gender}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="text"
                  value={formData.dob}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  CCCD
                </label>
                <input
                  type="text"
                  value={formData.identity_number}
                  disabled
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Editable Information */}
          <div className="mb-6">
            <h3 className="mb-4">
              <span>Địa chỉ</span>
            </h3>
            <div className="col-span-2">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Health Indicators Form */}
          <HealthIndicatorsForm
            formData={formData}
            setFormData={setFormData}
            healthData={healthData}
            setHealthData={setHealthData}
            readOnly={false}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}