import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface HealthIndicatorsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  healthData: any;
  setHealthData: (data: any) => void;
  readOnly?: boolean;
}

export function HealthIndicatorsForm({ 
  formData, 
  setFormData, 
  healthData, 
  setHealthData,
  readOnly = false 
}: HealthIndicatorsFormProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['nutrition']);

  // Safe defaults
  const safeFormData = formData || {};
  const safeHealthData = healthData || {};

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCheckboxChange = (field: string, value: boolean) => {
    if (!readOnly && setHealthData && typeof setHealthData === 'function') {
      setHealthData({ ...safeHealthData, [field]: value });
    }
  };

  const CheckboxField = ({ label, field }: { label: string; field: string }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={field}
        checked={safeHealthData[field as keyof typeof safeHealthData] as boolean || false}
        onChange={(e) => handleCheckboxChange(field, e.target.checked)}
        disabled={readOnly}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
      />
      <label htmlFor={field} className="ml-2 text-sm text-gray-700">
        {label}
      </label>
    </div>
  );

  const AccordionSection = ({ 
    id, 
    title, 
    children 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.includes(id);
    
    return (
      <div className="border border-gray-200 rounded-lg mb-3">
        <button
          type="button"
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h4 className="text-sm">{title}</h4>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 bg-white">
            <div className="grid grid-cols-2 gap-3">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Physical Metrics */}
      <div className="mb-6">
        <h3 className="mb-4">Chỉ số thể chất</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cân nặng (kg)</label>
            <input
              type="number"
              step="0.1"
              value={safeFormData.weight || ''}
              onChange={(e) => {
                if (setFormData && typeof setFormData === 'function') {
                  setFormData({ ...safeFormData, weight: e.target.value });
                }
              }}
              placeholder="Nhập cân nặng"
              disabled={readOnly}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Chiều cao (cm)</label>
            <input
              type="number"
              step="0.1"
              value={safeFormData.height || ''}
              onChange={(e) => {
                if (setFormData && typeof setFormData === 'function') {
                  setFormData({ ...safeFormData, height: e.target.value });
                }
              }}
              placeholder="Nhập chiều cao"
              disabled={readOnly}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Health Indicators by Group */}
      <div className="mb-6">
        <h3 className="mb-4">Kết quả khám sức khỏe</h3>
        <p className="text-sm text-gray-600 mb-4">
          Chọn các vấn đề sức khỏe phát hiện được (nếu có)
        </p>

        {/* Nutrition */}
        <AccordionSection id="nutrition" title="1. Tình trạng dinh dưỡng">
          <CheckboxField label="SDD (Suy dinh dưỡng)" field="sdd" />
          <CheckboxField label="Thừa cân" field="overweight" />
          <CheckboxField label="Béo phì" field="obesity" />
        </AccordionSection>

        {/* Eyes */}
        <AccordionSection id="eyes" title="2. Mắt">
          <CheckboxField label="Cận thị - đúng số" field="myopia_correct" />
          <CheckboxField label="Cận thị - chưa đúng số" field="myopia_incorrect" />
          <CheckboxField label="Viễn thị" field="hyperopia" />
          <CheckboxField label="Loạn thị" field="astigmatism" />
          <CheckboxField label="Lác" field="strabismus" />
          <CheckboxField label="Tật khúc xạ" field="refractive_error" />
          <CheckboxField label="VKM (Viêm kết mạc)" field="vkm" />
        </AccordionSection>

        {/* ENT */}
        <AccordionSection id="ent" title="3. Tai - Mũi - Họng">
          <CheckboxField label="Viêm tai" field="ear_infection" />
          <CheckboxField label="Giảm thính lực" field="hearing_loss" />
          <CheckboxField label="Viêm mũi" field="nose_inflammation" />
          <CheckboxField label="Viêm họng" field="throat_inflammation" />
        </AccordionSection>

        {/* Dental */}
        <AccordionSection id="dental" title="4. Răng - Hàm - Mặt">
          <CheckboxField label="Sâu răng" field="cavities" />
          <CheckboxField label="Viêm nướu" field="gingivitis" />
          <CheckboxField label="Răng mọc lệch" field="malocclusion" />
        </AccordionSection>

        {/* Musculoskeletal */}
        <AccordionSection id="musculoskeletal" title="5. Cơ - Xương - Khớp">
          <CheckboxField label="Cong vẹo cột sống" field="scoliosis" />
          <CheckboxField label="Bàn chân bẹt" field="flat_feet" />
          <CheckboxField label="Dị tật chi" field="limb_deformity" />
        </AccordionSection>

        {/* Dermatology */}
        <AccordionSection id="dermatology" title="6. Da liễu">
          <CheckboxField label="Chàm" field="eczema" />
          <CheckboxField label="Nấm da" field="fungal_infection" />
          <CheckboxField label="Dị ứng da" field="skin_allergy" />
        </AccordionSection>

        {/* Mental Health */}
        <AccordionSection id="mental" title="7. Tâm thần">
          <CheckboxField label="Lo âu" field="anxiety" />
          <CheckboxField label="Trầm cảm" field="depression" />
          <CheckboxField label="Rối loạn hành vi" field="behavioral_disorder" />
        </AccordionSection>

        {/* Internal Medicine */}
        <AccordionSection id="internal" title="8. Nội khoa">
          <CheckboxField label="Bệnh tim" field="heart_disease" />
          <CheckboxField label="Bệnh hô hấp" field="respiratory_disease" />
          <CheckboxField label="Bệnh tiêu hóa" field="digestive_disease" />
        </AccordionSection>
      </div>

      {/* Family Notification */}
      <div className="mb-6">
        <h3 className="mb-4">Thông báo gia đình</h3>
        <textarea
          value={safeFormData.notify_family || ''}
          onChange={(e) => {
            if (setFormData && typeof setFormData === 'function') {
              setFormData({ ...safeFormData, notify_family: e.target.value });
            }
          }}
          placeholder="Nhập nội dung thông báo gửi gia đình (nếu cần)"
          rows={4}
          disabled={readOnly}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>
    </>
  );
}