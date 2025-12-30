package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import sk.ytr.modules.entity.common.BaseEntity;

/**
 * Cấu hình nhóm chỉ tiêu khám
 * Áp dụng cho từng cấu hình đợt khám
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "campaign_medical_config_sub")
public class CampaignMedicalConfigSub extends BaseEntity {

    /** Khóa chính */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "campaign_medical_config_sup_seq")
    @SequenceGenerator(name = "campaign_medical_config_sup_seq", sequenceName = "campaign_medical_config_sup_seq", allocationSize = 1)
    private Long id;

    /** Nhóm chỉ tiêu y tế (Nội khoa, Tâm thần, Mắt,...) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_group_id", nullable = false)
    private MedicalGroup medicalGroup;

    /** Cấu hình chỉ tiêu khám theo đợt */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_medical_config_id", nullable = false)
    private CampaignMedicalConfig campaignMedicalConfig;

    /** Thứ tự hiển thị nhóm chỉ tiêu */
    @Column(name = "display_order")
    private Integer displayOrder;

}
