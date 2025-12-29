package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalGroup;
import sk.ytr.modules.entity.MedicalIndicator;
import sk.ytr.modules.repository.MedicalGroupRepository;
import sk.ytr.modules.repository.MedicalIndicatorRepository;
import sk.ytr.modules.service.MedicalIndicatorService;
import sk.ytr.modules.validate.MedicalIndicatorServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalIndicatorServiceImpl implements MedicalIndicatorService {

    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalGroupRepository groupRepository;
    private final MedicalIndicatorServiceValidate medicalIndicatorServiceValidate;

    @Override
    public MedicalIndicatorResponseDTO create(MedicalIndicatorRequestDTO request) {
        try {
            medicalIndicatorServiceValidate.validateCreateRequest(request);
            MedicalGroup group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm chỉ tiêu"));

            MedicalIndicator indicator = MedicalIndicator.builder()
                    .group(group)
                    .indicatorCode(request.getIndicatorCode())
                    .indicatorName(request.getIndicatorName())
                    .displayOrder(request.getDisplayOrder())
                    .isActive(true)
                    .build();

            medicalIndicatorRepository.save(indicator);
            return MedicalIndicatorResponseDTO.fromEntity(indicator);

        } catch (Exception e) {
            throw new RuntimeException("Tạo chỉ tiêu khám thất bại");
        }
    }

    @Override
    public MedicalIndicatorResponseDTO update(Long id, MedicalIndicatorRequestDTO request) {
        medicalIndicatorServiceValidate.validateCreateRequest(request);
        MedicalIndicator indicator = medicalIndicatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ tiêu"));

        indicator.setIndicatorName(request.getIndicatorName());
        indicator.setDisplayOrder(request.getDisplayOrder());
        indicator.setIsActive(request.getIsActive());

        medicalIndicatorRepository.save(indicator);
        return MedicalIndicatorResponseDTO.fromEntity(indicator);
    }

    @Override
    public List<MedicalIndicatorResponseDTO> getByGroup(Long groupId) {
        return medicalIndicatorRepository.findByGroupId(groupId)
                .stream()
                .map(MedicalIndicatorResponseDTO::fromEntity)
                .toList();
    }

    @Override
    public void delete(Long id) {
        medicalIndicatorRepository.deleteById(id);
    }
}

