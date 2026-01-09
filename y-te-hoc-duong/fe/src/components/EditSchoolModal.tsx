import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import schoolService, { SchoolRequestDTO, SchoolResponseDTO } from '../services/schoolService';

interface EditSchoolModalProps {
  isOpen: boolean;
  school: SchoolResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSchoolModal({ isOpen, school, onClose, onSuccess }: EditSchoolModalProps) {
  const [formData, setFormData] = useState<SchoolRequestDTO>({
    schoolCode: school.schoolCode,
    schoolName: school.schoolName,
    address: school.address,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await schoolService.updateSchool(school.id, formData);
      onSuccess();
    } catch (err) {
      setError('Không thể cập nhật trường học. Vui lòng thử lại.');
      console.error('Error updating school:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SchoolRequestDTO, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Chỉnh sửa trường học</h2>
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
            <Label htmlFor="schoolCode">Mã trường *</Label>
            <Input
              id="schoolCode"
              value={formData.schoolCode}
              onChange={(e) => handleChange('schoolCode', e.target.value)}
              placeholder="Nhập mã trường"
              required
            />
          </div>

          <div>
            <Label htmlFor="schoolName">Tên trường *</Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              placeholder="Nhập tên trường"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Nhập địa chỉ"
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
