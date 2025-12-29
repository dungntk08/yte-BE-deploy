package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.constant.CampaignStatusEnum;
import sk.ytr.modules.entity.MedicalCampaign;

import java.util.Date;

/**
 * Response thông tin đợt khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalCampaignResponseDTO {

    /** ID đợt khám */
    private Long id;

    /** Thông tin trường */
    private SchoolResponseDTO school;

    /** Năm học */
    private String schoolYear;

    /** Tên đợt khám */
    private String campaignName;

    /** Ngày bắt đầu */
    private Date startDate;

    /** Ngày kết thúc */
    private Date endDate;

    /** Trạng thái đợt khám */
    private CampaignStatusEnum status;

    /** Ghi chú */
    private String note;

    /** tổng số học sinh*/
    private Integer totalStudents;

    /** tổng số học sinh được khám*/
    private Integer totalStudentsExamined;

    public static MedicalCampaignResponseDTO fromEntity(MedicalCampaign entity) {
        return MedicalCampaignResponseDTO.builder()
                .id(entity.getId())
                .school(SchoolResponseDTO.fromEntity(entity.getSchool()))
                .schoolYear(entity.getSchoolYear())
                .campaignName(entity.getCampaignName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .status(entity.getStatus())
                .note(entity.getNote())
                .totalStudents(entity.getTotalStudents())
                .totalStudentsExamined(entity.getTotalStudentsExamined())
                .build();
    }
}
