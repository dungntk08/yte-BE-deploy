package sk.ytr.modules.dto.projections;

public interface ClassStatisticProjection {
    Long getClassId();
    String getClassName();
    Integer getTotalStudent();
    Long getExaminedStudents();
}
