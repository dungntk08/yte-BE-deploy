package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.SchoolClassRequestDTO;
import sk.ytr.modules.dto.response.SchoolClassResponseDTO;
import sk.ytr.modules.entity.School;
import sk.ytr.modules.entity.SchoolClass;
import sk.ytr.modules.repository.SchoolClassRepository;
import sk.ytr.modules.repository.SchoolRepository;
import sk.ytr.modules.service.SchoolClassService;

import java.util.List;

@Service
@AllArgsConstructor
public class SchoolClassServiceImpl implements SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;

    @Override
public SchoolClassResponseDTO createSchoolClass(SchoolClassRequestDTO request) {
    try {
        // Validate duplicate class name within the same school
        if (schoolClassRepository.findByClassNameAndSchoolId(request.getClassName(), request.getSchoolId()).isPresent()) {
            throw new RuntimeException("Tên lớp đã tồn tại trong trường này");
        }

        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường học"));
        SchoolClass schoolClass = SchoolClass.builder()
                .school(school)
                .className(request.getClassName())
                .grade(request.getGrade())
                .totalStudent(request.getTotalStudent())
                .schoolYear(request.getSchoolYear())
                .build();
        schoolClass = schoolClassRepository.save(schoolClass);
        return SchoolClassResponseDTO.builder()
                .id(schoolClass.getId())
                .className(schoolClass.getClassName())
                .grade(schoolClass.getGrade())
                .totalStudent(schoolClass.getTotalStudent())
                .schoolYear(schoolClass.getSchoolYear())
                .build();
    } catch (Exception e) {
        throw new RuntimeException("Lỗi khi tạo lớp học: " + e.getMessage());
    }
}

@Override
public SchoolClassResponseDTO updateSchoolClass(Long id, SchoolClassRequestDTO request) {
    try {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        // Validate duplicate class name within the same school
        if (schoolClassRepository.findByClassNameAndSchoolId(request.getClassName(), request.getSchoolId())
                .filter(existingClass -> !existingClass.getId().equals(id))
                .isPresent()) {
            throw new RuntimeException("Tên lớp đã tồn tại trong trường này");
        }

        School school = schoolRepository.findById(request.getSchoolId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trường học"));
        schoolClass.setSchool(school);
        schoolClass.setClassName(request.getClassName());
        schoolClass.setGrade(request.getGrade());
        schoolClass.setTotalStudent(request.getTotalStudent());
        schoolClass.setSchoolYear(request.getSchoolYear());
        schoolClass = schoolClassRepository.save(schoolClass);
        return SchoolClassResponseDTO.builder()
                .id(schoolClass.getId())
                .className(schoolClass.getClassName())
                .grade(schoolClass.getGrade())
                .totalStudent(schoolClass.getTotalStudent())
                .schoolYear(schoolClass.getSchoolYear())
                .schoolId(school.getId())
                .build();
    } catch (Exception e) {
        throw new RuntimeException("Lỗi khi cập nhật lớp học: " + e.getMessage());
    }
}
    @Override
    public void deleteSchoolClass(Long id) {
        schoolClassRepository.deleteById(id);
    }

    @Override
    public SchoolClassResponseDTO getSchoolClassById(Long id) {
        try {
            SchoolClass schoolClass = schoolClassRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));
            return SchoolClassResponseDTO.builder()
                    .id(schoolClass.getId())
                    .className(schoolClass.getClassName())
                    .grade(schoolClass.getGrade())
                    .totalStudent(schoolClass.getTotalStudent())
                    .schoolYear(schoolClass.getSchoolYear())
                    .schoolId(schoolClass.getSchool().getId())
                    .build();
        }catch (Exception e){
            throw new RuntimeException("Lỗi khi lấy thông tin lớp học: " + e.getMessage());
        }
    }

    @Override
    public List<SchoolClassResponseDTO> getAllSchoolClasses() {
        try {
            return schoolClassRepository.findAll()
                    .stream()
                    .map(schoolClass -> SchoolClassResponseDTO.builder()
                            .id(schoolClass.getId())
                            .className(schoolClass.getClassName())
                            .grade(schoolClass.getGrade())
                            .totalStudent(schoolClass.getTotalStudent())
                            .schoolYear(schoolClass.getSchoolYear())
                            .schoolId(schoolClass.getSchool().getId())
                            .build())
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lấy danh sách lớp học: " + e.getMessage());
        }
    }

    @Override
    public List<SchoolClassResponseDTO> getAllSchoolClassesBySchoolId(Long schoolId) {
        try{
        return schoolClassRepository.findBySchoolId(schoolId)
                .stream()
                .map(schoolClass -> SchoolClassResponseDTO.builder()
                        .id(schoolClass.getId())
                        .className(schoolClass.getClassName())
                        .grade(schoolClass.getGrade())
                        .totalStudent(schoolClass.getTotalStudent())
                        .schoolYear(schoolClass.getSchoolYear())
                        .schoolId(schoolClass.getSchool().getId())
                        .build())
                .toList();
        } catch (Exception e){
            throw new RuntimeException("Lỗi khi lấy danh sách lớp học theo trường: " + e.getMessage());
        }
    }
}