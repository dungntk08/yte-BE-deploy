package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.MedicalGroup;

import java.util.Optional;

public interface MedicalGroupRepository extends JpaRepository<MedicalGroup, Long> {
    boolean existsByGroupCode(String groupCode);
    boolean existsByGroupName(String groupName);

    Optional<MedicalGroup> findByGroupName(String groupName);
}