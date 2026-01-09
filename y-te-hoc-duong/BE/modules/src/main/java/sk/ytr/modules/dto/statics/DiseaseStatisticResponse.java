package sk.ytr.modules.dto.statics;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiseaseStatisticResponse {

    private Long groupId;

    private String groupName;

    private Long medicalIndicatorId;

    private String indicatorName;

    private Long subIndicatorId;

    private String subIndicatorName;

    private Long totalStudentAffected;

}

