import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, ChevronDown, ChevronRight, Calendar, Building2, BarChart3, FileText, School, Home } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dot-kham', 'cau-hinh', 'bao-cao']);

  const menuItems = [
    { 
      id: 'trang-chu', 
      label: 'Truy cập nhanh', 
      icon: Home, 
      path: '/'
    },
    { 
      id: 'dot-kham', 
      label: 'Đợt khám', 
      icon: Calendar, 
      path: '/dot-kham'
    },
    { 
      id: 'cau-hinh', 
      label: 'Cấu hình', 
      icon: Settings,
      subItems: [
        { id: 'truong-hoc', label: 'Cấu hình trường học', icon: Building2, path: '/truong-hoc' },
        { id: 'lop-hoc', label: 'Lớp học', icon: School, path: '/lop-hoc' },
      ]
    },
    { 
      id: 'bao-cao', 
      label: 'Báo cáo', 
      icon: FileText,
      subItems: [
        { id: 'thong-ke', label: 'Thống kê', icon: BarChart3, path: '/thong-ke' },
        { id: 'bao-cao-chi-tiet', label: 'Báo cáo', icon: FileText, path: '/bao-cao' },
      ]
    },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActiveRoute = (path: string) => {
    if (path === '/dot-kham') {
      return location.pathname.startsWith('/dot-kham');
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 min-h-screen bg-white border-r-2 border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b-2 border-gray-200">
        <h2 className="text-xl font-bold text-blue-600">Hệ thống Y tế</h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus.includes(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isActive = item.path ? isActiveRoute(item.path) : false;
            
            return (
              <li key={item.id}>
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <Link
                    to={item.path!}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                )}
                
                {/* Sub Menu Items */}
                {hasSubItems && isExpanded && (
                  <ul className="mt-1 ml-4 space-y-1">
                    {item.subItems!.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = isActiveRoute(subItem.path);
                      
                      return (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.path}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                              isSubActive
                                ? 'bg-blue-100 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span className="text-sm">{subItem.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-2 border-gray-200">
        <p className="text-xs text-gray-500 text-center">© 2026 Hệ thống Y tế</p>
      </div>
    </div>
  );
}
