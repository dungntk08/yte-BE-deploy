package sk.ytr.modules.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import sk.ytr.modules.constant.GenderTypeEnum;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.School;
import sk.ytr.modules.entity.SchoolClass;
import sk.ytr.modules.entity.Student;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Request tạo / import học sinh
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequestDTO {

    /** ID đợt khám */
    private Long campaignId;

    /** Họ và tên học sinh */
    private String fullName;

    /** Giới tính (MALE / FEMALE) */
    private GenderTypeEnum gender;

    /** Ngày sinh */
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private Date dob;

    /** Địa chỉ học sinh */
    private String address;

    /** CCCD / mã định danh */
    private String identityNumber;

    /** Cân nặng (kg) */
    private BigDecimal weight;

    /** Chiều cao (cm) */
    private BigDecimal height;

    /** Nội dung thông báo về gia đình */
    private String notifyFamily;

    /** Lớp học */
    private String className;

    /** Trường học */
    private Long schoolId;

    /** Lớp học */
    private Long schoolClassId;

    /**
     * Convert RequestDTO → Entity
     */
    public Student toEntity(MedicalCampaign campaign) {
        return Student.builder()
                .campaign(campaign)
                .fullName(this.fullName)
                .gender(this.gender)
                .dob(this.dob)
                .address(this.address)
                .identityNumber(this.identityNumber)
                .weight(this.weight)
                .height(this.height)
                .notifyFamily(this.notifyFamily)
                .className(this.className)
                .build();
    }
}
