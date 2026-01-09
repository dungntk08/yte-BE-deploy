import apiClient from './api';

export interface MedicalResultDetail {
  id?: number;
  studentId?: number;
  medicalGroupId?: number;
  medicalGroupName?: string;
  medicalIndicatorId?: number;
  medicalIndicatorName?: string;
  medicalSubIndicatorId?: number;
  medicalSubIndicatorName?: string;
  resultValue?: boolean;
  campaignId?: number;
}

export interface Student {
  id?: number;
  campaignId?: number;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  address?: string;
  identityNumber: string;
  weight?: string;
  height?: string;
  notifyFamily?: string;
  medicalResults?: MedicalResultDetail[];
}

export interface StudentRequest {
  campaignId: number;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  address?: string;
  identityNumber: string;
  weight?: string;
  height?: string;
  notifyFamily?: string;
}

class StudentService {
  // Lấy danh sách học sinh theo đợt khám
  async getStudentsByCampaign(campaignId: number): Promise<Student[]> {
    const response = await apiClient.get(`/students/campaign/${campaignId}`);
    return response.data;
  }

  // Lấy thông tin một học sinh
  async getStudentById(id: number): Promise<Student> {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  }

  // Thêm học sinh mới
  async createStudent(student: StudentRequest): Promise<Student> {
    const response = await apiClient.post('/students', student);
    return response.data;
  }

  // Cập nhật thông tin học sinh
  async updateStudent(id: number, student: Partial<StudentRequest>): Promise<Student> {
    const response = await apiClient.put(`/students/${id}`, student);
    return response.data;
  }

  // Xóa học sinh
  async deleteStudent(id: number): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  }
}

export default new StudentService();