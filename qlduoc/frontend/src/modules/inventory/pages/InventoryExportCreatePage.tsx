import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../api/axios';
import { Save, ArrowLeft, Calendar } from 'lucide-react';

const InventoryExportCreatePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const requestId = searchParams.get('request_id');

    const [loading, setLoading] = useState(true);
    const [previewData, setPreviewData] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    
    // Header Info
    const [code, setCode] = useState('PX' + new Date().toISOString().slice(0,10).replace(/-/g,'') + Math.floor(Math.random()*1000));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('Xuất kho nội bộ');
    const [warehouseName, setWarehouseName] = useState(''); // Source
    const [destWarehouseName, setDestWarehouseName] = useState(''); // Dest

    useEffect(() => {
        if (requestId) {
            fetchPreview(requestId);
        }
    }, [requestId]);

    const fetchPreview = async (id: string) => {
        try {
            const response = await api.get('/inventory/export/preview', { params: { request_id: id } });
            setPreviewData(response.data);
            setItems(response.data.items || []);
            
            if (response.data.request) {
                setWarehouseName(response.data.request.supply_warehouse?.name || 'Kho xuất');
                setDestWarehouseName(response.data.request.request_warehouse?.name || 'Kho nhập');
                setDescription(`Xuất theo phiếu đề nghị ${response.data.request.code}`);
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi tải dữ liệu phiếu đề nghị');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!previewData?.request) return;

        try {
            await api.post('/inventory/export', {
                warehouse_id: previewData.request.supply_warehouse_id,
                destination_warehouse_id: previewData.request.request_warehouse_id,
                inventory_request_id: previewData.request.id,
                receiver_id: previewData.request.created_by, // Receiver is creator of request
                code,
                description,
                items: items.map(item => ({
                    product_id: item.product_id,
                    batch_code: item.batch_code,
                    expiry_date: item.expiry_date,
                    quantity: Number(item.quantity)
                }))
            });
            alert('Xuất kho thành công!');
            navigate('/inventory/requests');
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleQuantityChange = (idx: number, val: number) => {
        const newItems = [...items];
        newItems[idx].quantity = val;
        setItems(newItems);
    }

    if (loading) return <DashboardLayout><div>Đang tải...</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Thêm phiếu xuất nội bộ</h1>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-blue-600 font-semibold mb-4 text-sm uppercase tracking-wide">Thông tin chung</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã chứng từ</label>
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại phiếu</label>
                            <input 
                                type="text" 
                                value="Xuất nội bộ" 
                                disabled
                                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kho giao (Nguồn)</label>
                            <input 
                                type="text"
                                value={warehouseName}
                                disabled
                                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp xuất</label>
                            <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option>Xuất theo lô nhập (FIFO)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kho nhận (Đích)</label>
                            <input 
                                type="text"
                                value={destWarehouseName}
                                disabled
                                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày chứng từ</label>
                             <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium">
                            <tr>
                                <th className="p-4 border-b">Mã thuốc</th>
                                <th className="p-4 border-b">Số lô</th>
                                <th className="p-4 border-b">Hạn dùng</th>
                                <th className="p-4 border-b">Tên thuốc</th>
                                <th className="p-4 border-b">ĐVT</th>
                                <th className="p-4 border-b w-32">Số lượng</th>
                                <th className="p-4 border-b">Tồn lô</th>
                                <th className="p-4 border-b">Đơn giá</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="p-4">{item.product_code}</td>
                                    <td className="p-4 text-blue-600 font-medium">{item.batch_code}</td>
                                    <td className="p-4">{item.expiry_date}</td>
                                    <td className="p-4 font-medium">{item.product_name}</td>
                                    <td className="p-4 text-gray-500">{item.unit}</td>
                                    <td className="p-4">
                                        <input 
                                            type="number" 
                                            className="w-full border rounded px-2 py-1 text-center font-bold text-blue-600"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                                            max={item.quantity_in_stock}
                                        />
                                    </td>
                                    <td className="p-4 text-gray-500">{item.quantity_in_stock}</td>
                                    <td className="p-4 text-right">{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        Không có hàng hóa nào được đề xuất (Có thể do hết hàng tồn kho)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3 pb-8">
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                        Hủy (Esc)
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 shadow-sm"
                    >
                        <Save size={20} /> Lưu (F10)
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InventoryExportCreatePage;
