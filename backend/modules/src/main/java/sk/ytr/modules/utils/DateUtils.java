package sk.ytr.modules.utils;

import lombok.experimental.UtilityClass;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@UtilityClass

public class DateUtils {
    private static ZoneId localZoneId = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("d/M/yyyy");
    private static final SimpleDateFormat INPUT_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public static LocalDate convertToLocalDateViaInstant(Date dateToConvert) {
        if (dateToConvert == null) {
            return null;
        }
        return dateToConvert.toInstant().atZone(localZoneId).toLocalDate();
    }

    public static LocalDateTime convertToLocalDateTime(Date dateToConvert) {
        if (dateToConvert == null) {
            return null;
        }
        return dateToConvert.toInstant().atZone(localZoneId).toLocalDateTime();
    }


    public static Date convertToDate(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }

        return Date.from(localDateTime.atZone(localZoneId).toInstant());
    }

    public static Date convertToDate(LocalDate localDateTime) {
        if (localDateTime == null) {
            return null;
        }

        return Date.from(localDateTime.atStartOfDay(localZoneId).toInstant());
    }

    public static Date plusMonths(Date input, long month) {
        LocalDateTime localIn = convertToLocalDateTime(input);
        return convertToDate(localIn.plusMonths(month));
    }

    public static Date getNow() {
        LocalDateTime now = LocalDateTime.now(localZoneId);
        return convertToDate(now);
    }

    public static String getNowString() {
        LocalDateTime now = LocalDateTime.now(localZoneId);
        Date dateNow = convertToDate(now);
        return convertDateToString(dateNow);
    }

    public static String getNowStringAndFormat(String format) {
        LocalDateTime now = LocalDateTime.now(localZoneId);
        Date dateNow = convertToDate(now);
        return convertDateToString(dateNow, format);
    }

    /**
     * Chuyển đổi Date thành chuỗi định dạng yyyy-MM-dd
     *
     * @param dateToConvert Đối tượng Date cần chuyển đổi
     * @return Chuỗi định dạng yyyy-MM-dd hoặc null nếu dateToConvert là null
     */
    public static String convertDateToString(Date dateToConvert) {
        if (dateToConvert == null) {
            return null;
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        return dateFormat.format(dateToConvert);
    }

    /**
     * Chuyển đổi Date thành chuỗi
     *
     * @param dateToConvert Đối tượng Date cần chuyển đổi
     * @param format        Định dạng chuỗi cần chuyển đổi
     * @return Chuỗi định dạng hoặc null
     */
    public static String convertDateToString(Date dateToConvert, String format) {
        if (dateToConvert == null) {
            return null;
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        return dateFormat.format(dateToConvert);
    }

    public static String convertDateToStringAndFormat(Date dateToConvert, String format) {
        if (dateToConvert == null) {
            return "";
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        return dateFormat.format(dateToConvert);
    }

    public static String convertDateToStringAndFormat(Date dateToConvert) {
        if (dateToConvert == null) {
            return "";
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        return dateFormat.format(dateToConvert);
    }

    public static String convertDateToStringAndFormatMonth(Date dateToConvert) {
        if (dateToConvert == null) {
            return "";
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/yyyy");
        return dateFormat.format(dateToConvert);
    }

    public static String convertLocalDateToStringAndFormatMonth(LocalDate dateToConvert) {
        if (dateToConvert == null) {
            return "";
        }
        // Chuyển LocalDate thành java.util.Date
        Date date = Date.from(dateToConvert.atStartOfDay(ZoneId.systemDefault()).toInstant());
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/yyyy");
        return dateFormat.format(date);
    }

    public static String convertLocalDateToStringAndFormatMonth(LocalDate dateToConvert, String format) {
        if (dateToConvert == null) {
            return "";
        }
        // Chuyển LocalDate thành java.util.Date
        Date date = Date.from(dateToConvert.atStartOfDay(ZoneId.systemDefault()).toInstant());
        SimpleDateFormat dateFormat = new SimpleDateFormat(format);
        return dateFormat.format(date);
    }

    public static String convertDateToStringAndFormatMonthDay(Date dateToConvert) {
        if (dateToConvert == null) {
            return "";
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM");
        return dateFormat.format(dateToConvert);
    }

}

