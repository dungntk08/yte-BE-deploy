import { useState, useMemo } from 'react';
import { Search, Plus, MoreVertical, Calendar, Users } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { ExamPeriod } from '../services/examPeriodService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface CampaignListPageProps {
  onSelectCampaign?: (campaign: ExamPeriod) => void;
  onCreateCampaign?: () => void;
}

export function CampaignListPage({ onSelectCampaign, onCreateCampaign }: CampaignListPageProps) {
  const { campaigns, loading, useMockData, deleteCampaign } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');

  // Lấy danh sách các năm học có trong campaigns
  const availableYears = useMemo(() => {
    const years: string[] = Array.from(new Set(campaigns.map((c: ExamPeriod) => c.schoolYear)));
    return years.sort((a: string, b: string) => b.localeCompare(a)); // Sort descending
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign: ExamPeriod) => {
      const matchesSearch = campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = selectedYear === 'all' || campaign.schoolYear === selectedYear;
      return matchesSearch && matchesYear;
    });
  }, [campaigns, searchQuery, selectedYear]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return <Badge variant="secondary">Đã khóa</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Chưa khóa</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Nháp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDelete = async (id: number, campaignName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đợt khám "${campaignName}"?`)) {
      try {
        await deleteCampaign(id);
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        alert('Không thể xóa đợt khám. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bảng khám sức khỏe</h1>
            {useMockData && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Đang sử dụng dữ liệu mẫu (Backend chưa kết nối)
              </p>
            )}
          </div>
          <Button onClick={onCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>

        {/* Year Tabs */}
        <Tabs value={selectedYear} onValueChange={setSelectedYear} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {availableYears.map(year => (
              <TabsTrigger key={year} value={year}>
                {year}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm đợt khám..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy đợt khám nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign: ExamPeriod) => (
              <Card
                key={campaign.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectCampaign?.(campaign)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.campaignName}</h3>
                      {campaign.schoolYear && (
                        <p className="text-xs text-gray-500">Năm học {campaign.schoolYear}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onSelectCampaign?.(campaign);
                        }}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (campaign.id) {
                              handleDelete(campaign.id, campaign.campaignName);
                            }
                          }}
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </span>
                  </div>
                  {(campaign.totalStudents !== undefined || campaign.totalStudentsExamined !== undefined) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {campaign.totalStudentsExamined || 0} / {campaign.totalStudents || 0} học sinh
                      </span>
                    </div>
                  )}
                </div>

                {campaign.note && (
                  <p className="text-xs text-gray-500 line-clamp-2">{campaign.note}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
