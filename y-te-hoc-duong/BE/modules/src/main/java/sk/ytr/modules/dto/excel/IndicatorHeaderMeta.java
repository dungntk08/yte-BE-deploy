package sk.ytr.modules.dto.excel;

import lombok.*;

/**
 * key: columnIndex
 * value: cấu hình chỉ tiêu
 */
@Data
@NoArgsConstructor
@Getter
@Setter
public class IndicatorHeaderMeta {
    private Long groupId;
    private Long indicatorId;
    private Long subIndicatorId;
}
