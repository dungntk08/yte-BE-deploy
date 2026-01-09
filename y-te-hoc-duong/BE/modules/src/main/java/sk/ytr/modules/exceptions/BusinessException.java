package sk.ytr.modules.exceptions;

import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.List;

@Getter
@Setter
public class BusinessException extends RuntimeException{

    public final String code;
    private Object data;
    private List<String> solution;

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String code, String message, Object data) {
        super(message);
        this.code = code;
        this.data = data;
    }

    public BusinessException(String code, Object data, String...message) {
        super(String.join(" | ", message));
        this.data = data;
        this.code = code;
        this.solution= Arrays.asList(message);
    }
}
