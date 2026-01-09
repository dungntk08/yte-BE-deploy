package sk.ytr.modules.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.ytr.modules.entity.School;

public interface SchoolRepository extends JpaRepository<School, Long> {
}