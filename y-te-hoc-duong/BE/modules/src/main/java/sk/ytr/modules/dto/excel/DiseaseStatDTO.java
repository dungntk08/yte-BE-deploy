package sk.ytr.modules.dto.excel;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DiseaseStatDTO {
    private String diseaseName;
    private Integer totalCase;
}
