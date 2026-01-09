import apiClient from './api';

export interface ExamPeriod {
  id?: number;
  school?: {
    id: number;
    name: string;
  };
  schoolYear: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'CLOSED';
  note?: string;
  totalStudents?: number;
  totalStudentsExamined?: number;
  campaignMedicalConfig?: {
    id: number;
    configName: string;
  };
}

export interface ExamPeriodRequest {
  schoolId?: number;
  schoolYear: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  note?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'CLOSED';
  totalStudents?: number;
  totalStudentsExamined?: number;
  campaignMedicalConfig?: {
    id: number;
    configName: string;
  };
}

class ExamPeriodService {
  // Lấy danh sách đợt khám
  async getExamPeriods(): Promise<ExamPeriod[]> {
    const response = await apiClient.get('/medical-campaigns');
    return response.data;
  }

  // Lấy một đợt khám theo ID
  async getExamPeriodById(id: number): Promise<ExamPeriod> {
    const response = await apiClient.get(`/medical-campaigns/${id}`);
    return response.data;
  }

  // Tạo đợt khám mới
  async createExamPeriod(examPeriod: ExamPeriodRequest): Promise<ExamPeriod> {
    const response = await apiClient.post('/medical-campaigns', examPeriod);
    return response.data;
  }

  // Cập nhật đợt khám
  async updateExamPeriod(id: number, examPeriod: Partial<ExamPeriodRequest>): Promise<ExamPeriod> {
    const response = await apiClient.put(`/medical-campaigns/${id}`, examPeriod);
    return response.data;
  }

  // Xóa đợt khám
  async deleteExamPeriod(id: number): Promise<void> {
    await apiClient.delete(`/medical-campaigns/${id}`);
  }
}

export default new ExamPeriodService();