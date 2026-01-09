package sk.ytr.modules.dto.projections;

public interface SchoolStatisticProjection {
    Long getSchoolId();
    String getSchoolName();
    Long getTotalStudents();
    Long getExaminedStudents();
}
