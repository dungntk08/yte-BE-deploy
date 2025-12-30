package sk.ytr.modules.dto.request;

import lombok.*;
import sk.ytr.modules.entity.MedicalCampaign;
import sk.ytr.modules.entity.MedicalResultDetail;
import sk.ytr.modules.entity.Student;

/**
 * Request lưu kết quả khám cho học sinh
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalResultDetailRequestDTO {

    /**
     * ID học sinh
     */
    private Long studentId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    private Long medicalGroupId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    private Long medicalIndicatorId;

    /**
     * Cấu hình chỉ tiêu nhóm khám
     */
    private Long medicalSubIndicatorId;

    /**
     * Giá trị kết quả (true/false hoặc chi tiết JSON)
     */
    private Object resultValue;

    /** Kết quả Đợt khám mà học sinh tham gia */
    private MedicalCampaign campaign;

    /**
     * Convert RequestDTO → Entity
     */
    public MedicalResultDetail toEntity(
            Student student,
            MedicalResultDetailRequestDTO request
    ) {
        return MedicalResultDetail.builder()
                .student(student)
                .medicalGroupId(request.getMedicalGroupId())
                .medicalIndicatorId(request.getMedicalIndicatorId())
                .medicalSubIndicatorId(request.getMedicalSubIndicatorId())
                .campaign(request.getCampaign())
                .resultValue(convertResultValue())
                .build();
    }

    /**
     * Chuẩn hóa dữ liệu resultValue
     */
    private Boolean convertResultValue() {
        if (resultValue == null) {
            return null;
        }

        if (resultValue instanceof Boolean) {
            return (Boolean) resultValue;
        }

        if (resultValue instanceof String) {
            return Boolean.parseBoolean((String) resultValue);
        }

        throw new IllegalArgumentException("Giá trị kết quả khám không hợp lệ");
    }
}
