package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.request.SchoolRequestDTO;
import sk.ytr.modules.dto.response.SchoolResponseDTO;
import sk.ytr.modules.service.SchoolService;

import java.util.List;

@RestController
@RequestMapping("/api/schools")
@CrossOrigin
@RequiredArgsConstructor
@Slf4j
public class SchoolController {

    private final SchoolService service;

    @GetMapping("/{id}")
    public SchoolResponseDTO
    getById(@PathVariable Long id) {
        return service.getSchoolById(id);
    }

    @GetMapping
    public List<SchoolResponseDTO> getAll() {
        return service.getAllSchool();
    }

    @PostMapping
    public SchoolResponseDTO createSchool(@RequestBody SchoolRequestDTO request) {
        return service.createSchool(request);
    }

    @PutMapping("/{id}")
    public SchoolResponseDTO updateSchool(@PathVariable Long id, @RequestBody SchoolRequestDTO request) {
        return service.updateSchool(id, request);
    }
}

