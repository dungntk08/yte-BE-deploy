package sk.ytr.modules.dto.request;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Getter
@Setter
public class SchoolClassRequestDTO {
    private Long schoolId;
    private String className;
    private Integer grade;
    private Integer totalStudent;
    private String schoolYear;
}
