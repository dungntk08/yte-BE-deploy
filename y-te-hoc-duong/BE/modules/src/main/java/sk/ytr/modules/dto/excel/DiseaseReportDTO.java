package sk.ytr.modules.dto.excel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DiseaseReportDTO {
    private String diseaseName;
    private Integer totalCase;
}

