package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.entity.Student;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCampaignId(Long campaignId);
    boolean existsByCampaign_IdAndIdentityNumber(Long campaignId, String identityNumber);

    List<Student> findByCampaignIdOrderByFullNameAsc(Long campaignId);
}