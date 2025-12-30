package sk.ytr.modules.service;

import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;

import java.util.List;

public interface StudentService {

    StudentResponseDTO createStudent(StudentRequestDTO request);

    StudentResponseDTO updateStudent(Long id, StudentRequestDTO request);

    StudentResponseDTO getStudentById(Long id);

    void deleteStudent(Long id);

    List<StudentResponseDTO> getStudentByCampaignId(Long campaignId);
}
