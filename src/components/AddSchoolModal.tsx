import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { FloatingInput } from './ui/floating-input';
import { toast } from 'sonner';
import schoolService, { SchoolRequestDTO } from '../services/schoolService';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSchoolModal({ isOpen, onClose, onSuccess }: AddSchoolModalProps) {
  const [formData, setFormData] = useState<SchoolRequestDTO>({
    schoolCode: '',
    schoolName: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await schoolService.createSchool(formData);
      toast.success('Thêm trường học thành công!');
      onSuccess();
    } catch (err) {
      setError('Không thể tạo trường học. Vui lòng thử lại.');
      toast.error('Không thể tạo trường học');
      console.error('Error creating school:', err);
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
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        style={{ maxWidth: '400px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Thêm trường học mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <FloatingInput
                id="schoolCode"
                label="Mã trường *"
                value={formData.schoolCode}
                onChange={(e) => handleChange('schoolCode', e.target.value)}
                className="rounded-lg py-3 text-base"
                required
              />

              <FloatingInput
                id="schoolName"
                label="Tên trường *"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                className="rounded-lg py-3 text-base"
                required
              />

              <FloatingInput
                id="address"
                label="Địa chỉ *"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
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
