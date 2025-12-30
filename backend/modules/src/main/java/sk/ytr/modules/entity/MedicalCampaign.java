package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import sk.ytr.modules.constant.CampaignStatusEnum;
import sk.ytr.modules.entity.common.BaseEntity;

import java.util.Date;
/**
 * Đợt khám sức khỏe học đường theo năm học
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "medical_campaign")
public class MedicalCampaign extends BaseEntity {

    /** Khóa chính đợt khám */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medical_campaign_seq")
    @SequenceGenerator(name = "medical_campaign_seq", sequenceName = "medical_campaign_seq", allocationSize = 1)
    private Long id;

    /** Trường học tổ chức đợt khám */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    /** Năm học áp dụng (VD: 2025-2026) */
    @Column(name = "school_year", length = 20)
    private String schoolYear;

    /** Tên đợt khám */
    @Column(name = "campaign_name", length = 255)
    private String campaignName;

    /** Ngày bắt đầu khám */
    @Column(name = "start_date")
    private Date startDate;

    /** Ngày kết thúc khám */
    @Column(name = "end_date")
    private Date endDate;

    /** Trạng thái đợt khám: DRAFT / IN_PROGRESS / CLOSED */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CampaignStatusEnum status;

    /** Ghi chú thêm cho đợt khám */
    @Column(name = "note", length = 1000)
    private String note;

    /** tổng số học sinh*/
    @Column(name = "total_students")
    private Integer totalStudents;

    /** tổng số học sinh được khám*/
    @Column(name = "total_students_examined")
    private Integer totalStudentsExamined;

    /**
     * Cấu hình chỉ tiêu khám áp dụng cho đợt khám
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_medical_config_id", nullable = false)
    private CampaignMedicalConfig campaignMedicalConfig;
}
