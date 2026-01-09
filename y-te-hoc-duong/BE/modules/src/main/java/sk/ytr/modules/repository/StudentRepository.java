package sk.ytr.modules.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import sk.ytr.modules.entity.Student;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCampaignId(Long campaignId);

    List<Student> findBySchoolId(Long schoolId);

    boolean existsByCampaign_IdAndIdentityNumber(Long campaignId, String identityNumber);

    List<Student> findByCampaignIdOrderByFullNameAsc(Long campaignId);

    @Query(
            value = """
                    SELECT s.*
                    FROM student s
                    WHERE s.campaign_id = :campaignId
                      AND (
                            :keyword IS NULL
                            OR TRIM(:keyword) = ''
                            OR LOWER(s.full_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(CAST(s.identity_number AS TEXT)) LIKE LOWER(CONCAT('%', :keyword, '%'))
                      )
                    ORDER BY s.class_name ASC, s.full_name ASC
                    """,
            nativeQuery = true
    )
    List<Student> searchByCampaignAndKeyword(
            @Param("campaignId") Long campaignId,
            @Param("keyword") String keyword
    );

    @Query(
            value = """
        SELECT *
        FROM student s
        WHERE s.campaign_id = :campaignId
          AND (
                :keyword IS NULL
                OR lower(s.full_name) LIKE lower(concat('%', CAST(:keyword AS text), '%'))
                OR lower(s.identity_number) LIKE lower(concat('%', CAST(:keyword AS text), '%'))
          )
          AND (:schoolId IS NULL OR s.school_id = :schoolId)
          AND (:schoolClassId IS NULL OR s.school_class_id = :schoolClassId)
        ORDER BY s.class_name ASC, s.full_name ASC
        """,
            countQuery = """
        SELECT count(*)
        FROM student s
        WHERE s.campaign_id = :campaignId
          AND (
                :keyword IS NULL
                OR lower(s.full_name) LIKE lower(concat('%', CAST(:keyword AS text), '%'))
                OR lower(s.identity_number) LIKE lower(concat('%', CAST(:keyword AS text), '%'))
          )
          AND (:schoolId IS NULL OR s.school_id = :schoolId)
          AND (:schoolClassId IS NULL OR s.school_class_id = :schoolClassId)
        """,
            nativeQuery = true
    )
    Page<Student> searchByCampaignAndFilters(
            @Param("campaignId") Long campaignId,
            @Param("keyword") String keyword,
            @Param("schoolId") Long schoolId,
            @Param("schoolClassId") Long schoolClassId,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(s.id)
        FROM Student s
        WHERE s.campaign.id = :campaignId
          AND s.school.id = :schoolId
    """)
    long countByCampaignAndSchool(
            @Param("campaignId") Long campaignId,
            @Param("schoolId") Long schoolId
    );

}