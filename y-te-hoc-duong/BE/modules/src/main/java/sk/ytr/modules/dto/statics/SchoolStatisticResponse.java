package sk.ytr.modules.dto.statics;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SchoolStatisticResponse {

    private Long schoolId;

    private String schoolName;

    private Integer totalStudents;

    private Long examinedStudents;
}
