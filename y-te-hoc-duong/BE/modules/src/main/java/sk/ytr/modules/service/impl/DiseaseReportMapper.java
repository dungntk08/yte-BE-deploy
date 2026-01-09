package sk.ytr.modules.service.impl;

import sk.ytr.modules.dto.excel.DiseaseReportDTO;
import sk.ytr.modules.dto.response.TotalMedicalIndicatorResultResponseDTO;
import sk.ytr.modules.dto.response.TotalMedicalSubIndicatorResultResponseDTO;

import java.util.ArrayList;
import java.util.List;

public class DiseaseReportMapper {

    public static List<DiseaseReportDTO> mapToDiseaseDataset(
            List<TotalMedicalIndicatorResultResponseDTO> indicatorResults
    ) {

        List<DiseaseReportDTO> result = new ArrayList<>();

        for (TotalMedicalIndicatorResultResponseDTO indicator : indicatorResults) {

            // Có bệnh con
            if (indicator.isHasSubIndicators()
                    && indicator.getSubIndicatorResults() != null
                    && !indicator.getSubIndicatorResults().isEmpty()) {

                for (TotalMedicalSubIndicatorResultResponseDTO sub : indicator.getSubIndicatorResults()) {
                    result.add(new DiseaseReportDTO(
                            sub.getSubIndicatorName(),
                            sub.getTotalCount().intValue()
                    ));
                }

            }
            // Không có bệnh con
            else {
                result.add(new DiseaseReportDTO(
                        indicator.getIndicatorName(),
                        indicator.getTotalCount().intValue()
                ));
            }
        }

        return result;
    }
}

