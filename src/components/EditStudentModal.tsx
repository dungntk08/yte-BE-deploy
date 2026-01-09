import { X } from 'lucide-react';
import { useState } from 'react';
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

  const [healthData, setHealthData] = useState(student.healthData || {});

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
            <p className="text-blue-700 text-sm">Chỉnh sửa thông tin học sinh (chỉ cho phép sửa: Địa chỉ, Cân nặng, Chiều cao, Thông báo gia đình)</p>
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
              <span>Thông tin có thể chỉnh sửa</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Thông báo gia đình</label>
                <textarea
                  value={formData.notify_family}
                  onChange={(e) => setFormData({ ...formData, notify_family: e.target.value })}
                  placeholder="Nhập thông báo gửi gia đình"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Health Indicators Form */}
          <HealthIndicatorsForm
            healthData={student.healthData}
            onHealthDataChange={(healthData) => {
              setHealthData(healthData);
            }}
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