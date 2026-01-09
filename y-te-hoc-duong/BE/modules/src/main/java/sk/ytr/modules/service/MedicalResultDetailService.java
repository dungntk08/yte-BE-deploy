package sk.ytr.modules.service;

import sk.ytr.modules.dto.excel.MedicalResultReport;
import sk.ytr.modules.dto.request.MedicalResultDetailRequestDTO;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.dto.response.TotalMedicalIndicatorResultResponseDTO;

import java.util.List;

public interface MedicalResultDetailService {

    MedicalResultDetailResponseDTO createMedicalResultDetail(MedicalResultDetailRequestDTO request);

    MedicalResultDetailResponseDTO updateMedicalResultDetail(Long id, MedicalResultDetailRequestDTO request);

    MedicalResultDetailResponseDTO getMedicalResultDetailById(Long id);

    void deleteMedicalResultDetail(Long id);

    List<MedicalResultDetailResponseDTO> getMedicalResultDetailByStudentId(Long studentId);

    List<TotalMedicalIndicatorResultResponseDTO> getTotalMedicalIndicatorResultsByCampaignId(Long campaignId);

    MedicalResultReport generateMedicalResultReportByCampaignId(Long campaignId);

}
