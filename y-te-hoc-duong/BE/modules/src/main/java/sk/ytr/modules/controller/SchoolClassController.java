package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.SchoolClassRequestDTO;
import sk.ytr.modules.dto.response.SchoolClassResponseDTO;
import sk.ytr.modules.service.SchoolClassService;

import java.util.List;

@RestController
@RequestMapping("/api/school-classes")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class SchoolClassController {

    private final SchoolClassService service;

    @PostMapping
    public SchoolClassResponseDTO createSchoolClass(@RequestBody SchoolClassRequestDTO request) {
        return service.createSchoolClass(request);
    }

    @PutMapping("/{id}")
    public SchoolClassResponseDTO updateSchoolClass(@PathVariable Long id, @RequestBody SchoolClassRequestDTO request) {
        return service.updateSchoolClass(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteSchoolClass(@PathVariable Long id) {
        service.deleteSchoolClass(id);
    }

    @GetMapping("/{id}")
    public SchoolClassResponseDTO getSchoolClassById(@PathVariable Long id) {
        return service.getSchoolClassById(id);
    }

    @GetMapping
    public List<SchoolClassResponseDTO> getAllSchoolClasses() {
        return service.getAllSchoolClasses();
    }

    @GetMapping("/by-school/{schoolId}")
    public List<SchoolClassResponseDTO> getAllSchoolClasses(@PathVariable Long schoolId) {
        return service.getAllSchoolClassesBySchoolId(schoolId);
    }
}