package sk.ytr.modules.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import sk.ytr.modules.dto.statics.*;
import sk.ytr.modules.service.StatisticService;

import java.util.List;
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticController {

    private final StatisticService statisticService;

    /** Màn hình default – tổng quan đợt khám */
    @GetMapping("/campaign/{campaignId}/overview")
    public CampaignOverviewResponse getCampaignOverview(
            @PathVariable Long campaignId
    ) {
        return statisticService.getCampaignOverview(campaignId);
    }

    /** Thống kê theo trường */
    @GetMapping("/campaign/{campaignId}/schools")
    public List<SchoolStatisticResponse> statisticBySchool(
            @PathVariable Long campaignId
    ) {
        return statisticService.statisticByCampaignAndSchool(campaignId);
    }

    /** Thống kê theo bệnh */
    @GetMapping("/campaign/{campaignId}/diseases")
    public List<DiseaseStatisticResponse> statisticByDisease(
            @PathVariable Long campaignId
    ) {
        return statisticService.statisticDiseaseByCampaign(campaignId);
    }

    /** Thống kê theo lớp trong 1 trường */
    @GetMapping("/campaign/{campaignId}/school/{schoolId}/classes")
    public List<ClassStatisticResponse> statisticByClass(
            @PathVariable Long campaignId,
            @PathVariable Long schoolId
    ) {
        return statisticService
                .statisticByCampaignSchoolAndClass(campaignId, schoolId);
    }

    /** Thống kê theo học sinh – so sánh các năm */
    @GetMapping("/student/{studentId}/years")
    public List<StudentYearStatisticResponse> statisticStudentByYears(
            @PathVariable Long studentId
    ) {
        return statisticService.statisticStudentByYears(studentId);
    }
}
