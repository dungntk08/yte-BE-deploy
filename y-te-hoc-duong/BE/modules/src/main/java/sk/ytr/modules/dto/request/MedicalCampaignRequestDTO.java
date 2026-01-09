package sk.ytr.modules.dto.request;

import jakarta.persistence.Entity;
import lombok.*;
import sk.ytr.modules.constant.CampaignStatusEnum;
import sk.ytr.modules.entity.CampaignMedicalConfig;

import java.util.Date;

/**
 * Request tạo / chỉnh sửa đợt khám sức khỏe
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalCampaignRequestDTO {

    /** Năm học (VD: 2025-2026) */
    private String schoolYear;

    /** Tên đợt khám */
    private String campaignName;

    /** Ngày bắt đầu khám */
    private Date startDate;

    /** Ngày kết thúc khám */
    private Date endDate;

    /** Ghi chú cho đợt khám */
    private String note;

    /** Trạng thái đợt khám: DRAFT / IN_PROGRESS / CLOSED */
    private CampaignStatusEnum status;

    /** tổng số học sinh*/
    private Integer totalStudents;

    /** tổng số học sinh được khám*/
    private Integer totalStudentsExamined;

    /** Cấu hình chỉ tiêu khám áp dụng cho đợt khám*/
    private CampaignMedicalConfig campaignMedicalConfig;
}
