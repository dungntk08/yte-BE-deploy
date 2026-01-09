import { useState, useEffect } from 'react';
import schoolClassService, { SchoolClassResponseDTO } from '../services/schoolClassService';

export function useSchoolClasses() {
  const [schoolClasses, setSchoolClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await schoolClassService.getAllSchoolClasses();
      setSchoolClasses(data);
    } catch (err) {
      setError('Không thể tải danh sách lớp học');
      console.error('Error fetching school classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolClasses();
  }, []);

  const deleteSchoolClass = async (id: number) => {
    try {
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
    deleteSchoolClass,
    refreshSchoolClasses,
  };
}
