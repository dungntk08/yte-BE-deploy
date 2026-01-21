import apiClient from './api';

export interface MedicalCampaign {
  id: number;
  school: any;
  schoolYear: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  status: string;
  note?: string;
  totalStudents?: number;
  totalStudentsExamined?: number;
  campaignMedicalConfig?: any;
}

export interface MedicalCampaignRequestDTO {
  schoolId: number;
  schoolYear: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  note?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'CLOSED';
  totalStudents?: number;
  totalStudentsExamined?: number;
  campaignMedicalConfig?: any;
}

const campaignService = {
  // Lấy tất cả các campaign
  getAllCampaigns: async (): Promise<MedicalCampaign[]> => {
    const response = await apiClient.get('/medical-campaigns');
    return response.data;
  },

  // Tạo mới campaign
  createCampaign: async (data: MedicalCampaignRequestDTO): Promise<MedicalCampaign> => {
    const response = await apiClient.post('/medical-campaigns', data);
    return response.data;
  },
};

export default campaignService;
