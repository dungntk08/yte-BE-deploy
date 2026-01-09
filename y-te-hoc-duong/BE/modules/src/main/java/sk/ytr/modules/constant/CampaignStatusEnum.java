package sk.ytr.modules.constant;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

@Getter
public enum CampaignStatusEnum {

    DRAFT("DRAFT", "Nháp"),
    IN_PROGRESS("IN_PROGRESS", "Đang tiến hành"),
    CLOSED("CLOSED", "Đã đóng");

    @JsonValue
    private final String code;
    private final String description;

    CampaignStatusEnum(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static CampaignStatusEnum fromCode(String code) {
        return Arrays.stream(values())
                .filter(t -> t.code.equals(code))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("code = " + code + " isn't defined!!!"));
    }

    public static boolean containsDescription(String description) {
        return Arrays.stream(values())
                .anyMatch(t -> t.description.equalsIgnoreCase(description));
    }
}
