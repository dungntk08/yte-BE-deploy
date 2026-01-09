package sk.ytr.modules.dto.response;

import lombok.*;
import sk.ytr.modules.constant.CampaignStatusEnum;
import sk.ytr.modules.entity.CampaignMedicalConfig;
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

    /** Cấu hình chỉ tiêu khám áp dụng cho đợt khám*/
    private CampaignMedicalConfigResponseDTO campaignMedicalConfig;


    public static MedicalCampaignResponseDTO fromEntity(MedicalCampaign entity) {
        return MedicalCampaignResponseDTO.builder()
                .id(entity.getId())
                .campaignName(entity.getCampaignName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .status(entity.getStatus())
                .note(entity.getNote())
                .totalStudents(entity.getTotalStudents())
                .totalStudentsExamined(entity.getTotalStudentsExamined())
                .campaignMedicalConfig(CampaignMedicalConfigResponseDTO.fromEntity(
                        entity.getCampaignMedicalConfig()
                ))
                .build();
    }
}
