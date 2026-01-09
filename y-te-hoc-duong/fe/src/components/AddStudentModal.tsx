import { X } from 'lucide-react';
import { useState } from 'react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: any) => void;
}

export function AddStudentModal({ isOpen, onClose, onAdd }: AddStudentModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Nam',
    dob: '',
    address: '',
    identity_number: '',
    student_code: '',
    class: '',
  });

  const handleSubmit = () => {
    onAdd(formData);
    setFormData({
      full_name: '',
      gender: 'Nam',
      dob: '',
      address: '',
      identity_number: '',
      student_code: '',
      class: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
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
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option>Nam</option>
                  <option>Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  CCCD <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.identity_number}
                  onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
                  placeholder="Nhập số CCCD"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mã học sinh</label>
                <input
                  type="text"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                  placeholder="Nhập mã học sinh"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Lớp học</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="Nhập lớp học"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
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
            Thêm mới
          </button>
        </div>
      </div>
    </div>
  );
}