import apiClient from "./api";

export interface MedicalSubIndicatorResponseDTO {
  id: number;
  subCode: string;
  subName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MedicalIndicatorResponseDTO {
  id: number;
  indicatorCode: string;
  medicalGroupId: number;
  indicatorName: string;
  hasSubIndicator: boolean;
  displayOrder: number;
  isActive: boolean;
  medicalSubIndicators?: MedicalSubIndicatorResponseDTO[];
}

export interface MedicalGroupResponseDTO {
  id: number;
  groupCode: string;
  groupName: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CampaignMedicalConfigSubResponseDTO {
  id: number;
  medicalGroup: MedicalGroupResponseDTO;
  campaignMedicalConfigId: number;
  displayOrder: number;
  medicalIndicators: MedicalIndicatorResponseDTO[];
}

const campaignMedicalConfigService = {
  getConfigByCampaignId: async (
    campaignId: number
  ): Promise<CampaignMedicalConfigSubResponseDTO[]> => {
    const response = await apiClient.get<CampaignMedicalConfigSubResponseDTO[]>(
      `/campaign-medical-configs/getByCampaignId/config/${campaignId}`
    );
    return response.data;
  },
};

export default campaignMedicalConfigService;
