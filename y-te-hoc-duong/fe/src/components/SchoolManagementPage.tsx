import { useState } from 'react';
import { School, Plus, Search, Building2, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useSchools } from '../hooks/useSchools';
import { useSchoolClasses } from '../hooks/useSchoolClasses';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolResponseDTO | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClassResponseDTO | null>(null);

  // Filter schools by search
  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.schoolCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get classes for selected school
  const schoolClassesForSelected = selectedSchool
    ? schoolClasses.filter(c => c.classCode.startsWith(selectedSchool.schoolCode))
    : [];

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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[30px] font-bold text-gray-900">Quản lý trường học</h1>
          <Button
            onClick={() => setShowAddSchoolModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm trường học
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-1/5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm trường học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Schools List */}
        <div className="col-span-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Danh sách trường học
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredSchools.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Không tìm thấy trường học nào</p>
              ) : (
                filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSchool?.id === school.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{school.schoolName}</h3>
                        <p className="text-sm text-gray-500">Mã: {school.schoolCode}</p>
                        <p className="text-xs text-gray-400 truncate">{school.address}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchool(school);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Classes List */}
        <div className="col-span-8">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                {selectedSchool ? `Danh sách lớp - ${selectedSchool.schoolName}` : 'Danh sách lớp học'}
              </h2>
              {selectedSchool && (
                <Button
                  onClick={() => setShowAddClassModal(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm lớp
                </Button>
              )}
            </div>

            {!selectedSchool ? (
              <div className="text-center py-12 text-gray-500">
                Vui lòng chọn một trường học để xem danh sách lớp
              </div>
            ) : classesLoading ? (
              <div className="text-center py-12 text-gray-500">Đang tải...</div>
            ) : schoolClassesForSelected.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Chưa có lớp học nào
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã lớp</TableHead>
                      <TableHead>Tên lớp</TableHead>
                      <TableHead>Khối</TableHead>
                      <TableHead>Sĩ số</TableHead>
                      <TableHead>Năm học</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schoolClassesForSelected.map((schoolClass) => (
                      <TableRow key={schoolClass.id}>
                        <TableCell className="font-medium">{schoolClass.classCode}</TableCell>
                        <TableCell>{schoolClass.className}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Khối {schoolClass.grade}</Badge>
                        </TableCell>
                        <TableCell>{schoolClass.totalStudent || 0} học sinh</TableCell>
                        <TableCell>{schoolClass.schoolYear}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClass(schoolClass)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClass(schoolClass.id, schoolClass.className)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
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
            refreshSchoolClasses();
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
            refreshSchoolClasses();
            setShowEditClassModal(false);
            setEditingClass(null);
          }}
        />
      )}
    </div>
  );
}
