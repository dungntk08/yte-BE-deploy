import React, { useEffect, useState } from 'react';
import { X, Calendar, Package, History, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../../api/axios';

interface InventoryDetailModalProps {
    productId: number;
    warehouseId: string;
    onClose: () => void;
}

const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({ productId, warehouseId, onClose }) => {
    const [activeTab, setActiveTab] = useState<'batches' | 'history'>('batches');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [productId, warehouseId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/inventory/stock/${productId}/history`, {
                params: { warehouse_id: warehouseId }
            });
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!productId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="text-blue-600" size={24} />
                            {data?.product?.Name || 'Đang tải...'}
                        </h2>
                        <div className="text-sm text-gray-500 mt-1 flex gap-4">
                            <span>Mã: <span className="font-mono text-gray-700">{data?.product?.Code}</span></span>
                            <span>ĐVT: <span className="font-medium text-gray-700">{data?.product?.unit?.Name}</span></span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6">
                    <button
                        onClick={() => setActiveTab('batches')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'batches'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Chi tiết lô (Batches)
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Lịch sử nhập xuất
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Đang tải dữ liệu chi tiết...
                        </div>
                    ) : (
                        <>
                            {activeTab === 'batches' && (
                                <div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                            <tr>
                                                <th className="p-3">Số lô</th>
                                                <th className="p-3">Hạn sử dụng</th>
                                                <th className="p-3 text-right">Số lượng tồn</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data?.batches?.length > 0 ? (
                                                data.batches.map((batch: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="p-3 font-mono text-blue-600">{batch.BatchNumber}</td>
                                                        <td className="p-3">
                                                            {batch.ExpiryDate ? new Date(batch.ExpiryDate).toLocaleDateString('vi-VN') : '---'}
                                                        </td>
                                                        <td className="p-3 text-right font-bold">
                                                            {new Intl.NumberFormat('vi-VN').format(batch.Quantity)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-8 text-center text-gray-400 italic">Không có dữ liệu tồn kho theo lô</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {/* Total Row */}
                                        {data?.batches?.length > 0 && (
                                            <tfoot className="bg-gray-50 font-bold border-t">
                                                <tr>
                                                    <td colSpan={2} className="p-3 text-right">Tổng cộng:</td>
                                                    <td className="p-3 text-right text-blue-700">
                                                        {new Intl.NumberFormat('vi-VN').format(
                                                            data.batches.reduce((sum: number, b: any) => sum + b.Quantity, 0)
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                            <tr>
                                                <th className="p-3">Ngày</th>
                                                <th className="p-3">Mã phiếu</th>
                                                <th className="p-3">Loại</th>
                                                <th className="p-3">Số lô</th>
                                                <th className="p-3 text-right">Số lượng</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data?.history?.length > 0 ? (
                                                data.history.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="p-3">
                                                            {new Date(item.VoucherDate).toLocaleDateString('vi-VN')}
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(item.VoucherDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 font-mono text-gray-700">{item.VoucherCode}</td>
                                                        <td className="p-3">
                                                            {item.Type === 'Import' ? (
                                                                <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">
                                                                    <ArrowRight size={12} /> Nhập
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-medium">
                                                                    <ArrowLeft size={12} /> Xuất
                                                                </span>
                                                            )}
                                                            <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={item.Description}>
                                                                {item.Description}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 font-mono text-xs">{item.BatchNumber}</td>
                                                        <td className={`p-3 text-right font-medium ${item.Type === 'Import' ? 'text-green-600' : 'text-orange-600'}`}>
                                                            {item.Type === 'Import' ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(item.Quantity)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-400 italic">Chưa có lịch sử giao dịch</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryDetailModal;
