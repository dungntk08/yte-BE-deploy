import { useState, useEffect } from 'react';
import schoolClassService, { SchoolClassResponseDTO } from '../services/schoolClassService';

// Mock data
const MOCK_SCHOOL_CLASSES: SchoolClassResponseDTO[] = [
  // Trường Đồi Cung (MN001)
  { id: 1, classCode: 'MN001-MG1', className: 'Lớp Mẫu Giáo 1', grade: 6, schoolYear: '2025-2026', totalStudent: 25 },
  { id: 2, classCode: 'MN001-MG2', className: 'Lớp Mẫu Giáo 2', grade: 6, schoolYear: '2025-2026', totalStudent: 28 },
  { id: 3, classCode: 'MN001-MG3', className: 'Lớp Mẫu Giáo 3', grade: 6, schoolYear: '2025-2026', totalStudent: 30 },
  { id: 4, classCode: 'MN001-NT1', className: 'Lớp Nhà Trẻ 1', grade: 7, schoolYear: '2025-2026', totalStudent: 20 },
  { id: 5, classCode: 'MN001-NT2', className: 'Lớp Nhà Trẻ 2', grade: 7, schoolYear: '2025-2026', totalStudent: 22 },
  
  // Trường Hoa Sen (MN002)
  { id: 6, classCode: 'MN002-MG1', className: 'Lớp Mẫu Giáo A', grade: 6, schoolYear: '2025-2026', totalStudent: 26 },
  { id: 7, classCode: 'MN002-MG2', className: 'Lớp Mẫu Giáo B', grade: 6, schoolYear: '2025-2026', totalStudent: 24 },
  { id: 8, classCode: 'MN002-NT1', className: 'Lớp Nhà Trẻ A', grade: 7, schoolYear: '2025-2026', totalStudent: 18 },
  
  // Trường Ánh Dương (MN003)
  { id: 9, classCode: 'MN003-MG1', className: 'Lớp Mẫu Giáo 1', grade: 6, schoolYear: '2025-2026', totalStudent: 32 },
  { id: 10, classCode: 'MN003-MG2', className: 'Lớp Mẫu Giáo 2', grade: 6, schoolYear: '2025-2026', totalStudent: 30 },
  { id: 11, classCode: 'MN003-MG3', className: 'Lớp Mẫu Giáo 3', grade: 6, schoolYear: '2025-2026', totalStudent: 28 },
  { id: 12, classCode: 'MN003-MG4', className: 'Lớp Mẫu Giáo 4', grade: 6, schoolYear: '2025-2026', totalStudent: 31 },
  { id: 13, classCode: 'MN003-NT1', className: 'Lớp Nhà Trẻ 1', grade: 7, schoolYear: '2025-2026', totalStudent: 22 },
  { id: 14, classCode: 'MN003-NT2', className: 'Lớp Nhà Trẻ 2', grade: 7, schoolYear: '2025-2026', totalStudent: 21 },
  
  // Trường Bình Minh (MN004)
  { id: 15, classCode: 'MN004-MG1', className: 'Lớp Mẫu Giáo 1', grade: 6, schoolYear: '2025-2026', totalStudent: 20 },
  { id: 16, classCode: 'MN004-MG2', className: 'Lớp Mẫu Giáo 2', grade: 6, schoolYear: '2025-2026', totalStudent: 19 },
  { id: 17, classCode: 'MN004-NT1', className: 'Lớp Nhà Trẻ 1', grade: 7, schoolYear: '2025-2026', totalStudent: 15 },
  
  // Trường Sao Mai (MN005)
  { id: 18, classCode: 'MN005-MG1', className: 'Lớp Mẫu Giáo 1', grade: 6, schoolYear: '2025-2026', totalStudent: 29 },
  { id: 19, classCode: 'MN005-MG2', className: 'Lớp Mẫu Giáo 2', grade: 6, schoolYear: '2025-2026', totalStudent: 27 },
  { id: 20, classCode: 'MN005-MG3', className: 'Lớp Mẫu Giáo 3', grade: 6, schoolYear: '2025-2026', totalStudent: 28 },
  { id: 21, classCode: 'MN005-NT1', className: 'Lớp Nhà Trẻ 1', grade: 7, schoolYear: '2025-2026', totalStudent: 19 },
  { id: 22, classCode: 'MN005-NT2', className: 'Lớp Nhà Trẻ 2', grade: 7, schoolYear: '2025-2026', totalStudent: 20 },
];

export function useSchoolClasses() {
  const [schoolClasses, setSchoolClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchSchoolClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schoolClassService.getAllSchoolClasses();
      setSchoolClasses(data);
      setUseMockData(false);
    } catch (err: any) {
      console.error('Error fetching school classes:', err);
      
      // Sử dụng mock data khi backend chưa kết nối
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        setSchoolClasses(MOCK_SCHOOL_CLASSES);
        setUseMockData(true);
        setError('Đang sử dụng dữ liệu mẫu (Backend chưa kết nối)');
      } else {
        setError('Không thể tải danh sách lớp học');
        setSchoolClasses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolClasses();
  }, []);

  const deleteSchoolClass = async (id: number) => {
    try {
      if (useMockData) {
        // Xóa từ mock data
        setSchoolClasses(prev => prev.filter(c => c.id !== id));
        return;
      }
      
      await schoolClassService.deleteSchoolClass(id);
      await fetchSchoolClasses();
    } catch (err) {
      console.error('Error deleting school class:', err);
      throw err;
    }
  };

  const refreshSchoolClasses = () => {
    fetchSchoolClasses();
  };

  return {
    schoolClasses,
    loading,
    error,
    useMockData,
    deleteSchoolClass,
    refreshSchoolClasses,
  };
}