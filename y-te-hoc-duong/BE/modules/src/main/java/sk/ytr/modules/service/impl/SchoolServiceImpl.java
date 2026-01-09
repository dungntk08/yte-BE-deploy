package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.SchoolRequestDTO;
import sk.ytr.modules.dto.response.SchoolResponseDTO;
import sk.ytr.modules.entity.School;
import sk.ytr.modules.repository.SchoolRepository;
import sk.ytr.modules.service.SchoolService;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepository schoolRepository;

    /**
     * Lấy thông tin trường học theo ID.
     *
     * @param id ID của trường học cần lấy.
     * @return DTO phản hồi chứa thông tin trường học.
     */
    @Override
    public SchoolResponseDTO getSchoolById(Long id) {
        return schoolRepository.findById(id)
                .map(SchoolResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường học"));
    }

    /**
     * Lấy danh sách tất cả các trường học.
     *
     * @return Danh sách DTO phản hồi chứa thông tin các trường học.
     */
    @Override
    public List<SchoolResponseDTO> getAllSchool() {
        return schoolRepository.findAll()
                .stream()
                .map(SchoolResponseDTO::fromEntity)
                .toList();
    }

    @Override
    public SchoolResponseDTO createSchool(SchoolRequestDTO request) {
        School school = School.builder()
                .schoolCode(request.getSchoolCode())
                .schoolName(request.getSchoolName())
                .address(request.getAddress())
                .build();
        school = schoolRepository.save(school);
        return SchoolResponseDTO.fromEntity(school);
    }

    @Override
    public SchoolResponseDTO updateSchool(Long id, SchoolRequestDTO request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường học"));
        school.setSchoolCode(request.getSchoolCode());
        school.setSchoolName(request.getSchoolName());
        school.setAddress(request.getAddress());
        school = schoolRepository.save(school);
        return SchoolResponseDTO.fromEntity(school);
    }
}

