package sk.ytr.modules.dto.projections;

public interface DiseaseStatisticProjection {

    Long getGroupId();
    String getGroupName();
    Long getIndicatorId();
    String getIndicatorName();
    Long getSubIndicatorId();
    String getSubIndicatorName();
    Long getTotalStudentAffected();
}
