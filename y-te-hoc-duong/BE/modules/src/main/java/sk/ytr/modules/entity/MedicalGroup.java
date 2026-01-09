package sk.ytr.modules.entity;
import jakarta.persistence.*;
import lombok.*;
/**
 * Nhóm chỉ tiêu khám (VD: Mắt, Tai mũi họng, Răng hàm mặt...)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "medical_group")
public class MedicalGroup {

    /** Khóa chính nhóm khám */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "medical_group_seq")
    @SequenceGenerator(name = "medical_group_seq", sequenceName = "medical_group_seq", allocationSize = 1)
    private Long id;

    /** Mã nhóm khám */
    @Column(name = "group_code", nullable = false, unique = true)
    private String groupCode;

    /** Tên nhóm khám */
    @Column(name = "group_name", nullable = false)
    private String groupName;

    /** Thứ tự hiển thị trên form và báo cáo */
    @Column(name = "display_order")
    private Integer displayOrder;

    /** Trạng thái sử dụng */
    @Column(name = "is_active")
    private Boolean isActive;
}
