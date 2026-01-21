import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { StudentTable } from './components/StudentTable';
import { CampaignListPage } from './components/CampaignListPage';
import { SchoolManagementPage } from './components/SchoolManagementPage';
import { StatisticsPage } from './components/StatisticsPage';
import { ReportPage } from './components/ReportPage';
import { TopNavbar } from './components/TopNavbar';
import { ExamPeriodModal } from './components/ExamPeriodModal';
import { ExamPeriod } from './services/examPeriodService';
import { Toaster } from './components/ui/sonner';

// Component wrapper cho các routes
function AppLayout() {
  const [isExamPeriodModalOpen, setIsExamPeriodModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/dot-kham" replace />} />
          
          <Route path="/y-te-so" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-700 mb-4">Y tế số</h2>
                <p className="text-gray-500">Chức năng đang phát triển</p>
              </div>
            </div>
          } />
          
          <Route path="/duoc" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-700 mb-4">Dược</h2>
                <p className="text-gray-500">Chức năng đang phát triển</p>
              </div>
            </div>
          } />
          
          <Route path="/dot-kham" element={
            <CampaignListPage 
              onSelectCampaign={(campaign) => navigate(`/dot-kham/${campaign.id}`)}
              onCreateCampaign={() => setIsExamPeriodModalOpen(true)}
            />
          } />
          
          <Route path="/dot-kham/:campaignId" element={<CampaignDetailPage />} />
          
          <Route path="/truong-hoc" element={<SchoolManagementPage />} />
          
          <Route path="/thong-ke" element={<StatisticsPage />} />
          
          <Route path="/bao-cao" element={<ReportPage />} />
        </Routes>
      </div>
      <Toaster />
      <ExamPeriodModal
        isOpen={isExamPeriodModalOpen}
        onClose={() => setIsExamPeriodModalOpen(false)}
        onSuccess={() => {
          setIsExamPeriodModalOpen(false);
          navigate('/dot-kham');
        }}
      />
    </div>
  );
}

// Component chi tiết đợt khám
function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<ExamPeriod | null>(null);

  // Load campaign info nếu cần hiển thị tên
  // Tạm thời dùng campaignId làm tên
  
  return (
    <>
      <Header />
      <main className="p-6">
        <StudentTable 
          campaignId={campaignId!} 
          campaignName={campaign?.campaignName || `Đợt khám ${campaignId}`}
          onBack={() => navigate('/dot-kham')}
        />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
