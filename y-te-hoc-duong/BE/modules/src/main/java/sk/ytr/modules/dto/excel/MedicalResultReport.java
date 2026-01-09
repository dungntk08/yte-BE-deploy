package sk.ytr.modules.dto.excel;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;

import java.util.List;
@Data
@NoArgsConstructor
@Getter
@Setter
public class MedicalResultReport {

    private MedicalCampaignResponseDTO medicalCampaignResponseDTO;
    private List<DiseaseReportDTO> diseaseReports;
    //Thừa cân
    private Integer overWeightCount;
    //Suy dinh dưỡng
    private Integer underWeightCount;
    //Béo phì
    private Integer obesityCount;
    //Tỷ lệ khám
    private Float averageExamined;
}
