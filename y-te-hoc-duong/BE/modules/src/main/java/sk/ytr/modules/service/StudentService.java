package sk.ytr.modules.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.entity.Student;

import java.util.List;

public interface StudentService {

    StudentResponseDTO createStudent(StudentRequestDTO request);

    StudentResponseDTO updateStudent(Long id, StudentRequestDTO request);

    StudentResponseDTO getStudentById(Long id);

    void deleteStudent(Long id);

    List<StudentResponseDTO> getStudentByCampaignId(Long campaignId, String keyWord);

    Page<StudentResponseDTO> getAllStudentByCampaignIdAndFilter(Long campaignId, String keyword, Long schoolId, Long schoolClassId, Pageable pageable);

    void createMedicalResultForStudent(Student student);
}
