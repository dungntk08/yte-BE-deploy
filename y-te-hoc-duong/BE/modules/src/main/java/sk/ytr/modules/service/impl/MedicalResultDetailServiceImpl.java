package sk.ytr.modules.service.impl;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import sk.ytr.modules.constant.NutritionStatus;
import sk.ytr.modules.dto.excel.DiseaseReportDTO;
import sk.ytr.modules.dto.excel.MedicalResultReport;
import sk.ytr.modules.dto.request.MedicalResultDetailRequestDTO;
import sk.ytr.modules.dto.response.MedicalCampaignResponseDTO;
import sk.ytr.modules.dto.response.MedicalResultDetailResponseDTO;
import sk.ytr.modules.dto.response.TotalMedicalIndicatorResultResponseDTO;
import sk.ytr.modules.dto.response.TotalMedicalSubIndicatorResultResponseDTO;
import sk.ytr.modules.entity.*;
import sk.ytr.modules.repository.*;
import sk.ytr.modules.service.MedicalCampaignService;
import sk.ytr.modules.service.MedicalResultDetailService;
import sk.ytr.modules.utils.DateUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class MedicalResultDetailServiceImpl implements MedicalResultDetailService {

    private final MedicalResultDetailRepository medicalResultDetailRepository;
    private final StudentRepository studentRepository;
    private final CampaignMedicalConfigRepository campaignMedicalConfigRepository;
    private final MedicalIndicatorRepository medicalIndicatorRepository;
    private final MedicalSubIndicatorRepository medicalSubIndicatorRepository;
    @Lazy
    private final MedicalCampaignService medicalCampaignService;

    /**
     * Tạo mới kết quả khám bệnh.
     *
     * @param request DTO chứa thông tin yêu cầu tạo kết quả khám.
     * @return DTO chứa thông tin kết quả khám vừa được tạo.
     */
    @Override
    public MedicalResultDetailResponseDTO createMedicalResultDetail(MedicalResultDetailRequestDTO request) {
        try {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh"));

            MedicalResultDetail medicalResultDetail = request.toEntity(student, request);
            medicalResultDetail.setCreatedBy("ADMIN"); // tạm thời
            medicalResultDetail.setCreatedDate(DateUtils.getNow());
            medicalResultDetail.setModifiedDate(DateUtils.getNow());
            medicalResultDetail.setUpdatedBy("ADMIN"); // tạm thời
            return MedicalResultDetailResponseDTO.fromEntity(
                    medicalResultDetailRepository.save(medicalResultDetail)
            );
        } catch (RuntimeException e) {
            log.error("Lỗi khi tạo kết quả khám: {}", e.getMessage(), e);
            throw new RuntimeException("Tạo kết quả khám thất bại: " + e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo kết quả khám", e);
            throw new RuntimeException("Tạo kết quả khám thất bại");
        }
    }

    /**
     * Cập nhật kết quả khám bệnh.
     *
     * @param id      ID của kết quả khám cần cập nhật.
     * @param request DTO chứa thông tin mới của kết quả khám.
     * @return DTO chứa thông tin kết quả khám đã được cập nhật.
     */
    @Override
    public MedicalResultDetailResponseDTO updateMedicalResultDetail(Long id, MedicalResultDetailRequestDTO request) {
        try {
            MedicalResultDetail medicalResultDetail = medicalResultDetailRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả khám"));

            medicalResultDetail.updateFromRequest(request);
            medicalResultDetail.setModifiedDate(DateUtils.getNow());
            medicalResultDetail.setUpdatedBy("ADMIN"); // tạm thời

            return MedicalResultDetailResponseDTO.fromEntity(
                    medicalResultDetailRepository.save(medicalResultDetail)
            );
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật kết quả khám", e);
            throw new RuntimeException("Cập nhật kết quả khám thất bại");
        }
    }

    /**
     * Lấy thông tin chi tiết của một kết quả khám bệnh theo ID.
     *
     * @param id ID của kết quả khám.
     * @return DTO chứa thông tin chi tiết của kết quả khám.
     */
    @Override
    public MedicalResultDetailResponseDTO getMedicalResultDetailById(Long id) {
        return medicalResultDetailRepository.findById(id)
                .map(MedicalResultDetailResponseDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả khám"));
    }

    /**
     * Xóa kết quả khám bệnh theo ID.
     *
     * @param id ID của kết quả khám cần xóa.
     */
    @Override
    public void deleteMedicalResultDetail(Long id) {
        try {
            if (!medicalResultDetailRepository.existsById(id)) {
                throw new RuntimeException("Kết quả khám không tồn tại");
            }
            medicalResultDetailRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Lỗi khi xóa kết quả khám", e);
            throw new RuntimeException("Xóa kết quả khám thất bại");
        }
    }

    /**
     * Lấy danh sách kết quả khám bệnh theo ID học sinh.
     *
     * @param studentId ID của học sinh.
     * @return danh sách DTO chứa thông tin các kết quả khám của học sinh.
     */
    @Override
    public List<MedicalResultDetailResponseDTO> getMedicalResultDetailByStudentId(Long studentId) {
        try {
            List<MedicalResultDetailResponseDTO> result = medicalResultDetailRepository.findByStudentId(studentId)
                    .stream()
                    .map(MedicalResultDetailResponseDTO::fromEntity)
                    .toList();

            Map<Long, MedicalIndicator> indicatorMap = medicalIndicatorRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(MedicalIndicator::getId, indicator -> indicator));

            Map<Long, MedicalSubIndicator> subIndicatorMap = medicalSubIndicatorRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(MedicalSubIndicator::getId, subIndicator -> subIndicator));

            for (MedicalResultDetailResponseDTO dto : result) {
                MedicalIndicator indicator = indicatorMap.get(dto.getMedicalIndicatorId());
                if (indicator != null) {
                    dto.setMedicalGroupName(indicator.getGroup().getGroupName());
                    dto.setMedicalIndicatorName(indicator.getIndicatorName());

                    if (indicator.getHasSubIndicator() != null && indicator.getHasSubIndicator()) {
                        MedicalSubIndicator subIndicator = subIndicatorMap.get(dto.getMedicalSubIndicatorId());
                        if (subIndicator != null) {
                            dto.setMedicalSubIndicatorName(subIndicator.getSubName());
                        }
                    }
                }
            }

            return result;

        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kết quả khám theo học sinh", e);
            throw new RuntimeException("Lấy danh sách kết quả khám thất bại: " + e.getMessage());
        }
    }

    @Override
    public List<TotalMedicalIndicatorResultResponseDTO> getTotalMedicalIndicatorResultsByCampaignId(Long campaignId) {
        try {
            List<MedicalResultDetail> details =
                    medicalResultDetailRepository.findByCampaignId(campaignId);

            // Map indicatorId -> DTO kết quả
            Map<Long, TotalMedicalIndicatorResultResponseDTO> indicatorResultMap = new LinkedHashMap<>();

            // Map subIndicatorId -> DTO kết quả
            Map<Long, TotalMedicalSubIndicatorResultResponseDTO> subIndicatorResultMap = new HashMap<>();

            // Load indicator & subIndicator
            Map<Long, MedicalIndicator> indicatorMap =
                    medicalIndicatorRepository.findAll()
                            .stream()
                            .collect(Collectors.toMap(MedicalIndicator::getId, i -> i));

            Map<Long, MedicalSubIndicator> subIndicatorMap =
                    medicalSubIndicatorRepository.findAll()
                            .stream()
                            .collect(Collectors.toMap(MedicalSubIndicator::getId, s -> s));

            for (MedicalResultDetail detail : details) {

                // Không tính nếu không mắc bệnh
                if (!Boolean.TRUE.equals(detail.getResultValue())) {
                    continue;
                }

                Long indicatorId = detail.getMedicalIndicatorId();
                Long subIndicatorId = detail.getMedicalSubIndicatorId();

                MedicalIndicator indicator = indicatorMap.get(indicatorId);
                if (indicator == null) continue;

                // Lấy hoặc tạo DTO chỉ tiêu bệnh
                TotalMedicalIndicatorResultResponseDTO indicatorDTO =
                        indicatorResultMap.computeIfAbsent(indicatorId, id -> {
                            TotalMedicalIndicatorResultResponseDTO dto = new TotalMedicalIndicatorResultResponseDTO();
                            dto.setIndicatorName(indicator.getIndicatorName());
                            dto.setTotalCount(0L);
                            dto.setHasSubIndicators(Boolean.TRUE.equals(indicator.getHasSubIndicator()));
                            dto.setSubIndicatorResults(new ArrayList<>());
                            return dto;
                        });

                // ===== CÓ SUB INDICATOR =====
                if (subIndicatorId != null) {

                    MedicalSubIndicator subIndicator = subIndicatorMap.get(subIndicatorId);
                    if (subIndicator == null) continue;

                    TotalMedicalSubIndicatorResultResponseDTO subDTO =
                            subIndicatorResultMap.computeIfAbsent(subIndicatorId, id -> {
                                TotalMedicalSubIndicatorResultResponseDTO dto =
                                        new TotalMedicalSubIndicatorResultResponseDTO();
                                dto.setSubIndicatorName(subIndicator.getSubName());
                                dto.setTotalCount(0L);

                                indicatorDTO.getSubIndicatorResults().add(dto);
                                return dto;
                            });

                    // +1 cho subIndicator
                    subDTO.setTotalCount(subDTO.getTotalCount() + 1);

                    // +1 cho indicator cha
                    indicatorDTO.setTotalCount(indicatorDTO.getTotalCount() + 1);

                }
                // ===== KHÔNG CÓ SUB INDICATOR =====
                else {
                    indicatorDTO.setTotalCount(indicatorDTO.getTotalCount() + 1);
                }
            }

            return new ArrayList<>(indicatorResultMap.values());

        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng kết kết quả khám theo đợt khám", e);
            throw new RuntimeException("Lấy tổng kết kết quả khám thất bại: " + e.getMessage());
        }
    }

    @Override
    public MedicalResultReport generateMedicalResultReportByCampaignId(Long campaignId) {
        try {
            // Lấy dữ liệu đợt khám
            MedicalResultReport result = new MedicalResultReport();

            MedicalCampaignResponseDTO campaign =
                    medicalCampaignService.getMedicalCampaignById(campaignId);

            result.setMedicalCampaignResponseDTO(campaign);
            // Lấy tổng kết bệnh
            List<TotalMedicalIndicatorResultResponseDTO> indicatorResults =
                    getTotalMedicalIndicatorResultsByCampaignId(campaignId);

            // Map sang dataset cho Jasper
            List<DiseaseReportDTO> diseaseDataset =
                    DiseaseReportMapper.mapToDiseaseDataset(indicatorResults);
            List<Student> allStudents =
                    studentRepository.findByCampaignId(campaignId);

            result.setDiseaseReports(diseaseDataset);
            // Tính toán số liệu dinh dưỡng
            int underWeight = 0;
            int overWeight = 0;
            int obese = 0;
            int normal = 0;

            for (Student student : allStudents) {
                NutritionStatus status = calculateNutritionStatus(student);
                if (status == null) continue;

                switch (status) {
                    case UNDER_WEIGHT -> underWeight++;
                    case OVER_WEIGHT -> overWeight++;
                    case OBESE -> obese++;
                    case NORMAL -> normal++;
                }
            }

            result.setUnderWeightCount(underWeight);
            result.setOverWeightCount(overWeight);
            result.setObesityCount(obese);

            // Tỷ lệ % học sinh đã được đánh giá
            int evaluatedCount = underWeight + overWeight + obese + normal;
            float averageExamined = allStudents.isEmpty()
                    ? 0f
                    : (evaluatedCount * 100f / allStudents.size());

            result.setAverageExamined(averageExamined);

            return result;
        } catch (Exception e) {
            log.error("Lỗi khi tạo báo cáo kết quả khám theo đợt khám", e);
            throw new RuntimeException("Tạo báo cáo kết quả khám thất bại: " + e.getMessage());
        }
    }

    private NutritionStatus calculateNutritionStatus(Student student) {

        if (student.getWeight() == null || student.getHeight() == null) {
            return null; // thiếu dữ liệu → bỏ qua
        }

        BigDecimal weight = student.getWeight(); // kg
        BigDecimal heightCm = student.getHeight(); // cm

        if (heightCm.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        // height (m)
        BigDecimal heightMeter = heightCm
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        // BMI = kg / (m*m)
        BigDecimal bmi = weight.divide(
                heightMeter.multiply(heightMeter),
                2,
                RoundingMode.HALF_UP
        );

        if (bmi.compareTo(BigDecimal.valueOf(18.5)) < 0) {
            return NutritionStatus.UNDER_WEIGHT;
        } else if (bmi.compareTo(BigDecimal.valueOf(23)) < 0) {
            return NutritionStatus.NORMAL;
        } else if (bmi.compareTo(BigDecimal.valueOf(25)) < 0) {
            return NutritionStatus.OVER_WEIGHT;
        } else {
            return NutritionStatus.OBESE;
        }
    }

}
