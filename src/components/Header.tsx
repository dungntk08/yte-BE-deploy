import { BookOpen, Home, Users, FileText, Video, Award, Image, HelpCircle } from 'lucide-react';
import { ClipboardList, School, BarChart3 } from 'lucide-react';

interface HeaderProps {
  selectedSubMenu?: string;
  onSubMenuSelect?: (menu: string) => void;
}

export function Header({ selectedSubMenu, onSubMenuSelect }: HeaderProps) {
  const subMenuItems = [
    { id: 'campaigns', label: 'Thông tin đợt khám', icon: ClipboardList },
    { id: 'students', label: 'Thông tin học sinh', icon: Users },
    { id: 'schools', label: 'Quản lý trường học', icon: School },
    { id: 'statistics', label: 'Thống kê', icon: BarChart3 },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-blue-600 uppercase text-sm">Cân bộ quản lí trường mầm non đồi cung</h1>
          </div>
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded px-3 py-1.5 text-sm">
              <option>2025-2026</option>
              <option>2024-2025</option>
              <option>2023-2024</option>
            </select>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        {/* Submenu - chỉ hiển thị khi có props */}
        {selectedSubMenu && onSubMenuSelect && (
          <nav className="flex gap-6 text-sm">
            {subMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedSubMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSubMenuSelect(item.id)}
                  className={`flex items-center gap-2 pb-1 transition-colors ${
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}