package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.MedicalGroup;

public interface MedicalGroupRepository extends JpaRepository<MedicalGroup, Long> {
    boolean existsByGroupCode(String groupCode);
    boolean existsByGroupName(String groupName);
}