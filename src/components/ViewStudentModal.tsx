import { X, Eye, Download } from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  citizenId: string;
  studentCode: string;
  birthDate: string;
  gender: string;
  class: string;
  status: string;
  healthData?: {
    weight?: number;
    height?: number;
    sdd?: boolean;
    overweight?: boolean;
    obesity?: boolean;
    myopia_correct?: boolean;
    myopia_incorrect?: boolean;
    hyperopia?: boolean;
    astigmatism?: boolean;
    strabismus?: boolean;
    refractive_error?: boolean;
    vkm?: boolean;
    ear_infection?: boolean;
    hearing_loss?: boolean;
    nose_inflammation?: boolean;
    throat_inflammation?: boolean;
    cavities?: boolean;
    gingivitis?: boolean;
    malocclusion?: boolean;
    scoliosis?: boolean;
    flat_feet?: boolean;
    limb_deformity?: boolean;
    eczema?: boolean;
    fungal_infection?: boolean;
    skin_allergy?: boolean;
    anxiety?: boolean;
    depression?: boolean;
    behavioral_disorder?: boolean;
    heart_disease?: boolean;
    respiratory_disease?: boolean;
    digestive_disease?: boolean;
    notify_family?: string;
  };
}

interface ViewStudentModalProps {
  student: Student | null;
  onClose: () => void;
}

export function ViewStudentModal({ student, onClose }: ViewStudentModalProps) {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'health' | 'events' | 'specialist'>('info');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2>
                Học sinh: <span>{student.name}</span>
              </h2>
              <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs">
                {student.gender}
              </span>
              <span className="bg-green-500 text-white px-3 py-1 rounded text-xs">
                Đang học
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm">
                <Eye className="w-4 h-4" />
                Xem sổ sức khỏe
              </button>
              <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm">
                <Download className="w-4 h-4" />
                Tải sổ sức khỏe
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            ĐDCN: {student.citizenId} · MHS: {student.studentCode} · NS: {student.birthDate}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-6 border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 py-3 text-sm ${
              activeTab === 'info'
                ? 'border-b-2 border-gray-800 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>📋</span>
            Thng tin chung
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 py-3 text-sm ${
              activeTab === 'health'
                ? 'border-b-2 border-gray-800 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>🩺</span>
            Theo dõi sức khỏe
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 py-3 text-sm ${
              activeTab === 'events'
                ? 'border-b-2 border-gray-800 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>📊</span>
            Diễn biến bất thường
          </button>
          <button
            onClick={() => setActiveTab('specialist')}
            className={`flex items-center gap-2 py-3 text-sm ${
              activeTab === 'specialist'
                ? 'border-b-2 border-gray-800 text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span>🏥</span>
            Khám chuyên khoa
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'info' && (
            <>
              {/* Personal Information Section */}
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <h3 className="mb-2">Thông tin học sinh</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Thông tin chi tiết của học sinh
                </p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Họ và tên:</div>
                    <div>{student.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Giới tính:</div>
                    <div>{student.gender}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Ngày sinh:</div>
                    <div>{student.birthDate}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">CCCD:</div>
                    <div>{student.citizenId}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-600 mb-1">Địa chỉ:</div>
                    <div>Khối 6 Phường Đồi Cung</div>
                  </div>
                </div>
              </div>

              {/* Physical Metrics Section */}
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <h3 className="mb-2">Chỉ số thể chất</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Các chỉ số cơ bản về thể chất
                </p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Cân nặng (kg):</div>
                    <div>25.5</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Chiều cao (cm):</div>
                    <div>120.0</div>
                  </div>
                </div>
              </div>

              {/* Health Results Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="mb-2">Kết quả khám sức khỏe</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chi tiết kết quả khám sức khỏe (nếu có)
                </p>

                {student.status === 'Đã khám' && student.healthData ? (
                  <div className="space-y-6">
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="text-gray-600 mb-1 text-sm">Trạng thái:</div>
                      <div className="text-green-600">Đã hoàn thành khám</div>
                    </div>

                    {/* Physical Metrics */}
                    {(student.healthData.weight || student.healthData.height) && (
                      <div>
                        <h4 className="text-sm mb-2">Chỉ số thể chất:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {student.healthData.weight && (
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="text-gray-600">Cân nặng:</span> {student.healthData.weight} kg
                            </div>
                          )}
                          {student.healthData.height && (
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="text-gray-600">Chiều cao:</span> {student.healthData.height} cm
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Health Indicators by Group */}
                    <div>
                      <h4 className="text-sm mb-3">Chi tiết các chỉ tiêu:</h4>
                      
                      {/* Nutrition */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          1. Tình trạng dinh dưỡng
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.sdd ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.sdd ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.sdd ? "" : "text-gray-500"}>SDD</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.overweight ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.overweight ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.overweight ? "" : "text-gray-500"}>Thừa cân</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.obesity ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.obesity ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.obesity ? "" : "text-gray-500"}>Béo phì</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Eyes */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          2. Mắt
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.myopia_correct ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.myopia_correct ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.myopia_correct ? "" : "text-gray-500"}>Cận thị - đúng số</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.myopia_incorrect ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.myopia_incorrect ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.myopia_incorrect ? "" : "text-gray-500"}>Cận thị - chưa đúng</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.hyperopia ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.hyperopia ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.hyperopia ? "" : "text-gray-500"}>Viễn thị</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.astigmatism ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.astigmatism ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.astigmatism ? "" : "text-gray-500"}>Loạn thị</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.strabismus ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.strabismus ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.strabismus ? "" : "text-gray-500"}>Lác</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.refractive_error ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.refractive_error ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.refractive_error ? "" : "text-gray-500"}>Tật khúc xạ</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.vkm ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.vkm ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.vkm ? "" : "text-gray-500"}>VKM</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ENT */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          3. Tai - Mũi - Họng
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.ear_infection ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.ear_infection ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.ear_infection ? "" : "text-gray-500"}>Viêm tai</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.hearing_loss ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.hearing_loss ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.hearing_loss ? "" : "text-gray-500"}>Giảm thính lực</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.nose_inflammation ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.nose_inflammation ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.nose_inflammation ? "" : "text-gray-500"}>Viêm mũi</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.throat_inflammation ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.throat_inflammation ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.throat_inflammation ? "" : "text-gray-500"}>Viêm họng</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dental */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          4. Răng - Hàm - Mặt
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.cavities ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.cavities ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.cavities ? "" : "text-gray-500"}>Sâu răng</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.gingivitis ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.gingivitis ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.gingivitis ? "" : "text-gray-500"}>Viêm nướu</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.malocclusion ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.malocclusion ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.malocclusion ? "" : "text-gray-500"}>Răng mọc lệch</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Musculoskeletal */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          5. Cơ - Xương - Khớp
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.scoliosis ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.scoliosis ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.scoliosis ? "" : "text-gray-500"}>Cong vẹo cột sống</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.flat_feet ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.flat_feet ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.flat_feet ? "" : "text-gray-500"}>Bàn chân bẹt</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.limb_deformity ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.limb_deformity ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.limb_deformity ? "" : "text-gray-500"}>Dị tật chi</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dermatology */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          6. Da liễu
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.eczema ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.eczema ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.eczema ? "" : "text-gray-500"}>Chàm</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.fungal_infection ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.fungal_infection ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.fungal_infection ? "" : "text-gray-500"}>Nấm da</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.skin_allergy ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.skin_allergy ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.skin_allergy ? "" : "text-gray-500"}>Dị ứng da</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mental Health */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          7. Tâm thần
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.anxiety ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.anxiety ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.anxiety ? "" : "text-gray-500"}>Lo âu</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.depression ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.depression ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.depression ? "" : "text-gray-500"}>Trầm cảm</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.behavioral_disorder ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.behavioral_disorder ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.behavioral_disorder ? "" : "text-gray-500"}>Rối loạn hành vi</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Internal Medicine */}
                      <div className="mb-4">
                        <div className="bg-gray-100 px-3 py-2 rounded-t text-sm">
                          8. Nội khoa
                        </div>
                        <div className="border border-t-0 border-gray-200 p-3 rounded-b">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.heart_disease ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.heart_disease ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.heart_disease ? "" : "text-gray-500"}>Bệnh tim</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.respiratory_disease ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.respiratory_disease ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.respiratory_disease ? "" : "text-gray-500"}>Bệnh hô hấp</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={student.healthData.digestive_disease ? "text-green-600" : "text-gray-400"}>
                                {student.healthData.digestive_disease ? "✓" : "☐"}
                              </span>
                              <span className={student.healthData.digestive_disease ? "" : "text-gray-500"}>Bệnh tiêu hóa</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {student.healthData.notify_family && (
                      <div>
                        <div className="text-gray-600 mb-1 text-sm">Thông báo gia đình:</div>
                        <div className="bg-yellow-50 p-3 rounded text-sm">
                          {student.healthData.notify_family}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Học sinh chưa thực hiện khám sức khỏe</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'health' && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500">Chức năng đang được phát triển</p>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500">Chức năng đang được phát triển</p>
            </div>
          )}

          {activeTab === 'specialist' && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-500">Chức năng đang được phát triển</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}