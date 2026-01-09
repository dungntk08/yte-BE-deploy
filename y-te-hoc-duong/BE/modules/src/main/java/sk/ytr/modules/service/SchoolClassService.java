package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.SchoolClassRequestDTO;
import sk.ytr.modules.dto.response.SchoolClassResponseDTO;

import java.util.List;

public interface SchoolClassService {
    SchoolClassResponseDTO createSchoolClass(SchoolClassRequestDTO request);
    SchoolClassResponseDTO updateSchoolClass(Long id, SchoolClassRequestDTO request);
    void deleteSchoolClass(Long id);
    SchoolClassResponseDTO getSchoolClassById(Long id);
    List<SchoolClassResponseDTO> getAllSchoolClasses();
    List<SchoolClassResponseDTO> getAllSchoolClassesBySchoolId(Long schoolId);
}