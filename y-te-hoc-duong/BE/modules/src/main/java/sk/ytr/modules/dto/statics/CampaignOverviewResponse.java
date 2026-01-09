package sk.ytr.modules.dto.statics;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CampaignOverviewResponse {

    private Long campaignId;

    private Integer totalStudents;

    private Integer totalStudentsExamined;

    private Integer totalStudentsNotExamined;

}

