package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.StudentRequestDTO;
import sk.ytr.modules.dto.response.StudentResponseDTO;
import sk.ytr.modules.service.StudentService;

import java.util.List;
@RestController
@RequestMapping("/api/students")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentService service;

    @PostMapping
    public StudentResponseDTO create(
            @RequestBody StudentRequestDTO request) {
        return service.createStudent(request);
    }

    @PutMapping("/{id}")
    public StudentResponseDTO update(
            @PathVariable Long id,
            @RequestBody StudentRequestDTO request) {
        return service.updateStudent(id, request);
    }

    @GetMapping("/{id}")
    public StudentResponseDTO getById(@PathVariable Long id) {
        return service.getStudentById(id);
    }

    @GetMapping("/campaign/{campaignId}")
    public List<StudentResponseDTO> getByCampaignId(
            @PathVariable Long campaignId) {
        return service.getStudentByCampaignId(campaignId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteStudent(id);
    }
}
