package sk.ytr.modules.dto.statics;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StudentYearStatisticResponse {

    private String schoolYear;

    private Long totalDiseaseCount;
}
