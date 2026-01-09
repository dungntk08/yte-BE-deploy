import { BookOpen, Home, Users, FileText, Video, Award, Image, HelpCircle } from 'lucide-react';

export function Header() {
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
        
        <nav className="flex gap-6 text-sm">
          <button className="flex items-center gap-2 text-blue-600 border-b-2 border-blue-600 pb-1">
            <Users className="w-4 h-4" />
            Thông tin học sinh
          </button>
        </nav>
      </div>
    </header>
  );
}