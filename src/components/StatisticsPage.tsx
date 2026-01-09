import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Calendar, Users, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useCampaigns } from '../hooks/useCampaigns';
import { useStudents } from '../hooks/useStudents';
import { statisticsService, SchoolStatisticResponse, ClassStatisticResponse, DiseaseStatisticResponse, StudentYearStatisticResponse, CampaignOverviewResponse } from '../services/statisticsService';
import { toast } from 'sonner';

// Dữ liệu mẫu cho biểu đồ tròn - Số học sinh đã khám theo trường
const schoolExamData = {
  'Trường Mầm Non Đồi Cung': [
    { name: 'Đã khám', value: 245, color: '#3b82f6' },
    { name: 'Chưa khám', value: 55, color: '#e5e7eb' },
  ],
  'Trường Mầm Non Hoa Sen': [
    { name: 'Đã khám', value: 180, color: '#3b82f6' },
    { name: 'Chưa khám', value: 20, color: '#e5e7eb' },
  ],
  'Trường Mầm Non Ánh Dương': [
    { name: 'Đã khám', value: 320, color: '#3b82f6' },
    { name: 'Chưa khám', value: 80, color: '#e5e7eb' },
  ],
};

// Dữ liệu mẫu cho biểu đồ cột - So sánh số lượng khám vs tổng HS
const schoolComparisonData = [
  { name: 'Đồi Cung', daKham: 245, tongHS: 300 },
  { name: 'Hoa Sen', daKham: 180, tongHS: 200 },
  { name: 'Ánh Dương', daKham: 320, tongHS: 400 },
  { name: 'Bình Minh', daKham: 150, tongHS: 180 },
  { name: 'Sao Mai', daKham: 280, tongHS: 350 },
];

// Dữ liệu mẫu cho thống kê theo bệnh
const diseaseData = [
  { name: 'Sâu răng', soHS: 145 },
  { name: 'Cận thị', soHS: 89 },
  { name: 'Béo phì', soHS: 67 },
  { name: 'Suy dinh dưỡng', soHS: 34 },
  { name: 'Viêm họng', soHS: 123 },
  { name: 'Viêm tai', soHS: 45 },
  { name: 'Dị ứng da', soHS: 56 },
  { name: 'Hen suyễn', soHS: 23 },
];

// Dữ liệu mẫu cho thống kê theo năm
const yearlyComparisonData = [
  { nam: '2021-2022', sauRang: 180, canThi: 65, beoTho: 45, suyDinhDuong: 50 },
  { nam: '2022-2023', sauRang: 165, canThi: 72, beoTho: 52, suyDinhDuong: 42 },
  { nam: '2023-2024', sauRang: 152, canThi: 78, beoTho: 58, suyDinhDuong: 38 },
  { nam: '2024-2025', sauRang: 145, canThi: 89, beoTho: 67, suyDinhDuong: 34 },
];

const COLORS = ['#3b82f6', '#e5e7eb'];
const DISEASE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function StatisticsPage() {
  const navigate = useNavigate();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { students, loading: studentsLoading } = useStudents();
  
  const [view, setView] = useState<'list' | 'exam-detail' | 'student-detail'>('list');
  
  // Exam statistics state
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [campaignOverview, setCampaignOverview] = useState<CampaignOverviewResponse | null>(null);
  const [schoolStats, setSchoolStats] = useState<SchoolStatisticResponse[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [classStats, setClassStats] = useState<ClassStatisticResponse[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<DiseaseStatisticResponse[]>([]);
  const [examTab, setExamTab] = useState('school');
  const [loading, setLoading] = useState(false);
  
  // Student statistics state
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentYearStats, setStudentYearStats] = useState<StudentYearStatisticResponse[]>([]);

  // Load campaign overview and school statistics
  useEffect(() => {
    if (view === 'exam-detail' && selectedCampaignId) {
      loadExamStatistics();
    }
  }, [view, selectedCampaignId]);

  // Load class statistics when school selected
  useEffect(() => {
    if (selectedCampaignId && selectedSchoolId && examTab === 'school') {
      loadClassStatistics();
    }
  }, [selectedCampaignId, selectedSchoolId, examTab]);

  // Load disease statistics when switch to disease tab
  useEffect(() => {
    if (selectedCampaignId && examTab === 'disease') {
      loadDiseaseStatistics();
    }
  }, [selectedCampaignId, examTab]);

  // Load student year statistics
  useEffect(() => {
    if (view === 'student-detail' && selectedStudentId) {
      loadStudentYearStatistics();
    }
  }, [view, selectedStudentId]);

  const loadExamStatistics = async () => {
    if (!selectedCampaignId) return;
    
    setLoading(true);
    try {
      const [overview, schools] = await Promise.all([
        statisticsService.getCampaignOverview(selectedCampaignId),
        statisticsService.getSchoolStatistics(selectedCampaignId),
      ]);
      setCampaignOverview(overview);
      setSchoolStats(schools);
      
      // Auto select first school
      if (schools.length > 0) {
        setSelectedSchoolId(schools[0].schoolId);
      }
    } catch (error) {
      console.error('Error loading exam statistics:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const loadClassStatistics = async () => {
    if (!selectedCampaignId || !selectedSchoolId) return;
    
    try {
      const classes = await statisticsService.getClassStatistics(selectedCampaignId, selectedSchoolId);
      setClassStats(classes);
    } catch (error) {
      console.error('Error loading class statistics:', error);
      toast.error('Không thể tải thống kê theo lớp');
    }
  };

  const loadDiseaseStatistics = async () => {
    if (!selectedCampaignId) return;
    
    setLoading(true);
    try {
      const diseases = await statisticsService.getDiseaseStatistics(selectedCampaignId);
      setDiseaseStats(diseases);
    } catch (error) {
      console.error('Error loading disease statistics:', error);
      toast.error('Không thể tải thống kê theo bệnh');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentYearStatistics = async () => {
    if (!selectedStudentId) return;
    
    setLoading(true);
    try {
      const yearStats = await statisticsService.getStudentYearStatistics(selectedStudentId);
      setStudentYearStats(yearStats);
    } catch (error) {
      console.error('Error loading student year statistics:', error);
      toast.error('Không thể tải thống kê theo năm');
    } finally {
      setLoading(false);
    }
  };

  const handleExamCardClick = () => {
    if (campaigns.length === 0) {
      toast.error('Chưa có đợt khám nào');
      return;
    }
    // Auto select first campaign
    setSelectedCampaignId(campaigns[0].id);
    setView('exam-detail');
  };

  const handleStudentCardClick = () => {
    if (students.length === 0) {
      toast.error('Chưa có học sinh nào');
      return;
    }
    // Auto select first student
    setSelectedStudentId(students[0].id);
    setView('student-detail');
  };

  // Prepare data for pie chart
  const selectedSchool = schoolStats.find(s => s.schoolId === selectedSchoolId);
  const pieChartData = selectedSchool ? [
    { name: 'Đã khám', value: selectedSchool.examinedStudents, color: '#3b82f6' },
    { name: 'Tổng số Học sinh', value: selectedSchool.totalStudents - selectedSchool.examinedStudents, color: '#e5e7eb' },
  ] : [];
  // Prepare disease data for chart - flatten all diseases into one array
  const diseaseChartData = useMemo(() => {
    const chartData: Array<{
      name: string;
      value: number;
      groupName: string;
      indicatorName: string;
      fullName: string;
    }> = [];

    // Group by indicator to check if it has subIndicators
    const indicatorMap: {
      [key: number]: {
        indicatorName: string;
        groupName: string;
        hasSubIndicator: boolean;
        total: number;
      };
    } = {};

    // First pass: identify indicators with/without subIndicators
    diseaseStats.forEach(item => {
      if (!indicatorMap[item.medicalIndicatorId]) {
        indicatorMap[item.medicalIndicatorId] = {
          indicatorName: item.indicatorName,
          groupName: item.groupName,
          hasSubIndicator: false,
          total: 0,
        };
      }

      if (item.subIndicatorId) {
        indicatorMap[item.medicalIndicatorId].hasSubIndicator = true;
      }
    });

    // Second pass: build chart data
    diseaseStats.forEach(item => {
      const indicator = indicatorMap[item.medicalIndicatorId];
      
      if (item.subIndicatorId && item.subIndicatorName) {
        // Has subIndicator - add subIndicator to chart
        chartData.push({
          name: item.subIndicatorName,
          value: item.totalStudentAffected,
          groupName: item.groupName,
          indicatorName: item.indicatorName,
          fullName: `${item.indicatorName} - ${item.subIndicatorName}`,
        });
      } else if (!indicator.hasSubIndicator) {
        // No subIndicator - add indicator itself to chart
        chartData.push({
          name: item.indicatorName,
          value: item.totalStudentAffected,
          groupName: item.groupName,
          indicatorName: item.indicatorName,
          fullName: item.indicatorName,
        });
      }
    });

    // Sort by value descending
    return chartData.sort((a, b) => b.value - a.value);
  }, [diseaseStats]);
  if (campaignsLoading || studentsLoading) {
    return (
      <>
        <Header />
        <main className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-lg text-gray-600">Đang tải...</div>
        </main>
      </>
    );
  }

  // Màn hình danh sách - 2 thẻ chọn
  if (view === 'list') {
    return (
      <>
        <Header />
        <main className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-[20px] font-bold text-gray-900 mb-2">Thống kê Y tế học đường</h1>
              <p className="text-[14px] text-gray-600">Chọn loại thống kê để xem chi tiết</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Card Thống kê theo Đợt khám */}
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-200 border-[3px] border-gray-300 hover:border-blue-500 bg-white p-5 w-full max-w-[33%] rounded-xl"
                onClick={handleExamCardClick}
              >
                <CardHeader className="p-0 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-[16px] font-bold text-gray-900">
                        Thống kê theo Đợt khám
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-[13px] text-gray-600 mb-3 leading-relaxed">
                    Tổng hợp số liệu y tế theo từng đợt khám định kỳ
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[13px] text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span>Theo trường học</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span>Theo loại bệnh</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Thống kê theo Học sinh */}
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-200 border-[3px] border-gray-300 hover:border-green-500 bg-white p-5 w-full max-w-[33%] rounded-xl"
                onClick={handleStudentCardClick}
              >
                <CardHeader className="p-0 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-[16px] font-bold text-gray-900">
                        Thống kê theo Học sinh
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription className="text-[13px] text-gray-600 mb-3 leading-relaxed">
                    So sánh kết quả khám theo từng học sinh qua các năm
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[13px] text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span>Theo năm học</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span>Xu hướng bệnh tật</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Màn hình chi tiết Thống kê theo Đợt khám
  if (view === 'exam-detail') {
    return (
      <>
        <Header />
        <main className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setView('list')}
              className="mb-4"
            >
              ← Quay lại
            </Button>
            
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Thống kê theo Đợt khám</h1>
              <Select 
                value={selectedCampaignId?.toString()} 
                onValueChange={(value) => setSelectedCampaignId(Number(value))}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Chọn đợt khám" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.campaignName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {campaignOverview && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Tổng số học sinh</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{campaignOverview.totalStudents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Đã khám</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{campaignOverview.totalStudentsExamined}</div>
                    <div className="text-sm text-gray-500">
                      {((campaignOverview.totalStudentsExamined / campaignOverview.totalStudents) * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Tabs value={examTab} onValueChange={setExamTab}>
              <TabsList className="bg-transparent p-0 gap-2 w-auto">
                <TabsTrigger 
                  value="school" 
                  className="px-4 py-2 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-300 hover:bg-cyan-50 transition-colors w-[calc(10vw)]"
                >
                  Thống kê theo Trường học
                </TabsTrigger>
                <TabsTrigger 
                  value="disease" 
                  className="px-4 py-2 rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-300 hover:bg-cyan-50 transition-colors w-[calc(10vw)]"
                >
                  Thống kê theo Bệnh
                </TabsTrigger>
              </TabsList>

              {/* Thống kê theo Trường học */}
              <TabsContent value="school" className="space-y-6 mt-6">
                {loading ? (
                  <div className="text-center py-8">Đang tải...</div>
                ) : schoolStats.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8 text-gray-500">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Chưa có dữ liệu thống kê
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Biểu đồ tròn - Số học sinh đã khám */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tỷ lệ học sinh đã khám</CardTitle>
                        <CardDescription>
                          <Select 
                            value={selectedSchoolId?.toString()} 
                            onValueChange={(value) => setSelectedSchoolId(Number(value))}
                          >
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue placeholder="Chọn trường" />
                            </SelectTrigger>
                            <SelectContent>
                              {schoolStats.map((school) => (
                                <SelectItem key={school.schoolId} value={school.schoolId.toString()}>
                                  {school.schoolName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedSchool && pieChartData.length > 0 && (
                          <>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={pieChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, value, percent }) => 
                                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                                  }
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-center">
                              <p className="text-sm text-gray-600">
                                Tổng số học sinh: <span className="font-semibold text-gray-900">{selectedSchool.totalStudents}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Đã khám: <span className="font-semibold text-blue-600">{selectedSchool.examinedStudents}</span>
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Biểu đồ cột - So sánh số lượng khám theo trường */}
                    <Card>
                      <CardHeader>
                        <CardTitle>So sánh số lượng khám theo trường</CardTitle>
                        <CardDescription>
                          So sánh số học sinh đã khám và tổng số học sinh
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={schoolStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="schoolName" angle={-15} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="examinedStudents" name="Đã khám" fill="#3b82f6" />
                            <Bar dataKey="totalStudents" name="Tổng HS" fill="#93c5fd" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Biểu đồ cột - Thống kê theo lớp */}
                    {classStats.length > 0 && (
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Thống kê theo lớp - {selectedSchool?.schoolName}</CardTitle>
                          <CardDescription>
                            So sánh số học sinh đã khám theo từng lớp
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classStats}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="className" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="examinedStudents" name="Đã khám" fill="#3b82f6" />
                              <Bar dataKey="totalStudent" name="Tổng HS" fill="#93c5fd" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Thống kê theo Bệnh */}
              <TabsContent value="disease" className="space-y-6 mt-6">
                {loading ? (
                  <div className="text-center py-8">Đang tải...</div>
                ) : diseaseStats.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8 text-gray-500">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Chưa có dữ liệu thống kê bệnh
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Biểu đồ tổng hợp */}
                    <Card>
                      <CardHeader>
                        <CardTitle>So sánh tổng số học sinh mắc bệnh</CardTitle>
                        <CardDescription>
                          Tổng hợp tất cả các loại bệnh và chỉ số sức khỏe
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={Math.max(500, diseaseChartData.length * 35)}>
                          <BarChart data={diseaseChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              width={200}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                                      <p className="font-semibold text-gray-800">{data.fullName}</p>
                                      <p className="text-sm text-gray-600">Nhóm: {data.groupName}</p>
                                      <p className="text-blue-600 font-bold mt-1">
                                        Số học sinh: {data.value}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend />
                            <Bar dataKey="value" name="Số học sinh" fill="#3b82f6">
                              {diseaseChartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={DISEASE_COLORS[index % DISEASE_COLORS.length]} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Bảng chi tiết */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Chi tiết số liệu</CardTitle>
                        <CardDescription>
                          Bảng tổng hợp chi tiết theo nhóm bệnh
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold">Nhóm</th>
                                <th className="px-4 py-3 text-left font-semibold">Chỉ số</th>
                                <th className="px-4 py-3 text-right font-semibold">Số học sinh</th>
                                <th className="px-4 py-3 text-right font-semibold">Tỷ lệ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {diseaseChartData.map((item, index) => {
                                const totalStudents = campaignOverview?.totalStudents || 1;
                                const percentage = ((item.value / totalStudents) * 100).toFixed(1);
                                
                                return (
                                  <tr key={index} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">{item.groupName}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-3 h-3 rounded" 
                                          style={{ backgroundColor: DISEASE_COLORS[index % DISEASE_COLORS.length] }}
                                        ></div>
                                        <span className="font-medium">{item.fullName}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-blue-600">
                                      {item.value}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                      {percentage}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                              <tr className="border-t-2">
                                <td colSpan={2} className="px-4 py-3">Tổng số học sinh được thống kê</td>
                                <td className="px-4 py-3 text-right text-blue-600">
                                  {campaignOverview?.totalStudentsExamined || 0}
                                </td>
                                <td className="px-4 py-3"></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </>
    );
  }

  // Màn hình chi tiết Thống kê theo Học sinh
  return (
    <>
      <Header />
      <main className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setView('list')}
            className="mb-4"
          >
            ← Quay lại
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Thống kê theo Học sinh</h1>
            <Select 
              value={selectedStudentId?.toString()} 
              onValueChange={(value) => setSelectedStudentId(Number(value))}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Chọn học sinh" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.fullName} - {student.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : studentYearStats.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8 text-gray-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                Chưa có dữ liệu thống kê cho học sinh này
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>So sánh kết quả khám bệnh qua các năm</CardTitle>
                <CardDescription>
                  Tổng số bệnh mắc phải trong mỗi năm học
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={studentYearStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="schoolYear" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalDiseaseCount" 
                      name="Tổng số bệnh" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {studentYearStats.map((stat, index) => {
                    const prevStat = studentYearStats[index - 1];
                    const change = prevStat 
                      ? ((stat.totalDiseaseCount - prevStat.totalDiseaseCount) / prevStat.totalDiseaseCount * 100)
                      : 0;
                    const isIncrease = change > 0;
                    
                    return (
                      <div key={stat.schoolYear} className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">{stat.schoolYear}</p>
                        <p className="text-2xl font-bold text-blue-600">{stat.totalDiseaseCount}</p>
                        {prevStat && (
                          <p className={`text-xs ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                            {isIncrease ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% so năm trước
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
