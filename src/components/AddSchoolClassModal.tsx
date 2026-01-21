import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { FloatingInput } from './ui/floating-input';
import { toast } from 'sonner';
import schoolClassService, { SchoolClassRequestDTO } from '../services/schoolClassService';
import { SchoolResponseDTO } from '../services/schoolService';

interface AddSchoolClassModalProps {
  isOpen: boolean;
  school: SchoolResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSchoolClassModal({ isOpen, school, onClose, onSuccess }: AddSchoolClassModalProps) {
  const [formData, setFormData] = useState<SchoolClassRequestDTO>({
    schoolId: school.id,
    classCode: '',
    className: '',
    grade: 1,
    totalStudent: 0,
    schoolYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await schoolClassService.createSchoolClass(formData);
      toast.success('Thêm lớp học thành công!');
      onSuccess();
    } catch (err) {
      setError('Không thể tạo lớp học. Vui lòng thử lại.');
      toast.error('Không thể tạo lớp học');
      console.error('Error creating school class:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SchoolClassRequestDTO, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        style={{ maxWidth: '420px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Thêm lớp học mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <FloatingInput
                value={school.schoolName}
                label="Tên trường"
                disabled
                className="rounded-lg bg-gray-100 py-3 text-base"
              />

              <FloatingInput
                id="className"
                label="Tên lớp *"
                value={formData.className}
                onChange={(e) => handleChange('className', e.target.value)}
                className="rounded-lg py-3 text-base"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  id="grade"
                  label="Khối *"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', parseInt(e.target.value))}
                  className="rounded-lg py-3 text-base"
                  required
                />

                <FloatingInput
                  id="totalStudent"
                  label="Sĩ số"
                  type="number"
                  min="0"
                  value={formData.totalStudent}
                  onChange={(e) => handleChange('totalStudent', parseInt(e.target.value))}
                  className="rounded-lg py-3 text-base"
                />
              </div>

              <FloatingInput
                id="schoolYear"
                label="Năm học *"
                value={formData.schoolYear}
                onChange={(e) => handleChange('schoolYear', e.target.value)}
                className="rounded-lg py-3 text-base"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
