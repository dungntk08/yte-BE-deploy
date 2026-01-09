import { X, Plus, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

interface ExamPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ExamPeriodModal({ isOpen, onClose, onRefresh }: ExamPeriodModalProps) {
  if (!isOpen) return null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    total_students: '',
    examined_students: '',
    status: 'OPEN',
  });

  const [examPeriods] = useState([
    {
      id: '1',
      name: 'Đợt khám học kỳ 1 - 2025',
      start_date: '01/01/2025',
      end_date: '31/01/2025',
      total_students: 120,
      examined_students: 85,
      status: 'OPEN',
    },
    {
      id: '2',
      name: 'Đợt khám học kỳ 2 - 2024',
      start_date: '01/06/2024',
      end_date: '30/06/2024',
      total_students: 115,
      examined_students: 115,
      status: 'CLOSED',
    },
  ]);

  const handleSubmit = () => {
    console.log('Adding exam period:', formData);
    setShowAddForm(false);
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      total_students: '',
      examined_students: '',
      status: 'OPEN',
    });
    if (onRefresh) onRefresh();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
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
              <h3 className="mb-4">Thêm đợt khám mới</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Tên đợt khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Đợt khám học kỳ 1 - 2025"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Tổng số học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.total_students}
                    onChange={(e) => setFormData({ ...formData, total_students: e.target.value })}
                    placeholder="Nhập tổng số học sinh"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Số học sinh được khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.examined_students}
                    onChange={(e) => setFormData({ ...formData, examined_students: e.target.value })}
                    placeholder="Nhập số học sinh được khám"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Số học sinh được khám ≤ Tổng số học sinh
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Thêm đợt khám
                </button>
              </div>
            </div>
          )}

          {/* List of Exam Periods */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="p-3 text-left">STT</th>
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
                    <td className="p-3">{period.name}</td>
                    <td className="p-3 text-sm">
                      {period.start_date} - {period.end_date}
                    </td>
                    <td className="p-3">{period.total_students}</td>
                    <td className="p-3">{period.examined_students}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded text-xs ${
                          period.status === 'OPEN'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {period.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={period.examined_students > 0}
                          title={
                            period.examined_students > 0
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