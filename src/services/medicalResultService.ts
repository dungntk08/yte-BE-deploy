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
  // Export Excel kết quả khám (danh sách học sinh đã khám)
  async exportExcel(campaignId: number, schoolId?: number, classId?: number): Promise<Blob> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId.toString());
    if (classId) params.append('classId', classId.toString());
    
    const url = `/medical-results/export-medical-result/${campaignId}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export Excel báo cáo tổng hợp kết quả khám
  async exportStatisticExcel(campaignId: number, schoolId?: number, classId?: number): Promise<Blob> {
    const params = new URLSearchParams();
    if (schoolId) params.append('schoolId', schoolId.toString());
    if (classId) params.append('classId', classId.toString());
    
    const url = `/medical-results/export-statistic-medical-result/${campaignId}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Import Excel kết quả khám
  async importExcel(campaignId: number, schoolId: number, classId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/medical-results/import-excel/${campaignId}/${schoolId}/${classId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Tải file mẫu Excel
  async downloadTemplate(campaignId: number, schoolId: number, classId: number): Promise<Blob> {
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

  // Cập nhật kết quả khám chi tiết theo ID
  async updateMedicalResultDetail(id: number, resultValue: boolean): Promise<MedicalResultDetail> {
    const response = await apiClient.put(`/medical-result-details/${id}`, { 
      resultValue 
    });
    return response.data;
  }

  // Lấy chi tiết medical result theo ID
  async getMedicalResultDetailById(id: number): Promise<MedicalResultDetail> {
    const response = await apiClient.get(`/medical-result-details/${id}`);
    return response.data;
  }
}

export default new MedicalResultService();
