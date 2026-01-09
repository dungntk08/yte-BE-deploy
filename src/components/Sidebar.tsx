import { useState } from 'react';
import { Home, Pill, GraduationCap } from 'lucide-react';

interface SidebarProps {
  selectedMenu: string;
  onMenuSelect: (menu: string) => void;
}

export function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  const menuItems = [
    { id: 'y-te-so', label: 'Y tế số', icon: Home },
    { id: 'duoc', label: 'Dược', icon: Pill },
    { id: 'y-te-hoc-duong', label: 'Y tế học đường', icon: GraduationCap },
  ];

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
            const isActive = selectedMenu === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
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
