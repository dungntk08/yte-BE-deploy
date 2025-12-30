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
    /**
     * Tạo mới nhóm chỉ tiêu.
     *
     * @param request thông tin nhóm chỉ tiêu cần tạo
     * @return thông tin nhóm chỉ tiêu đã tạo
     */
    @Override
    public MedicalGroupResponseDTO createMedicalGroup(MedicalGroupRequestDTO request) {
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
            log.error("Lỗi khi tạo nhóm chỉ tiêu: {}", e.getMessage(), e);
            throw new RuntimeException("Tạo nhóm chỉ tiêu thất bại");
        }
    }

    /**
     * Cập nhật nhóm chỉ tiêu.
     *
     * @param id      ID của nhóm chỉ tiêu cần cập nhật
     * @param request thông tin mới của nhóm chỉ tiêu
     * @return thông tin nhóm chỉ tiêu đã được cập nhật
     */
    @Override
    public MedicalGroupResponseDTO updateMedicalGroup(Long id, MedicalGroupRequestDTO request) {
        MedicalGroup group = medicalGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm chỉ tiêu"));

        group.setGroupName(request.getGroupName());
        group.setDisplayOrder(request.getDisplayOrder());
        group.setIsActive(request.getIsActive());

        medicalGroupRepository.save(group);
        return MedicalGroupResponseDTO.fromEntity(group);
    }

    /**
     * Lấy danh sách tất cả nhóm chỉ tiêu.
     *
     * @return danh sách nhóm chỉ tiêu
     */
    @Override
    public List<MedicalGroupResponseDTO> getAllMedicalGroup() {
        return medicalGroupRepository.findAll()
                .stream()
                .map(MedicalGroupResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Xóa nhóm chỉ tiêu theo ID.
     *
     * @param id ID của nhóm chỉ tiêu cần xóa
     */
    @Override
    public void deleteMedicalGroup(Long id) {
        medicalGroupRepository.deleteById(id);
    }
}
