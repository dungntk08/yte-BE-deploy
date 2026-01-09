package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import sk.ytr.modules.dto.projections.ClassStatisticProjection;
import sk.ytr.modules.dto.projections.StudentYearStatisticProjection;
import sk.ytr.modules.entity.SchoolClass;

import java.util.List;
import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    List<SchoolClass> findBySchoolId(Long schoolId);

    Optional<SchoolClass> findByClassNameAndSchoolId(String className, Long schoolId);

    @Query(value = """
                SELECT
                    sc.id AS classId,
                    sc.class_name AS className,
                    sc.total_student AS totalStudent,
                    COUNT(st.id) AS examinedStudents
                FROM school_class sc
                LEFT JOIN student st
                       ON st.school_class_id = sc.id
                      AND st.campaign_id = :campaignId
                WHERE sc.school_id = :schoolId
                GROUP BY sc.id, sc.class_name, sc.total_student
                ORDER BY sc.class_name
            """, nativeQuery = true)
    List<ClassStatisticProjection> statisticByCampaignAndSchool(
            Long campaignId,
            Long schoolId
    );

    @Query(value = """
                SELECT
                    mc.school_year AS schoolYear,
                    COUNT(mrd.id) AS totalDiseaseCount
                FROM medical_result_detail mrd
                JOIN medical_campaign mc
                     ON mc.id = mrd.campaign_id
                WHERE mrd.student_id = :studentId
                  AND mrd.result_value = TRUE
                GROUP BY mc.school_year
                ORDER BY mc.school_year
            """, nativeQuery = true)
    List<StudentYearStatisticProjection> statisticStudentByYears(Long studentId);


}
