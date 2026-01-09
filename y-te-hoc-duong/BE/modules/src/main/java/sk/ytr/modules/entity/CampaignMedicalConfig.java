package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.*;
/**
 * Cấu hình các chỉ tiêu khám áp dụng cho từng đợt khám
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "campaign_medical_config")
public class CampaignMedicalConfig {

    /** Khóa chính cấu hình */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "campaign_medical_config_seq")
    @SequenceGenerator(name = "campaign_medical_config_seq", sequenceName = "campaign_medical_config_seq", allocationSize = 1)
    private Long id;

    /** Bắt buộc nhập hay không */
    @Column(name = "config_name")
    private String configName;
}
