import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, ClipboardList, Settings, Package, FileText, Users } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = [
    { icon: <Home size={20} />, label: 'Tổng quan', path: '/' },
    {
      icon: <ClipboardList size={20} />, label: 'Hoạt động kho', path: '/inventory', subItems: [
        { label: 'Nhập hàng', path: '/inventory/import' },
        { label: 'Xuất hàng', path: '/inventory/export' },
        { label: 'Đề nghị', path: '/inventory/requests' },
        { label: '⚠️ Cảnh báo tồn kho', path: '/inventory/alerts' },
      ]
    },
    { icon: <Package size={20} />, label: 'Tồn kho', path: '/inventory/stock' },
    {
      icon: <FileText size={20} />, label: 'Báo cáo', path: '/reports', subItems: [
        { label: 'Kiểm kê kho', path: '/reports/inventory-check' },
      ]
    },
    {
      icon: <Settings size={20} />, label: 'Cài đặt', path: '/settings', subItems: [
        { label: 'Hàng hóa', path: '/products' },
        { label: 'Kho hàng', path: '/warehouses' },
        { label: 'Nhà cung cấp', path: '/suppliers' },
        { label: 'Đơn vị tính', path: '/units' },
        { label: 'Nhân viên', path: '/users' },
      ]
    },
  ];

  const isActive = (item: any) => {
    if (item.path === '/' && location.pathname === '/') return true;
    if (item.path !== '/' && location.pathname.startsWith(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some((sub: any) => location.pathname.startsWith(sub.path));
    }
    return false;
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-xl font-bold text-gray-800">QLDuoc</span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item);

            return (
              <li key={item.label}>
                <div
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => {
                    if (item.path !== '/' && !item.path.startsWith('#')) {
                      if (item.subItems) {
                        navigate(item.subItems[0].path);
                      } else {
                        navigate(item.path);
                      }
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </div>
                {item.subItems && active && (
                  <ul className="pl-12 mt-1 space-y-1">
                    {item.subItems.map(sub => (
                      <li key={sub.path}>
                        <NavLink to={sub.path} className={({ isActive }) => `block py-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t space-y-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="ml-3 font-medium">Đăng xuất</span>
        </button>

        <div className="flex items-center space-x-3 px-2 pt-2 border-t border-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <span className="text-lg font-bold text-gray-800">QLDuoc</span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-2 lg:p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
