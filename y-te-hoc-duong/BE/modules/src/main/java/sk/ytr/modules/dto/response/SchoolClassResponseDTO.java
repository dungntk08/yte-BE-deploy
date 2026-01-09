package sk.ytr.modules.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Getter
@Setter
public class SchoolClassResponseDTO {
    private Long id;
    private String className;
    private Integer grade;
    private Integer totalStudent;
    private String schoolYear;
    private Long schoolId;
}
