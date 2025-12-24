import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { createProduct, updateProduct, getProductById } from '../services/productService';
import { Product } from '../models/Product';
import { Save, ArrowLeft } from 'lucide-react';

// This could be extracted to a separate ProductForm component if needed for reuse
const ProductCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Product>({
        // Basic
        material_type: 'Thuốc',
        drug_type: 'Thuốc tây y',
        code: '',
        name: '',
        unit: 'Viên',
        price: 0,
        min_stock: 0,
        
        // Ingredients
        concentration: '',
        active_ingredient: '',
        active_ingredient_code: '',
        
        // Pharma Details
        registration_number: '',
        usage_route: 'Uống',
        dosage: '',
        pharma_type: '',
        pharma_group: '',
        drug_group: '',
        
        // Insurance & Decisions
        insurance_group: '',
        dmdc_code: '',
        byt_decision_name: '',
        insurance_coverage_rate: 100,
        qd130_code: '',
        
        // Other
        packaging_spec: '',
        program: '',
        indication: '',
        goods_code: '',
        prescription_unit: '',
        funding_source: ''
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            const data = await getProductById(productId);
            // Ensure null values are handled
            const sanitizedData: any = {};
            // Simplified merge for now, assuming response matches interface mostly
            Object.keys(formData).forEach((key) => {
                const k = key as keyof Product;
                sanitizedData[k] = data[k] !== null ? data[k] : '';
            });
            // Keep ID
             sanitizedData.id = data.id;

            setFormData(sanitizedData);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            alert('Không thể tải thông tin sản phẩm.');
            navigate('/products');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode && id) {
                await updateProduct(id, formData);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await createProduct(formData);
                alert('Thêm mới sản phẩm thành công!');
            }
            navigate('/products');
        } catch (error: any) {
            console.error('Error saving product:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-gray-800">
                        <button onClick={() => navigate('/products')} className="mr-3 p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">{isEditMode ? 'Cập nhật sản phẩm' : 'Thêm mới sản phẩm'}</h1>
                            <p className="text-sm text-gray-500">Nhập thông tin chi tiết thuốc/vật tư</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                    >
                        <Save size={20} className="mr-2" />
                        {loading ? 'Đang lưu...' : 'Lưu lại'}
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Block 1: Thông tin chung */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">1. Thông tin chung</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại vật tư</label>
                                <select name="material_type" value={formData.material_type || ''} onChange={handleChange} className="w-full border rounded-md p-2">
                                    <option value="Thuốc">Thuốc</option>
                                    <option value="Vật tư y tế">Vật tư y tế</option>
                                    <option value="Hóa chất">Hóa chất</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại thuốc</label>
                                <select name="drug_type" value={formData.drug_type || ''} onChange={handleChange} className="w-full border rounded-md p-2">
                                    <option value="Thuốc tây y">Thuốc tây y</option>
                                    <option value="Thuốc y học cổ truyền">Thuốc y học cổ truyền</option>
                                    <option value="Thực phẩm chức năng">Thực phẩm chức năng</option>
                                </select>
                            </div>
                             <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã dược (SKU)</label>
                                <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="VD: BD1" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                                <input type="text" name="unit" list="units" value={formData.unit || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                                <datalist id="units">
                                    <option value="Viên" />
                                    <option value="Hộp" />
                                    <option value="Vỉ" />
                                    <option value="Chai" />
                                    <option value="Lọ" />
                                </datalist>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên biệt dược <span className="text-red-500">*</span></label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border rounded-md p-2 font-medium" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán mặc định</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                             <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho tối thiểu</label>
                                <input type="number" name="min_stock" value={formData.min_stock} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                        </div>
                    </div>

                     {/* Block 2: Thành phần & Hàm lượng */}
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">2. Thành phần & Hàm lượng</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hàm lượng</label>
                                <input type="text" name="concentration" value={formData.concentration || ''} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="VD: 500mg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt chất</label>
                                <input type="text" name="active_ingredient" value={formData.active_ingredient || ''} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="VD: Paracetamol" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã hoạt chất</label>
                                <input type="text" name="active_ingredient_code" value={formData.active_ingredient_code || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dùng</label>
                                <select name="usage_route" value={formData.usage_route || ''} onChange={handleChange} className="w-full border rounded-md p-2">
                                    <option value="Uống">Uống</option>
                                    <option value="Tiêm">Tiêm</option>
                                    <option value="Bôi">Bôi</option>
                                    <option value="Đặt">Đặt</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Liều dùng</label>
                                <input type="text" name="dosage" value={formData.dosage || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                        </div>
                    </div>

                    {/* Block 3: Thông tin Quản lý & BHYT */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">3. Quản lý & BHYT</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số đăng ký</label>
                                <input type="text" name="registration_number" value={formData.registration_number || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm DVKT BHYT</label>
                                <input type="text" name="insurance_group" value={formData.insurance_group || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã DMDC</label>
                                <input type="text" name="dmdc_code" value={formData.dmdc_code || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ thanh toán BHYT (%)</label>
                                <input type="number" name="insurance_coverage_rate" value={formData.insurance_coverage_rate || 0} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quy cách đóng gói</label>
                                <input type="text" name="packaging_spec" value={formData.packaging_spec || ''} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="VD: Hộp 1 vỉ x 10 viên" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Công dụng</label>
                                <input type="text" name="indication" value={formData.indication || ''} onChange={handleChange} className="w-full border rounded-md p-2" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ProductCreatePage;
