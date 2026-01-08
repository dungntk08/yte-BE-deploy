import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../api/axios';
import { Search, Package } from 'lucide-react';
import { getWarehouses } from '../../warehouses/services/warehouseService';

import InventoryDetailModal from '../components/InventoryDetailModal';

const InventoryStockPage: React.FC = () => {
    const [stock, setStock] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        warehouse_id: '',
        product_name: ''
    });
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    useEffect(() => {
        fetchWarehouses();
        fetchStock();
    }, []); // Initial load

    // Refetch when filters or page change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchStock();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [filters, pagination.current_page]);

    const fetchWarehouses = async () => {
        try {
            const data = await getWarehouses();
            setWarehouses(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStock = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/stock', {
                params: {
                    warehouse_id: filters.warehouse_id,
                    search: filters.product_name,
                    page: pagination.current_page,
                    limit: 30
                }
            });
            setStock(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching stock', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to page 1 on filter
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Danh sách tồn kho
                    </h1>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Kho hàng</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={filters.warehouse_id}
                            onChange={(e) => handleFilterChange('warehouse_id', e.target.value)}
                        >
                            <option value="">-- Tất cả kho --</option>
                            {warehouses.map((w: any) => (
                                <option key={w.Id} value={w.Id}>{w.Name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-[2] min-w-[300px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tìm kiếm sản phẩm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Nhập tên hoặc mã thuốc..."
                                className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={filters.product_name}
                                onChange={(e) => handleFilterChange('product_name', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                            <tr>
                                <th className="p-4">Mã thuốc</th>
                                <th className="p-4">Tên thuốc</th>
                                <th className="p-4 text-center">ĐVT</th>
                                <th className="p-4 text-right">Tổng tồn kho</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : stock.length > 0 ? (
                                stock.map((item: any, idx: number) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedProduct(item.Id)}
                                    >
                                        <td className="p-4 font-mono text-blue-600 group-hover:text-blue-800 transition-colors">{item.Code}</td>
                                        <td className="p-4 font-medium text-gray-900">{item.Name}</td>
                                        <td className="p-4 text-center">{item.Unit}</td>
                                        <td className={`p-4 text-right font-bold ${item.Stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                                            {new Intl.NumberFormat('vi-VN').format(item.Stock)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Không tìm thấy dữ liệu tồn kho</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="p-4 border-t flex justify-end gap-2">
                            <button
                                disabled={pagination.current_page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1 text-gray-600">Trang {pagination.current_page} / {pagination.last_page}</span>
                            <button
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedProduct && (
                <InventoryDetailModal
                    productId={selectedProduct}
                    warehouseId={filters.warehouse_id}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </DashboardLayout>
    );
};

export default InventoryStockPage;
