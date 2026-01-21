import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Building2, 
  BarChart3, 
  FileText, 
  ChevronDown,
  GraduationCap
} from 'lucide-react';

export function TopNavbar() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const submenuItems = [
    { 
      id: 'dot-kham', 
      label: 'Đợt khám', 
      icon: Calendar, 
      path: '/dot-kham'
    },
    { 
      id: 'truong-hoc', 
      label: 'Cấu hình trường học', 
      icon: Building2, 
      path: '/truong-hoc'
    },
    { 
      id: 'thong-ke', 
      label: 'Thống kê', 
      icon: BarChart3, 
      path: '/thong-ke'
    },
    { 
      id: 'bao-cao', 
      label: 'Báo cáo', 
      icon: FileText, 
      path: '/bao-cao'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isAnySubmenuActive = submenuItems.some(item => isActive(item.path));

  return (
    <div className="bg-white border-b-2 border-gray-200">
      {/* Top Bar with Logo and User */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200" style={{paddingBottom: '0.5rem', paddingTop: '0.5rem'}}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">🏥</span>
          </div>
          <h1 className="text-lg font-bold text-blue-600 uppercase">
            TRẠM Y TẾ BỒ ĐỀ
          </h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="px-6">
        <ul className="flex gap-1">
          <li 
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                isAnySubmenuActive
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Y tế học đường</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  {submenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            active
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
