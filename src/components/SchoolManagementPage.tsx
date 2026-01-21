import { useState, useEffect } from 'react';
import { School, Plus, Search, Building2, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useSchools } from '../hooks/useSchools';
import { useSchoolClasses } from '../hooks/useSchoolClasses';
import schoolClassService from '../services/schoolClassService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { AddSchoolModal } from './AddSchoolModal';
import { EditSchoolModal } from './EditSchoolModal';
import { AddSchoolClassModal } from './AddSchoolClassModal';
import { EditSchoolClassModal } from './EditSchoolClassModal';
import { SchoolResponseDTO } from '../services/schoolService';
import { SchoolClassResponseDTO } from '../services/schoolClassService';

export function SchoolManagementPage() {
  const { schools, loading: schoolsLoading, refreshSchools } = useSchools();
  const { schoolClasses, loading: classesLoading, deleteSchoolClass, refreshSchoolClasses } = useSchoolClasses();
  
  const [selectedSchool, setSelectedSchool] = useState<SchoolResponseDTO | null>(null);
  const [selectedSchoolClasses, setSelectedSchoolClasses] = useState<SchoolClassResponseDTO[]>([]);
  const [loadingSelectedClasses, setLoadingSelectedClasses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolResponseDTO | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClassResponseDTO | null>(null);

  // Load classes for selected school
  useEffect(() => {
    if (selectedSchool) {
      loadClassesForSchool(selectedSchool.id);
    } else {
      setSelectedSchoolClasses([]);
    }
  }, [selectedSchool]);

  const loadClassesForSchool = async (schoolId: number) => {
    setLoadingSelectedClasses(true);
    try {
      const classes = await schoolClassService.getSchoolClassesBySchool(schoolId);
      setSelectedSchoolClasses(classes);
    } catch (error) {
      console.error('Error loading classes:', error);
      setSelectedSchoolClasses([]);
    } finally {
      setLoadingSelectedClasses(false);
    }
  };

  // Filter schools by search
  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.schoolCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditSchool = (school: SchoolResponseDTO) => {
    setEditingSchool(school);
    setShowEditSchoolModal(true);
  };

  const handleEditClass = (schoolClass: SchoolClassResponseDTO) => {
    setEditingClass(schoolClass);
    setShowEditClassModal(true);
  };

  const handleDeleteClass = async (id: number, className: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp "${className}"?`)) {
      try {
        await deleteSchoolClass(id);
        // Reload classes for selected school
        if (selectedSchool) {
          loadClassesForSchool(selectedSchool.id);
        }
      } catch (error) {
        alert('Không thể xóa lớp học. Vui lòng thử lại.');
      }
    }
  };

  if (schoolsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ padding: '48px 130px' }}>
      {/* Header */}
      <div className="mb-6 pb-8 mt-2.5 border-b border-gray-200" style={{ paddingBottom: '36px' }}>
        <div className="flex items-center justify-between gap-4">
          <h1 style={{ fontSize: '30px', fontWeight: 'bold' }} className="text-gray-900">Quản lý trường học</h1>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative" style={{ width: '300px' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm trường học..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full rounded-full"
              />
            </div>
            
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Schools Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Danh sách trường học
          </h2>
          {filteredSchools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy trường học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredSchools.map((school) => (
                <Card
                  key={school.id}
                  onClick={() => setSelectedSchool(school)}
                  className={`p-4 border-2 rounded-lg hover:shadow-lg transition-all cursor-pointer ${
                    selectedSchool?.id === school.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{school.schoolName}</h3>
                        <p className="text-xs text-gray-500">Mã: {school.schoolCode}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleEditSchool(school);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{school.address}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Classes List */}
        {selectedSchool && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '18px', fontWeight: '600' }} className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Danh sách lớp - {selectedSchool.schoolName}
              </h2>
              <button
                onClick={() => setShowAddClassModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm mới</span>
              </button>
            </div>

            {loadingSelectedClasses ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : selectedSchoolClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Chưa có lớp học nào
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên lớp</TableHead>
                      <TableHead>Khối</TableHead>
                      <TableHead>Sĩ số</TableHead>
                      <TableHead>Năm học</TableHead>
                      <TableHead className="w-[100px] text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSchoolClasses.map((schoolClass) => (
                      <TableRow key={schoolClass.id}>
                        <TableCell className="font-medium">{schoolClass.className}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Khối {schoolClass.grade}</Badge>
                        </TableCell>
                        <TableCell>{schoolClass.totalStudent || 0} học sinh</TableCell>
                        <TableCell>{schoolClass.schoolYear}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClass(schoolClass)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClass(schoolClass.id, schoolClass.className)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modals */}
      {showAddSchoolModal && (
        <AddSchoolModal
          isOpen={showAddSchoolModal}
          onClose={() => setShowAddSchoolModal(false)}
          onSuccess={() => {
            refreshSchools();
            setShowAddSchoolModal(false);
          }}
        />
      )}

      {showEditSchoolModal && editingSchool && (
        <EditSchoolModal
          isOpen={showEditSchoolModal}
          school={editingSchool}
          onClose={() => {
            setShowEditSchoolModal(false);
            setEditingSchool(null);
          }}
          onSuccess={() => {
            refreshSchools();
            setShowEditSchoolModal(false);
            setEditingSchool(null);
          }}
        />
      )}

      {showAddClassModal && selectedSchool && (
        <AddSchoolClassModal
          isOpen={showAddClassModal}
          school={selectedSchool}
          onClose={() => setShowAddClassModal(false)}
          onSuccess={() => {
            // Reload classes for selected school
            if (selectedSchool) {
              loadClassesForSchool(selectedSchool.id);
            }
            setShowAddClassModal(false);
          }}
        />
      )}

      {showEditClassModal && editingClass && selectedSchool && (
        <EditSchoolClassModal
          isOpen={showEditClassModal}
          schoolClass={editingClass}
          school={selectedSchool}
          onClose={() => {
            setShowEditClassModal(false);
            setEditingClass(null);
          }}
          onSuccess={() => {
            // Reload classes for selected school
            if (selectedSchool) {
              loadClassesForSchool(selectedSchool.id);
            }
            setShowEditClassModal(false);
            setEditingClass(null);
          }}
        />
      )}
    </div>
  );
}
