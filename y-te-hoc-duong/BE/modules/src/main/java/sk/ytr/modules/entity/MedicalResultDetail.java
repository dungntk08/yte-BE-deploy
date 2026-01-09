package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import sk.ytr.modules.dto.request.MedicalResultDetailRequestDTO;
import sk.ytr.modules.entity.common.BaseEntity;

/**
 * Kết quả khám sức khỏe chi tiết của từng học sinh
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "medical_result_detail")
public class MedicalResultDetail extends BaseEntity {

    /** Khóa chính kết quả */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medical_result_detail_seq")
    @SequenceGenerator(name = "medical_result_detail_seq", sequenceName = "medical_result_detail_seq", allocationSize = 1)
    private Long id;

    /** Học sinh được khám */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    /** Kết quả Đợt khám mà học sinh tham gia */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private MedicalCampaign campaign;

    /**
     * Giá trị kết quả khám (boolean)
     */
    @Column(name = "result_value")
    private Boolean resultValue;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    @Column(name = "medical_group_id")
    private Long medicalGroupId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    @Column(name = "medical_indicator_id")
    private Long medicalIndicatorId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    @Column(name = "medical_sub_indicator_id")
    private Long medicalSubIndicatorId;

    /**
     * Cập nhật kết quả khám
     */
    public void updateFromRequest(MedicalResultDetailRequestDTO request) {
        if (request.getResultValue() != null) {
            if (request.getResultValue() instanceof Boolean) {
                this.resultValue = (Boolean) request.getResultValue();
            } else if (request.getResultValue() instanceof String) {
                this.resultValue = Boolean.parseBoolean((String) request.getResultValue());
            } else {
                throw new IllegalArgumentException("Giá trị kết quả khám không hợp lệ");
            }
        }
    }
}
