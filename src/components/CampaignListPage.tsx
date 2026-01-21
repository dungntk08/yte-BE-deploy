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
        return <Badge className="bg-[#ECEEF2] text-black font-bold rounded-lg hover:bg-[#ECEEF2]/90">Đã khóa</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-[#ECEEF2] text-black font-bold rounded-lg hover:bg-[#ECEEF2]/90">Chưa khóa</Badge>;
      case 'DRAFT':
        return <Badge className="bg-[#ECEEF2] text-black font-bold rounded-lg hover:bg-[#ECEEF2]/90">Nháp</Badge>;
      default:
        return <Badge className="bg-[#ECEEF2] text-black font-bold rounded-lg hover:bg-[#ECEEF2]/90">{status}</Badge>;
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
    <div className="min-h-screen bg-gray-50 px-6 py-6" style={{ padding: '48px 130px' }}>
      {/* Header */}
      <div className="mb-6 pb-8 mt-2.5 border-b border-gray-200" style={{ paddingBottom: '37px' }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="!text-[50px] !font-bold !text-gray-900" style={{ fontSize: '30px', fontWeight: 'bold' }}>Bảng khám sức khỏe</h1>
            {useMockData && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Đang sử dụng dữ liệu mẫu (Backend chưa kết nối)
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative" style={{ width: '300px' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm đợt khám..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full rounded-full"
              />
            </div>
            
            <button
              onClick={onCreateCampaign}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div>
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy đợt khám nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign: ExamPeriod) => (
              <Card
                key={campaign.id}
                className="p-4 border-2 border-gray-300 rounded-lg hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer flex flex-col"
                onClick={() => onSelectCampaign?.(campaign)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{campaign.campaignName}</h3>
                      {campaign.schoolYear && (
                        <p className="text-xs text-gray-500 truncate">Năm học {campaign.schoolYear}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
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
