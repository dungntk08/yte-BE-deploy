package sk.ytr.modules.entity;
import jakarta.persistence.*;
import lombok.*;
/**
 * Chỉ tiêu khám trong từng nhóm
 * VD: Cận thị, Viêm tai giữa, Sâu răng...
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "medical_indicator")
public class MedicalIndicator {

    /** Khóa chính chỉ tiêu */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medical_indicator_seq")
    @SequenceGenerator(name = "medical_indicator_seq", sequenceName = "medical_indicator_seq", allocationSize = 1)
    private Long id;

    /** Nhóm chỉ tiêu */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private MedicalGroup group;

    /** Mã chỉ tiêu */
    @Column(name = "indicator_code", nullable = false, unique = true)
    private String indicatorCode;

    /** Tên chỉ tiêu */
    @Column(name = "indicator_name", nullable = false)
    private String indicatorName;

    /** Có chỉ tiêu con hay không */
    @Column(name = "has_sub_indicator")
    private Boolean hasSubIndicator;

    /** Thứ tự hiển thị */
    @Column(name = "display_order")
    private Integer displayOrder;

    /** Trạng thái sử dụng */
    @Column(name = "is_active")
    private Boolean isActive;
}
