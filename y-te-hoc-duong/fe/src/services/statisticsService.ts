import api from './api';

// Response Types
export interface CampaignOverviewResponse {
  totalStudents: number;
  totalStudentsExamined: number;
}

export interface SchoolStatisticResponse {
  schoolId: number;
  schoolName: string;
  totalStudents: number;
  examinedStudents: number;
}

export interface ClassStatisticResponse {
  classId: number;
  className: string;
  totalStudent: number;
  examinedStudents: number;
}

export interface DiseaseStatisticResponse {
  groupId: number;
  groupName: string;
  medicalIndicatorId: number;
  indicatorName: string;
  subIndicatorId: number | null;
  subIndicatorName: string | null;
  totalStudentAffected: number;
}

export interface StudentYearStatisticResponse {
  schoolYear: string;
  totalDiseaseCount: number;
}

// API Functions
export const statisticsService = {
  // 1. Tổng quan đợt khám
  getCampaignOverview: async (campaignId: number): Promise<CampaignOverviewResponse> => {
    const response = await api.get(`/statistics/campaign/${campaignId}/overview`);
    return response.data;
  },

  // 2. Thống kê theo trường học
  getSchoolStatistics: async (campaignId: number): Promise<SchoolStatisticResponse[]> => {
    const response = await api.get(`/statistics/campaign/${campaignId}/schools`);
    return response.data;
  },

  // 3. Thống kê theo lớp
  getClassStatistics: async (campaignId: number, schoolId: number): Promise<ClassStatisticResponse[]> => {
    const response = await api.get(`/statistics/campaign/${campaignId}/school/${schoolId}/classes`);
    return response.data;
  },

  // 4. Thống kê theo bệnh
  getDiseaseStatistics: async (campaignId: number): Promise<DiseaseStatisticResponse[]> => {
    const response = await api.get(`/statistics/campaign/${campaignId}/diseases`);
    return response.data;
  },

  // 5. So sánh kết quả khám theo năm (theo học sinh)
  getStudentYearStatistics: async (studentId: number): Promise<StudentYearStatisticResponse[]> => {
    const response = await api.get(`/statistics/student/${studentId}/years`);
    return response.data;
  },
};
