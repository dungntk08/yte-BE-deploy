package sk.ytr.modules.dto.excel;

import lombok.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Map;

@Data
@NoArgsConstructor
@Getter
@Setter
public class StudentMedicalExcelRow {

    // ===== CỘT CỐ ĐỊNH =====
    private Integer stt;
    private String fullName;
    private Date dob;
    private Boolean male;
    private Boolean female;
    private String address;
    private String identityNumber;
    private BigDecimal weight;
    private BigDecimal height;
    private String notifyFamily;

    // ===== CỘT ĐỘNG =====
    // key = columnIndex
    private Map<Integer, Object> medicalResults;
}
