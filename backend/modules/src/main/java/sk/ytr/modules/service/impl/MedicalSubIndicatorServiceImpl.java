package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import sk.ytr.modules.dto.request.MedicalSubIndicatorRequestDTO;
import sk.ytr.modules.dto.response.MedicalSubIndicatorResponseDTO;
import sk.ytr.modules.entity.MedicalIndicator;
import sk.ytr.modules.entity.MedicalSubIndicator;
import sk.ytr.modules.repository.MedicalIndicatorRepository;
import sk.ytr.modules.repository.MedicalSubIndicatorRepository;
import sk.ytr.modules.service.MedicalSubIndicatorService;
import sk.ytr.modules.validate.MedicalSubIndicatorServiceValidate;

import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalSubIndicatorServiceImpl implements MedicalSubIndicatorService {

    private final MedicalSubIndicatorRepository medicalSubIndicatorRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalSubIndicatorServiceValidate medicalSubIndicatorServiceValidate;
    @Override
    public MedicalSubIndicatorResponseDTO create(MedicalSubIndicatorRequestDTO request) {
        try {
            medicalSubIndicatorServiceValidate.validateCreateRequest(request);
            MedicalIndicator indicator = medicalIndicatorRepository.findById(request.getIndicatorId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ tiêu khám"));

            MedicalSubIndicator entity = request.toEntity(indicator);
            return MedicalSubIndicatorResponseDTO.fromEntity(
                    medicalSubIndicatorRepository.save(entity)
            );
        } catch (Exception e) {
            log.error("Lỗi tạo chỉ số con", e);
            throw new RuntimeException("Tạo chỉ số con thất bại");
        }
    }

    @Override
    public MedicalSubIndicatorResponseDTO update(Long id, MedicalSubIndicatorRequestDTO request) {
        try {
            medicalSubIndicatorServiceValidate.validateCreateRequest(request);
            MedicalSubIndicator entity = medicalSubIndicatorRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ số con"));

            entity.setSubCode(request.getSubCode());
            entity.setSubName(request.getSubName());
            entity.setDisplayOrder(request.getDisplayOrder());
            entity.setIsActive(request.getIsActive());

            return MedicalSubIndicatorResponseDTO.fromEntity(
                    medicalSubIndicatorRepository.save(entity)
            );
        } catch (Exception e) {
            log.error("Lỗi cập nhật chỉ số con", e);
            throw new RuntimeException("Cập nhật chỉ số con thất bại");
        }
    }

    @Override
    public MedicalSubIndicatorResponseDTO getById(Long id) {
        return medicalSubIndicatorRepository.findById(id)
                .map(MedicalSubIndicatorResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chỉ số con"));
    }

    @Override
    public void delete(Long id) {
        try {
            medicalSubIndicatorRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi xóa chỉ số con", e);
            throw new RuntimeException("Xóa chỉ số con thất bại");
        }
    }

    @Override
    public List<MedicalSubIndicatorResponseDTO> getByIndicatorId(Long indicatorId) {
        return medicalSubIndicatorRepository.findByIndicatorId(indicatorId)
                .stream()
                .map(MedicalSubIndicatorResponseDTO::fromEntity)
                .toList();
    }
}
