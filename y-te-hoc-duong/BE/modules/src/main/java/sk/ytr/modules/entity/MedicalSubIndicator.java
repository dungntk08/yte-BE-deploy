package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Chỉ tiêu con của một chỉ tiêu khám
 * VD: Cận thị → Đúng số / Chưa đúng số
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "medical_sub_indicator")
public class MedicalSubIndicator {

    /** Khóa chính chỉ tiêu con */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medical_sub_indicator_seq")
    @SequenceGenerator(name = "medical_sub_indicator_seq", sequenceName = "medical_sub_indicator_seq", allocationSize = 1)
    private Long id;

    /** Chỉ tiêu cha */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicator_id", nullable = false)
    private MedicalIndicator indicator;

    /** Mã chỉ tiêu con */
    @Column(name = "sub_code", length = 50)
    private String subCode;

    /** Tên chỉ tiêu con */
    @Column(name = "sub_name", length = 255)
    private String subName;

    /** Thứ tự hiển thị */
    @Column(name = "display_order")
    private Integer displayOrder;

    /** Trạng thái sử dụng */
    @Column(name = "is_active")
    private Boolean isActive;
}
