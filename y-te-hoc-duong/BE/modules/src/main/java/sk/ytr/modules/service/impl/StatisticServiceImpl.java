package sk.ytr.modules.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.ytr.modules.dto.projections.CampaignOverviewProjection;
import sk.ytr.modules.dto.statics.*;
import sk.ytr.modules.entity.*;
import sk.ytr.modules.repository.*;
import sk.ytr.modules.service.StatisticService;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class StatisticServiceImpl implements StatisticService {

    private final MedicalCampaignRepository medicalCampaignRepository;
    private final MedicalCampaignSchoolRepository medicalCampaignSchoolRepository;
    private final MedicalResultDetailRepository medicalResultDetailRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final StudentRepository studentRepository;

    /**
     * Phương thức này dùng để lấy thông tin tổng quan của một đợt khám y tế dựa trên ID của đợt khám.
     * Dữ liệu được lấy từ repository và ánh xạ sang đối tượng phản hồi.
     * Nếu không tìm thấy đợt khám hoặc xảy ra lỗi trong quá trình lấy dữ liệu, phương thức sẽ ném ra ngoại lệ.
     *
     * @param campaignId ID của đợt khám cần lấy thông tin.
     * @return Đối tượng `CampaignOverviewResponse` chứa tổng số học sinh và số học sinh đã được khám.
     * @throws RuntimeException nếu không tìm thấy đợt khám hoặc xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public CampaignOverviewResponse getCampaignOverview(Long campaignId) {
        try {
            // Lấy thông tin tổng quan của đợt khám từ repository
            CampaignOverviewProjection p = medicalCampaignRepository.getCampaignOverview(campaignId);

            // Nếu không tìm thấy đợt khám, ném ra ngoại lệ với thông báo lỗi
            if (p == null) {
                throw new RuntimeException("Không tìm thấy đợt khám");
            }
            List<Student> totalStudent = studentRepository.findByCampaignId(campaignId);
            int totalStudentsExamined = totalStudent.size() ;
            // Trả về đối tượng CampaignOverviewResponse với dữ liệu từ projection
            CampaignOverviewResponse result = new CampaignOverviewResponse();
            result.setTotalStudentsExamined(totalStudentsExamined);
            result.setTotalStudents(p.getTotalStudents());
            result.setCampaignId(campaignId);
            result.setTotalStudentsNotExamined(p.getTotalStudentsExamined() - totalStudentsExamined);
            return result;
        } catch (Exception e) {
            // Ghi log lỗi và ném lại ngoại lệ với thông báo lỗi chung
            log.error("Lỗi khi lấy thông tin tổng quan đợt khám với ID: {}", campaignId, e);
            throw new RuntimeException("Đã xảy ra lỗi khi lấy thông tin tổng quan đợt khám");
        }
    }

    /**
     * Phương thức này dùng để thống kê thông tin các trường học trong một đợt khám y tế.
     * Dữ liệu được lấy từ repository và ánh xạ sang danh sách các đối tượng phản hồi `SchoolStatisticResponse`.
     * Nếu xảy ra lỗi trong quá trình xử lý, phương thức sẽ ghi log và ném ra ngoại lệ.
     *
     * @param campaignId ID của đợt khám cần thống kê.
     * @return Danh sách các đối tượng `SchoolStatisticResponse` chứa thông tin thống kê của các trường học.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public List<SchoolStatisticResponse> statisticByCampaignAndSchool(Long campaignId) {
        try {
            // Lấy thông tin tổng quan của đợt khám từ repository
            List<SchoolStatisticResponse> result = new ArrayList<>();;

            // Nếu không tìm thấy đợt khám, ném ra ngoại lệ với thông báo lỗi
            List<MedicalCampaignSchool> medicalCampaignSchools = medicalCampaignSchoolRepository.findByMedicalCampaignId(campaignId);
            if(!medicalCampaignSchools.isEmpty()) {
                for(MedicalCampaignSchool item : medicalCampaignSchools) {
                    Long totalStudentExaminedSchool = studentRepository.countByCampaignAndSchool(campaignId, item.getSchool().getId());

                    // Trả về đối tượng CampaignOverviewResponse với dữ liệu từ projection
                    SchoolStatisticResponse schoolStatisticResponse = new SchoolStatisticResponse();
                    schoolStatisticResponse.setSchoolId(item.getSchool().getId());
                    schoolStatisticResponse.setSchoolName(item.getSchool().getSchoolName());
                    schoolStatisticResponse.setTotalStudents(item.getMedicalCampaign().getTotalStudents());
                    schoolStatisticResponse.setExaminedStudents(totalStudentExaminedSchool);
                    result.add(schoolStatisticResponse);
                }
            }
            return result;
        } catch (Exception e) {
            // Ghi log lỗi và ném lại ngoại lệ với thông báo lỗi chung.
            log.error("Lỗi khi thống kê thông tin các trường học trong đợt khám với ID: {}", campaignId, e);
            throw new RuntimeException("Đã xảy ra lỗi khi thống kê thông tin các trường học trong đợt khám");
        }
    }

    /**
     * Phương thức này dùng để thống kê thông tin các bệnh trong một đợt khám y tế.
     * Dữ liệu được lấy từ repository và ánh xạ sang danh sách các đối tượng phản hồi `DiseaseStatisticResponse`.
     * Nếu xảy ra lỗi trong quá trình xử lý, phương thức sẽ ghi log và ném ra ngoại lệ.
     *
     * @param campaignId ID của đợt khám cần thống kê.
     * @return Danh sách các đối tượng `DiseaseStatisticResponse` chứa thông tin thống kê của các bệnh.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public List<DiseaseStatisticResponse> statisticDiseaseByCampaign(Long campaignId) {
        try {
            // Gọi repository để lấy danh sách thống kê các bệnh theo ID đợt khám.

            return medicalResultDetailRepository
                    .statisticDiseaseByCampaign(campaignId)
                    .stream()
                    .map(p -> new DiseaseStatisticResponse(
                            p.getGroupId(),            // ID của nhóm bệnh
                            p.getGroupName(),          // Tên của nhóm bệnh
                            p.getIndicatorId(),        // ID của chỉ số bệnh
                            p.getIndicatorName(),      // Tên của chỉ số bệnh
                            p.getSubIndicatorId(),     // ID của chỉ số con bệnh
                            p.getSubIndicatorName(),   // Tên của chỉ số con bệnh
                            p.getTotalStudentAffected() // Tổng số học sinh bị ảnh hưởng bởi bệnh
                    ))
                    .toList();
        } catch (Exception e) {
            // Ghi log lỗi và ném lại ngoại lệ với thông báo lỗi chung.
            log.error("Lỗi khi thống kê thông tin các bệnh trong đợt khám với ID: {}", campaignId, e);
            throw new RuntimeException("Đã xảy ra lỗi khi thống kê thông tin các bệnh trong đợt khám: " + e.getMessage());
        }
    }

    /**
     * Phương thức này dùng để thống kê thông tin các lớp học trong một trường thuộc một đợt khám y tế.
     * Dữ liệu được lấy từ repository và ánh xạ sang danh sách các đối tượng phản hồi `ClassStatisticResponse`.
     * Nếu xảy ra lỗi trong quá trình xử lý, phương thức sẽ ghi log và ném ra ngoại lệ.
     *
     * @param campaignId ID của đợt khám cần thống kê.
     * @param schoolId   ID của trường học cần thống kê.
     * @return Danh sách các đối tượng `ClassStatisticResponse` chứa thông tin thống kê của các lớp học.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public List<ClassStatisticResponse> statisticByCampaignSchoolAndClass(
            Long campaignId,
            Long schoolId
    ) {
        try {
            // Gọi repository để lấy danh sách thống kê các lớp học theo ID đợt khám và ID trường học.
            return schoolClassRepository
                    .statisticByCampaignAndSchool(campaignId, schoolId)
                    .stream()
                    .map(p -> new ClassStatisticResponse(
                            p.getClassId(),          // ID của lớp học
                            p.getClassName(),        // Tên của lớp học
                            p.getTotalStudent(),     // Tổng số học sinh trong lớp
                            p.getExaminedStudents()  // Số học sinh đã được khám trong lớp
                    ))
                    .toList();
        } catch (Exception e) {
            // Ghi log lỗi và ném lại ngoại lệ với thông báo lỗi chung.
            log.error("Lỗi khi thống kê thông tin các lớp học trong trường với ID: {} và đợt khám với ID: {}", schoolId, campaignId, e);
            throw new RuntimeException("Đã xảy ra lỗi khi thống kê thông tin các lớp học trong trường");
        }
    }

    /**
     * Phương thức này dùng để thống kê thông tin các năm học của một học sinh dựa trên ID của học sinh.
     * Dữ liệu được lấy từ repository và ánh xạ sang danh sách các đối tượng phản hồi `StudentYearStatisticResponse`.
     * Nếu xảy ra lỗi trong quá trình xử lý, phương thức sẽ ghi log và ném ra ngoại lệ.
     *
     * @param studentId ID của học sinh cần thống kê.
     * @return Danh sách các đối tượng `StudentYearStatisticResponse` chứa thông tin thống kê các năm học của học sinh.
     * @throws RuntimeException nếu xảy ra lỗi trong quá trình xử lý.
     */
    @Override
    public List<StudentYearStatisticResponse> statisticStudentByYears(Long studentId) {
        try {
            // Gọi repository để lấy danh sách thống kê các năm học của học sinh theo ID.
            return medicalResultDetailRepository
                    .statisticStudentByYears(studentId)
                    .stream()
                    // Ánh xạ dữ liệu từ projection sang đối tượng phản hồi `StudentYearStatisticResponse`.
                    .map(p -> new StudentYearStatisticResponse(
                            p.getSchoolYear(),          // Năm học
                            p.getTotalDiseaseCount()    // Tổng số bệnh mà học sinh gặp phải trong năm học
                    ))
                    .toList();
        } catch (Exception e) {
            // Ghi log lỗi và ném lại ngoại lệ với thông báo lỗi chung.
            log.error("Lỗi khi thống kê thông tin các năm học của học sinh với ID: {}", studentId, e);
            throw new RuntimeException("Đã xảy ra lỗi khi thống kê thông tin các năm học của học sinh");
        }
    }
}
