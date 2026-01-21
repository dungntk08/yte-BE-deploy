import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Building2, 
  School, 
  Users, 
  BarChart3, 
  FileText 
} from 'lucide-react';

interface QuickAccessCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
}

export function QuickAccessPage() {
  const navigate = useNavigate();

  const cards: QuickAccessCard[] = [
    {
      id: 'dot-kham',
      title: 'Đợt khám',
      description: 'Quản lý các đợt khám sức khỏe học sinh, tạo mới đợt khám và theo dõi tiến độ',
      icon: Calendar,
      path: '/dot-kham'
    },
    {
      id: 'truong-hoc',
      title: 'Quản lý trường học',
      description: 'Cấu hình thông tin trường học, quản lý danh sách trường và cập nhật thông tin',
      icon: Building2,
      path: '/truong-hoc'
    },
    {
      id: 'lop-hoc',
      title: 'Quản lý lớp học',
      description: 'Danh sách chi tiết lớp học, bao gồm: tên lớp, tổng học sinh, trạng thái',
      icon: School,
      path: '/lop-hoc'
    },
    {
      id: 'hoc-sinh',
      title: 'Quản lý học sinh',
      description: 'Quản lý thông tin học sinh, thêm mới, chỉnh sửa và theo dõi hồ sơ sức khỏe',
      icon: Users,
      path: '/dot-kham'
    },
    {
      id: 'thong-ke',
      title: 'Thống kê',
      description: 'Xem thống kê tổng quan về sức khỏe học sinh, biểu đồ và báo cáo phân tích',
      icon: BarChart3,
      path: '/thong-ke'
    },
    {
      id: 'bao-cao',
      title: 'Báo cáo',
      description: 'Tạo và xuất các báo cáo chi tiết về kết quả khám sức khỏe học sinh',
      icon: FileText,
      path: '/bao-cao'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Card Grid */}
      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Truy cập nhanh</h1>
          <p className="text-sm text-gray-500 mt-1">Chọn đề mục để truy cập nhanh</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-[1600px]">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-5 text-left transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold leading-snug pr-2">{card.title}</h3>
                  <Icon className="w-10 h-10 flex-shrink-0 opacity-90" strokeWidth={1.5} />
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  {card.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
