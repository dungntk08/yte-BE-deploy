import { useState, useEffect, useCallback } from 'react';
import studentService, { Student, FilterParams, PaginationParams } from '../services/studentService';

export const useStudents = (initialFilters: FilterParams = {}, initialPagination: PaginationParams = {}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchStudents = useCallback(async (filters: FilterParams = {}, pagination: PaginationParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getStudents(filters, pagination);
      setStudents(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách học sinh');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newStudent = await studentService.createStudent(student);
      setStudents(prev => [newStudent, ...prev]);
      return newStudent;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm học sinh');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedStudent = await studentService.updateStudent(id, student);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      return updatedStudent;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật học sinh');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa học sinh');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHealthData = async (id: string, healthData: any) => {
    setError(null);
    try {
      const updatedStudent = await studentService.updateHealthData(id, healthData);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      return updatedStudent;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dữ liệu sức khỏe');
      throw err;
    }
  };

  useEffect(() => {
    fetchStudents(initialFilters, initialPagination);
  }, []);

  return {
    students,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    updateHealthData,
  };
};
