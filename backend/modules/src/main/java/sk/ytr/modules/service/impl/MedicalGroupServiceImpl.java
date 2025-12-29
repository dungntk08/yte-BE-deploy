package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalGroupRequestDTO;
import sk.ytr.modules.dto.response.MedicalGroupResponseDTO;
import sk.ytr.modules.entity.MedicalGroup;
import sk.ytr.modules.repository.MedicalGroupRepository;
import sk.ytr.modules.service.MedicalGroupService;
import sk.ytr.modules.validate.MedicalGroupServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalGroupServiceImpl implements MedicalGroupService {

    private final MedicalGroupRepository medicalGroupRepository;
    private final MedicalGroupServiceValidate medicalGroupServiceValidate;
    @Override
    public MedicalGroupResponseDTO create(MedicalGroupRequestDTO request) {
        try {
            medicalGroupServiceValidate.validateCreateRequest(request);
            MedicalGroup group = MedicalGroup.builder()
                    .groupCode(request.getGroupCode())
                    .groupName(request.getGroupName())
                    .displayOrder(request.getDisplayOrder())
                    .isActive(true)
                    .build();

            medicalGroupRepository.save(group);
            return MedicalGroupResponseDTO.fromEntity(group);

        } catch (Exception e) {
            throw new RuntimeException("Tạo nhóm chỉ tiêu thất bại");
        }
    }

    @Override
    public MedicalGroupResponseDTO update(Long id, MedicalGroupRequestDTO request) {
        MedicalGroup group = medicalGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm chỉ tiêu"));

        group.setGroupName(request.getGroupName());
        group.setDisplayOrder(request.getDisplayOrder());
        group.setIsActive(request.getIsActive());

        medicalGroupRepository.save(group);
        return MedicalGroupResponseDTO.fromEntity(group);
    }

    @Override
    public List<MedicalGroupResponseDTO> getAll() {
        return medicalGroupRepository.findAll()
                .stream()
                .map(MedicalGroupResponseDTO::fromEntity)
                .toList();
    }

    @Override
    public void delete(Long id) {
        medicalGroupRepository.deleteById(id);
    }
}
