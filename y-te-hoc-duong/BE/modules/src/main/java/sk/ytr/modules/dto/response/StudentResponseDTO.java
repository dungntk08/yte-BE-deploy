package sk.ytr.modules.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import sk.ytr.modules.constant.GenderTypeEnum;
import sk.ytr.modules.entity.Student;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponseDTO {

    /** ID học sinh */
    private Long id;

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

    /** Kết quả khám của học sinh */
    private List<MedicalResultDetailResponseDTO> medicalResults;

    /** Lớp học */
    private String className;

    /** Trường học */
    private Long schoolId;

    /** Lớp học */
    private Long schoolClassId;

    /** Trường học */
    private String schoolName;


    public static StudentResponseDTO fromEntity(Student student) {
        if (student == null) {
            return null;
        }

        return StudentResponseDTO.builder()
                .id(student.getId())
                .campaignId(
                        student.getCampaign() != null
                                ? student.getCampaign().getId()
                                : null
                )
                .fullName(student.getFullName())
                .gender(student.getGender())
                .dob(student.getDob())
                .address(student.getAddress())
                .identityNumber(student.getIdentityNumber())
                .weight(student.getWeight())
                .height(student.getHeight())
                .notifyFamily(student.getNotifyFamily())
                .className(student.getClassName())
                .schoolId(
                        student.getSchool() != null
                                ? student.getSchool().getId()
                                : null
                )
                .schoolClassId(
                        student.getSchoolClass() != null
                                ? student.getSchoolClass().getId()
                                : null
                )
                .schoolName(
                        student.getSchool() != null
                                ? student.getSchool().getSchoolName()
                                : null
                )
                .className(
                        student.getSchoolClass() != null
                                ? student.getSchoolClass().getClassName()
                                : null
                )
                .build();

    }
}
