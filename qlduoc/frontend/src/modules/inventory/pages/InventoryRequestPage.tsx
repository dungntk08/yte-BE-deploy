import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getInventoryRequests, InventoryRequest, createInventoryRequest } from '../services/inventoryRequestService';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import { Warehouse } from '../../warehouses/models/Warehouse';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';
import { Product } from '../../products/models/Product';

const InventoryRequestPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
    const [requests, setRequests] = useState<InventoryRequest[]>([]); // Should be paginated in real app, simplified here
    const [loading, setLoading] = useState(false);
    
    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    
    // Form State
    const [requestWarehouseId, setRequestWarehouseId] = useState('');
    const [supplyWarehouseId, setSupplyWarehouseId] = useState('');
    const [description, setDescription] = useState('');
    const [items, setItems] = useState<any[]>([{ product_id: '', quantity: 1, unit: '' }]);

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    useEffect(() => {
        if (showCreateModal) {
            fetchWarehouses();
        }
    }, [showCreateModal]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getInventoryRequests(activeTab);
            // Assuming data.data if paginated, or data if array. Controller returns `paginate`.
            setRequests(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const data = await getWarehouses();
            setWarehouses(data);
            if (data.length > 0) setRequestWarehouseId(data[0].id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { product_id: '', quantity: 1, unit: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };
    
    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...items];
        newItems[index].product_id = product.id;
        newItems[index].product_name = product.name; // For display if needed
        setItems(newItems);
    }

    const handleSubmit = async () => {
        if (!requestWarehouseId || !supplyWarehouseId) {
            alert('Vui lòng chọn kho yêu cầu và kho cung cấp');
            return;
        }
        if (requestWarehouseId === supplyWarehouseId) {
            alert('Kho cung cấp phải khác kho yêu cầu');
            return;
        }
        if (items.some(i => !i.product_id || i.quantity <= 0)) {
            alert('Vui lòng kiểm tra lại danh sách hàng hóa');
            return;
        }

        try {
            await createInventoryRequest({
                request_warehouse_id: requestWarehouseId,
                supply_warehouse_id: supplyWarehouseId,
                description,
                items
            });
            alert('Tạo phiếu thành công');
            setShowCreateModal(false);
            setItems([{ product_id: '', quantity: 1, unit: '' }]);
            setDescription('');
            fetchRequests(); // Refresh list if on 'sent' tab
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Có lỗi xảy ra'));
        }
    };
    
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Chờ duyệt</span>;
            case 'approved': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Đã duyệt</span>;
            case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Từ chối</span>;
            case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Hoàn thành</span>;
            case 'cancelled': return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Đã hủy</span>;
            default: return status;
        }
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Phiếu Đề Nghị Nhập Kho</h1>
                    <button 
                        onClick={() => { setShowCreateModal(true); setActiveTab('sent'); }} // Usually you create a 'sent' request
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} /> Tạo phiếu
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`py-2 px-6 font-medium border-b-2 transition-colors ${
                            activeTab === 'sent'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Danh sách yêu cầu (Gửi đi)
                    </button>
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`py-2 px-6 font-medium border-b-2 transition-colors ${
                            activeTab === 'received'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Danh sách được yêu cầu (Nhận được)
                    </button>
                </div>

                {/* Filters (Simplified) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm mã phiếu..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                            <tr>
                                <th className="p-4">Mã phiếu</th>
                                <th className="p-4">Ngày tạo</th>
                                <th className="p-4">{activeTab === 'sent' ? 'Kho cung cấp' : 'Kho yêu cầu'}</th>
                                <th className="p-4">Người tạo</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-4 text-center">Đang tải...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Chưa có phiếu nào</td></tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-blue-600">{req.code}</td>
                                        <td className="p-4">{new Date(req.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="p-4">
                                            {activeTab === 'sent' ? req.supply_warehouse?.name : req.request_warehouse?.name}
                                        </td>
                                        <td className="p-4">{req.creator?.name}</td>
                                        <td className="p-4">{getStatusBadge(req.status)}</td>
                                        <td className="p-4 text-center">
                                            <button className="text-gray-500 hover:text-blue-600 mr-2">
                                                <Eye size={18} />
                                            </button>
                                            {activeTab === 'received' && req.status === 'pending' && (
                                                <button 
                                                    onClick={() => window.location.href = `/inventory/export/create?request_id=${req.id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-xs border border-blue-600 px-2 py-1 rounded"
                                                >
                                                    Xuất kho
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <h2 className="text-xl font-bold">Tạo Phiếu Đề Nghị</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kho yêu cầu (Của bạn)</label>
                                        <select 
                                            className="w-full border rounded px-3 py-2"
                                            value={requestWarehouseId}
                                            onChange={(e) => setRequestWarehouseId(e.target.value)}
                                        >
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kho cung cấp (Nơi xin hàng)</label>
                                        <select 
                                            className="w-full border rounded px-3 py-2"
                                            value={supplyWarehouseId}
                                            onChange={(e) => setSupplyWarehouseId(e.target.value)}
                                        >
                                            <option value="">-- Chọn kho --</option>
                                            {warehouses.filter(w=>w.id !== requestWarehouseId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ghi chú</label>
                                    <textarea 
                                        className="w-full border rounded px-3 py-2"
                                        rows={2}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Danh sách hàng hóa</h3>
                                    <table className="w-full text-sm border">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-2 border">Hàng hóa</th>
                                                <th className="p-2 border w-24">Số lượng</th>
                                                <th className="p-2 border w-24">ĐVT</th>
                                                <th className="p-2 border w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-2 border">
                                                        <ProductSearchSelect 
                                                            value={item.product_id}
                                                            initialDisplayName={item.product_name}
                                                            onSelect={(p) => handleProductSelect(idx, p)}
                                                        />
                                                    </td>
                                                    <td className="p-2 border">
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            className="w-full border rounded px-2 py-1"
                                                            value={item.quantity}
                                                            onChange={e => handleUpdateItem(idx, 'quantity', parseInt(e.target.value))}
                                                        />
                                                    </td>
                                                    <td className="p-2 border">
                                                        <input 
                                                            type="text" 
                                                            className="w-full border rounded px-2 py-1"
                                                            value={item.unit}
                                                            onChange={e => handleUpdateItem(idx, 'unit', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="p-2 border text-center">
                                                        <button 
                                                            onClick={() => handleRemoveItem(idx)}
                                                            className="text-red-500"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button onClick={handleAddItem} className="mt-2 text-blue-600 text-sm flex items-center gap-1">
                                        <Plus size={16} /> Thêm dòng
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
                                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu phiếu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
import { Trash2 } from 'lucide-react'; // Missed import fix

export default InventoryRequestPage;
