import { useState, useEffect } from 'react';
import schoolService, { SchoolResponseDTO } from '../services/schoolService';

export function useSchools() {
  const [schools, setSchools] = useState<SchoolResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schoolService.getAllSchools();
      setSchools(data);
    } catch (err) {
      setError('Không thể tải danh sách trường học');
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const deleteSchool = async (id: number) => {
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
    deleteSchool,
    refreshSchools,
  };
}
