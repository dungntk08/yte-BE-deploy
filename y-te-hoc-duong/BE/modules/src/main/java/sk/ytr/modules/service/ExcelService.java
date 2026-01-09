package sk.ytr.modules.service;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import sk.ytr.modules.dto.excel.ExcelMedicalColumn;
import sk.ytr.modules.dto.excel.IndicatorHeaderMeta;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

public interface ExcelService {

    Integer buildHeader(
            Workbook workbook,
            Sheet sheet,
            List<ExcelMedicalColumn> dynamicColumns
    );
    void importExcel(
            MultipartFile file,
            Long campaignId,
            Map<Integer, IndicatorHeaderMeta> headerMetaMap,
            Long SchoolId,
            Long ClassId
    );

    ByteArrayInputStream exportExcel(Long campaignId);

    Map<Integer, IndicatorHeaderMeta> parseIndicatorHeader(
            Sheet sheet,
            Long campaignId
    );

    ByteArrayInputStream exportTemplateExcel(Long campaignId);

//    byte[] exportCampaignSummaryReportToWord(Long campaignId,
//                                             Long SchoolId,
//                                             Long ClassId);
}
