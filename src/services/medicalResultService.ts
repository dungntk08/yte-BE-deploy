import apiClient from './api';
import { MedicalResultDetail } from './studentService';

export interface UpdateMedicalResultRequest {
  studentId: number;
  campaignId: number;
  medicalGroupId?: number;
  medicalIndicatorId?: number;
  medicalSubIndicatorId?: number;
  resultValue: boolean;
}

class MedicalResultService {
  // Export Excel kết quả khám
  async exportExcel(campaignId: number): Promise<Blob> {
    const response = await apiClient.get('/medical-results/export', {
      params: { campaignId },
      responseType: 'blob',
    });
    return response.data;
  }

  // Import Excel kết quả khám
  async importExcel(campaignId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/medical-results/import-excel/${campaignId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Tải file mẫu Excel
  async downloadTemplate(campaignId: number): Promise<Blob> {
    const response = await apiClient.get(`/medical-results/export-template/${campaignId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Cập nhật kết quả khám (nếu có API riêng)
  async updateMedicalResult(data: UpdateMedicalResultRequest): Promise<MedicalResultDetail> {
    const response = await apiClient.post('/medical-results', data);
    return response.data;
  }
}

export default new MedicalResultService();
