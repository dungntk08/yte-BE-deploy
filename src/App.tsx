import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StudentTable } from './components/StudentTable';
import { CampaignListPage } from './components/CampaignListPage';
import { SchoolManagementPage } from './components/SchoolManagementPage';
import { StatisticsPage } from './components/StatisticsPage';

export default function App() {
  const [selectedMenu, setSelectedMenu] = useState('y-te-hoc-duong');
  const [selectedSubMenu, setSelectedSubMenu] = useState<string>('campaigns'); // campaigns, students, schools, statistics

  // Render content dựa trên menu được chọn
  const renderContent = () => {
    if (selectedMenu === 'y-te-hoc-duong') {
      switch (selectedSubMenu) {
        case 'campaigns':
          return <CampaignListPage />;
        case 'students':
          return <StudentTable />;
        case 'schools':
          return <SchoolManagementPage />;
        case 'statistics':
          return <StatisticsPage />;
        default:
          return <CampaignListPage />;
      }
    }

    // Placeholder cho các menu khác
    if (selectedMenu === 'y-te-so') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Y tế số</h2>
            <p className="text-gray-500">Chức năng đang được phát triển</p>
          </div>
        </div>
      );
    }

    if (selectedMenu === 'duoc') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Dược</h2>
            <p className="text-gray-500">Chức năng đang được phát triển</p>
          </div>
        </div>
      );
    }

    return <CampaignListPage />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar selectedMenu={selectedMenu} onMenuSelect={setSelectedMenu} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header với submenu cho Y tế học đường */}
        <Header 
          selectedSubMenu={selectedMenu === 'y-te-hoc-duong' ? selectedSubMenu : undefined}
          onSubMenuSelect={selectedMenu === 'y-te-hoc-duong' ? setSelectedSubMenu : undefined}
        />

        {/* Content Area */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}