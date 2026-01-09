import api from './api';

export interface School {
  id?: number;
  schoolCode: string;
  schoolName: string;
  address: string;
}

export interface SchoolRequestDTO {
  schoolCode: string;
  schoolName: string;
  address: string;
}

export interface SchoolResponseDTO {
  id: number;
  schoolCode: string;
  schoolName: string;
  address: string;
}

const schoolService = {
  // Lấy danh sách tất cả trường học
  getAllSchools: async (): Promise<SchoolResponseDTO[]> => {
    try {
      const response = await api.get('/schools');
      return response.data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  },

  // Lấy thông tin trường học theo ID
  getSchoolById: async (id: number): Promise<SchoolResponseDTO> => {
    try {
      const response = await api.get(`/schools/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching school:', error);
      throw error;
    }
  },

  // Tạo trường học mới
  createSchool: async (data: SchoolRequestDTO): Promise<SchoolResponseDTO> => {
    try {
      const response = await api.post('/schools', data);
      return response.data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },

  // Cập nhật trường học
  updateSchool: async (id: number, data: SchoolRequestDTO): Promise<SchoolResponseDTO> => {
    try {
      const response = await api.put(`/schools/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating school:', error);
      throw error;
    }
  },
};

export default schoolService;
