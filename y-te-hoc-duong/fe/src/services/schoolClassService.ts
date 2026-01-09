import api from './api';

export interface SchoolClassRequestDTO {
  schoolId: number;
  classCode: string;
  className: string;
  grade: number;
  totalStudent: number;
  schoolYear: string;
}

export interface SchoolClassResponseDTO {
  id: number;
  classCode: string;
  className: string;
  grade: number;
  totalStudent: number;
  schoolYear: string;
}

const schoolClassService = {
  // Lấy danh sách tất cả lớp học
  getAllSchoolClasses: async (): Promise<SchoolClassResponseDTO[]> => {
    try {
      const response = await api.get('/school-classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching school classes:', error);
      throw error;
    }
  },

  // Lấy thông tin lớp học theo ID
  getSchoolClassById: async (id: number): Promise<SchoolClassResponseDTO> => {
    try {
      const response = await api.get(`/school-classes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching school class:', error);
      throw error;
    }
  },

  // Tạo lớp học mới
  createSchoolClass: async (data: SchoolClassRequestDTO): Promise<SchoolClassResponseDTO> => {
    try {
      const response = await api.post('/school-classes', data);
      return response.data;
    } catch (error) {
      console.error('Error creating school class:', error);
      throw error;
    }
  },

  // Cập nhật lớp học
  updateSchoolClass: async (id: number, data: SchoolClassRequestDTO): Promise<SchoolClassResponseDTO> => {
    try {
      const response = await api.put(`/school-classes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating school class:', error);
      throw error;
    }
  },

  // Xóa lớp học
  deleteSchoolClass: async (id: number): Promise<void> => {
    try {
      await api.delete(`/school-classes/${id}`);
    } catch (error) {
      console.error('Error deleting school class:', error);
      throw error;
    }
  },
};

export default schoolClassService;
