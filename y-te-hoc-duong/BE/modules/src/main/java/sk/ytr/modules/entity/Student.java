package sk.ytr.modules.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import sk.ytr.modules.constant.GenderTypeEnum;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.entity.common.BaseEntity;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Thông tin học sinh tham gia khám sức khỏe
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "student")
public class Student extends BaseEntity {

    /** Khóa chính học sinh */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "student_seq")
    @SequenceGenerator(name = "student_seq", sequenceName = "student_seq", allocationSize = 1)
    private Long id;

    /** Đợt khám mà học sinh tham gia */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private MedicalCampaign campaign;

    /** Họ và tên học sinh */
    @Column(name = "full_name", nullable = false)
    private String fullName;

    /** Giới tính học sinh (MALE / FEMALE) */
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private GenderTypeEnum gender;

    /** Ngày tháng năm sinh */
    @Column(name = "dob", nullable = false)
    private Date dob;

    /** Địa chỉ nơi ở của học sinh */
    @Column(name = "address", length = 500)
    private String address;

    /** Mã định danh hoặc CCCD */
    @Column(name = "identity_number", length = 50, nullable = false)
    private String identityNumber;

    /** Cân nặng (kg) */
    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal  weight;

    /** Chiều cao (cm) */
    @Column(name = "height", precision = 5, scale = 2)
    private BigDecimal height;

    /** Nội dung thông báo kết quả khám gửi về gia đình */
    @Column(name = "notify_family", length = 1000)
    private String notifyFamily;

    /** Lớp học */
    @Column(name = "class_name", length = 100)
    private String className;

    /** Trường học */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    /** Lớp học */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_class_id")
    private SchoolClass schoolClass;

    /**
     * Cập nhật thông tin học sinh từ RequestDTO
     */
    public void updateFromRequest(StudentRequestDTO request) {

        if (request.getFullName() != null) {
            this.fullName = request.getFullName();
        }

        if (request.getGender() != null) {
            this.gender = request.getGender();
        }

        if (request.getDob() != null) {
            this.dob = request.getDob();
        }

        if (request.getAddress() != null) {
            this.address = request.getAddress();
        }

        if (request.getIdentityNumber() != null) {
            this.identityNumber = request.getIdentityNumber();
        }

        if (request.getWeight() != null) {
            this.weight = request.getWeight();
        }

        if (request.getHeight() != null) {
            this.height = request.getHeight();
        }

        if (request.getNotifyFamily() != null) {
            this.notifyFamily = request.getNotifyFamily();
        }

    }

}
