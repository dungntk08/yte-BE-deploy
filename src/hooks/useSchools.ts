import { useState, useEffect } from 'react';
import schoolService, { SchoolResponseDTO } from '../services/schoolService';

// Mock data
const MOCK_SCHOOLS: SchoolResponseDTO[] = [
  {
    id: 1,
    schoolCode: 'MN001',
    schoolName: 'Trường Mầm Non Đồi Cung',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  },
  {
    id: 2,
    schoolCode: 'MN002',
    schoolName: 'Trường Mầm Non Hoa Sen',
    address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
  },
  {
    id: 3,
    schoolCode: 'MN003',
    schoolName: 'Trường Mầm Non Ánh Dương',
    address: '789 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
  },
  {
    id: 4,
    schoolCode: 'MN004',
    schoolName: 'Trường Mầm Non Bình Minh',
    address: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
  },
  {
    id: 5,
    schoolCode: 'MN005',
    schoolName: 'Trường Mầm Non Sao Mai',
    address: '654 Đường Lý Thường Kiệt, Quận 10, TP.HCM',
  },
];

export function useSchools() {
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schoolService.getAllSchools();
      setSchools(data);
      setUseMockData(false);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      
      // Sử dụng mock data khi backend chưa kết nối
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        setSchools(MOCK_SCHOOLS);
        setUseMockData(true);
        setError('Đang sử dụng dữ liệu mẫu (Backend chưa kết nối)');
      } else {
        setError('Không thể tải danh sách trường học');
        setSchools([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const deleteSchool = async (id: number) => {
    if (useMockData) {
      // Xóa từ mock data
      setSchools(prev => prev.filter(s => s.id !== id));
      return;
    }
    // Backend chưa có API xóa, có thể implement sau
    console.log('Delete school:', id);
  };

  const refreshSchools = () => {
    fetchSchools();
  };

  return {
    schools,
    loading,
    error,
    useMockData,
    deleteSchool,
    refreshSchools,
  };
}