import { useState, useEffect } from 'react';
import examPeriodService, { ExamPeriod } from '../services/examPeriodService';

// Mock data cho development/testing
const mockCampaigns: ExamPeriod[] = [
  {
    id: 1,
    schoolYear: '2025',
    campaignName: 'T10/2025',
    startDate: '2025-10-21',
    endDate: '2025-11-21',
    status: 'CLOSED',
    totalStudents: 450,
    totalStudentsExamined: 450,
    note: 'Đợt khám định kỳ tháng 10'
  },
  {
    id: 2,
    schoolYear: '2025',
    campaignName: 'Test tháng 11',
    startDate: '2025-11-22',
    endDate: '2025-12-21',
    status: 'IN_PROGRESS',
    totalStudents: 500,
    totalStudentsExamined: 230,
    note: 'Đợt test thử nghiệm'
  },
  {
    id: 3,
    schoolYear: '2025',
    campaignName: 'IT2 local',
    startDate: '2025-12-22',
    endDate: '2026-01-22',
    status: 'IN_PROGRESS',
    totalStudents: 380,
    totalStudentsExamined: 0,
    note: 'Đợt khám cho khối IT'
  },
  {
    id: 4,
    schoolYear: '2024',
    campaignName: 'Khám sức khỏe đầu năm 2024',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'CLOSED',
    totalStudents: 520,
    totalStudentsExamined: 520,
  },
  {
    id: 5,
    schoolYear: '2024',
    campaignName: 'Khám giữa năm 2024',
    startDate: '2024-06-01',
    endDate: '2024-06-30',
    status: 'CLOSED',
    totalStudents: 500,
    totalStudentsExamined: 495,
  },
];

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<ExamPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await examPeriodService.getExamPeriods();
      setCampaigns(data);
      setUseMockData(false);
    } catch (err: any) {
      // Only log in development mode
      if (err?.code !== 'ERR_NETWORK') {
        console.warn('API not available, using mock data:', err);
      }
      setCampaigns(mockCampaigns);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async (campaign: Omit<ExamPeriod, 'id'>) => {
    try {
      if (useMockData) {
        // Mock create
        const newCampaign: ExamPeriod = {
          ...campaign,
          id: Math.max(...campaigns.map(c => c.id || 0)) + 1,
          totalStudents: 0,
          totalStudentsExamined: 0,
        };
        setCampaigns([...campaigns, newCampaign]);
        return newCampaign;
      } else {
        const created = await examPeriodService.createExamPeriod(campaign);
        await fetchCampaigns();
        return created;
      }
    } catch (err) {
      setError('Không thể tạo đợt khám');
      throw err;
    }
  };

  const updateCampaign = async (id: number, updates: Partial<ExamPeriod>) => {
    try {
      if (useMockData) {
        // Mock update
        setCampaigns(campaigns.map(c => c.id === id ? { ...c, ...updates } : c));
      } else {
        await examPeriodService.updateExamPeriod(id, updates);
        await fetchCampaigns();
      }
    } catch (err) {
      setError('Không thể cập nhật đợt khám');
      throw err;
    }
  };

  const deleteCampaign = async (id: number) => {
    try {
      if (useMockData) {
        // Mock delete
        setCampaigns(campaigns.filter(c => c.id !== id));
      } else {
        await examPeriodService.deleteExamPeriod(id);
        await fetchCampaigns();
      }
    } catch (err) {
      setError('Không thể xóa đợt khám');
      throw err;
    }
  };

  return {
    campaigns,
    loading,
    error,
    useMockData,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}