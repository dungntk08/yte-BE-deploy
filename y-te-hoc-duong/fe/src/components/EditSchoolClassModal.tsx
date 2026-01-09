import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import schoolClassService, { SchoolClassRequestDTO, SchoolClassResponseDTO } from '../services/schoolClassService';
import { SchoolResponseDTO } from '../services/schoolService';

interface EditSchoolClassModalProps {
  isOpen: boolean;
  schoolClass: SchoolClassResponseDTO;
  school: SchoolResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSchoolClassModal({ isOpen, schoolClass, school, onClose, onSuccess }: EditSchoolClassModalProps) {
  const [formData, setFormData] = useState<SchoolClassRequestDTO>({
    schoolId: school.id,
    classCode: schoolClass.classCode,
    className: schoolClass.className,
    grade: schoolClass.grade,
    totalStudent: schoolClass.totalStudent,
    schoolYear: schoolClass.schoolYear,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await schoolClassService.updateSchoolClass(schoolClass.id, formData);
      onSuccess();
    } catch (err) {
      setError('Không thể cập nhật lớp học. Vui lòng thử lại.');
      console.error('Error updating school class:', err);
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
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Chỉnh sửa lớp học</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Trường</Label>
            <Input value={school.schoolName} disabled />
          </div>

          <div>
            <Label htmlFor="classCode">Mã lớp *</Label>
            <Input
              id="classCode"
              value={formData.classCode}
              onChange={(e) => handleChange('classCode', e.target.value)}
              placeholder="Nhập mã lớp"
              required
            />
          </div>

          <div>
            <Label htmlFor="className">Tên lớp *</Label>
            <Input
              id="className"
              value={formData.className}
              onChange={(e) => handleChange('className', e.target.value)}
              placeholder="Nhập tên lớp"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="grade">Khối *</Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="12"
                value={formData.grade}
                onChange={(e) => handleChange('grade', parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="totalStudent">Sĩ số</Label>
              <Input
                id="totalStudent"
                type="number"
                min="0"
                value={formData.totalStudent}
                onChange={(e) => handleChange('totalStudent', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="schoolYear">Năm học *</Label>
            <Input
              id="schoolYear"
              value={formData.schoolYear}
              onChange={(e) => handleChange('schoolYear', e.target.value)}
              placeholder="VD: 2024-2025"
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
