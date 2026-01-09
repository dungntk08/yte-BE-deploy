package sk.ytr.modules.service;

import sk.ytr.modules.dto.statics.*;

import java.util.List;

public interface StatisticService {

    CampaignOverviewResponse getCampaignOverview(Long campaignId);

    List<SchoolStatisticResponse> statisticByCampaignAndSchool(Long campaignId);

    List<DiseaseStatisticResponse> statisticDiseaseByCampaign(Long campaignId);

    List<ClassStatisticResponse> statisticByCampaignSchoolAndClass(
            Long campaignId,
            Long schoolId
    );

    List<StudentYearStatisticResponse> statisticStudentByYears(Long studentId);
}
