package sk.ytr.modules.dto.statics;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClassStatisticResponse {

    private Long classId;

    private String className;

    private Integer totalStudents;

    private Long examinedStudents;
}
