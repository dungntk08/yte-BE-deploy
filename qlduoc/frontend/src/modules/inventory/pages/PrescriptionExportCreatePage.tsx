import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { Save, ArrowLeft, Plus, Trash2, X, ClipboardList, RefreshCw, Clock, CheckCircle, FileText, ChevronRight, Eye, Loader, ShoppingCart, Calendar, Printer, ChevronDown } from 'lucide-react';
import { getWarehouses, getAllUsers } from '../../warehouses/services/warehouseService';
import { getProducts } from '../../products/services/productService';

interface SelectedItem {
    product_id: string;
    product_code: string;
    product_name: string;
    unit: string;
    batch_code: string;
    expiry_date: string;
    quantity: number;
    quantity_in_stock: number;
    price: number;
}

// --- Helper Functions ---

const parseToathuocs = (xmlString: string) => {
    if (!xmlString) return [];
    const items: any[] = [];
    const regex = /<toathuoc>(.*?)<\/toathuoc>/g;
    let match;
    while ((match = regex.exec(xmlString)) !== null) {
        const inner = match[1];
        const getItem = (tag: string) => {
            const r = new RegExp(`<${tag}>(.*?)<\/${tag}>`);
            const m = r.exec(inner);
            return m ? m[1] : '';
        };
        items.push({
            'Mã thuốc': getItem('idthuoc'),
            'Tên thuốc': getItem('tenthuoc'),
            'Đơn vị': getItem('donvi'),
            'Số lượng': Number(getItem('soluong')),
            'Đơn giá': Number(getItem('giaban').replace(/,/g, '')),
            'Thành tiền': Number(getItem('thanhtien').replace(/,/g, ''))
        });
    }
    return items;
};

// --- Sub-components ---

const PrescriptionHistoryList = ({ onSelect }: { onSelect: (item: any) => void }) => {
    const [exports, setExports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExports();
    }, []);

    const fetchExports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/exports', {
                params: { sub_type: 'prescription' }
            });
            setExports(response.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" /> Đơn thuốc đã xuất
                </h3>
                <button
                    onClick={fetchExports}
                    className="p-2 hover:bg-white rounded-full transition-colors text-gray-600"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Đang tải danh sách...</div>
            ) : exports.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 font-semibold text-gray-700">
                            <tr>
                                <th className="p-3">Mã phiếu</th>
                                <th className="p-3">Số đơn</th>
                                <th className="p-3">Ngày xuất</th>
                                <th className="p-3">Bệnh nhân</th>
                                <th className="p-3">Bác sĩ</th>
                                <th className="p-3 text-center">SL thuốc</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {exports.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-3 font-mono font-medium text-blue-700">{item.code}</td>
                                    <td className="p-3">{item.document_number}</td>
                                    <td className="p-3">{item.export_date}</td>
                                    <td className="p-3 font-semibold">{item.receiver_name}</td>
                                    <td className="p-3">{item.receiver?.name || '--'}</td>
                                    <td className="p-3 text-center font-bold">{item.items_count || item.details?.length || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center text-gray-400 italic">Chưa có đơn thuốc nào được xuất</div>
            )}
        </div>
    );
};

const LegacyPrescriptionList = ({ onCreate }: { onCreate: (invoice: any) => void }) => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        return d.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [healthPosts, setHealthPosts] = useState<any[]>([]);
    const [selectedHealthPost, setSelectedHealthPost] = useState('kho_CS0');

    // Detail Modal State
    const [showDetail, setShowDetail] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [details, setDetails] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const loadHealthPosts = async () => {
            try {
                const res = await api.get('/health-posts');
                // Assume response data is array or wrapped in data
                setHealthPosts(Array.isArray(res.data) ? res.data : res.data.data || []);
            } catch (e) {
                console.error('Failed to load health posts', e);
            }
        };
        loadHealthPosts();
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [selectedHealthPost]); // Auto fetch when filter changes

    const fetchInvoices = async () => {
        setLoading(true);
        const fDate = fromDate.split('-').reverse().join('/');
        const tDate = toDate.split('-').reverse().join('/');
        try {
            const response = await api.get('/legacy/invoices', {
                params: {
                    loai: 'load_dsphieu',
                    tungay: fDate,
                    denngay: tDate,
                    maphieu: '',
                    health_post_code: selectedHealthPost,
                    Local: ''
                }
            });
            if (Array.isArray(response.data)) {
                setInvoices(response.data);
            } else if (response.data.KQ === 'norow') {
                setInvoices([]);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (invoice: any) => {
        const id = invoice['HoaDonID'];
        if (!id) return;

        setSelectedInvoice(invoice);
        setShowDetail(true);
        setLoadingDetails(true);
        setDetails([]);

        try {
            const response = await api.get('/legacy/invoices', {
                params: {
                    loai: 'load_hdct',
                    tungay: '',
                    denngay: '',
                    maphieu: id,
                    KhoCode: 'kho_CS0',
                    Local: ''
                }
            });

            if (Array.isArray(response.data) && response.data.length > 0) {
                const detailData = response.data[0];
                setSelectedInvoice(prev => ({ ...prev, ...detailData }));

                if (detailData.toathuocs) {
                    const parsedItems = parseToathuocs(detailData.toathuocs);
                    setDetails(parsedItems);
                } else {
                    setDetails([]);
                }
            } else {
                setDetails([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingDetails(false);
        }
    };

    const TotalRow = () => {
        const total = details.reduce((sum, item) => sum + (item['Thành tiền'] || 0), 0);
        return (
            <tr className="bg-white font-bold">
                <td colSpan={7} className="p-3 text-right border-t">Tổng cộng</td>
                <td className="p-3 text-right border-t">{new Intl.NumberFormat('vi-VN').format(total)}</td>
            </tr>
        );
    };

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Đơn vị:</label>
                    <select
                        value={selectedHealthPost}
                        onChange={(e) => setSelectedHealthPost(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm min-w-[200px]"
                    >
                        <option value="kho_CS0">Kho CS0 (Bệnh viện)</option>
                        {healthPosts.map(hp => (
                            <option key={hp.Id} value={hp.Code}>{hp.Name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Từ:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Đến:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-sm"
                    />
                </div>
                <button
                    onClick={fetchInvoices}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold"
                >
                    <RefreshCw size={16} /> Tải dữ liệu
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải danh sách...</div>
                ) : invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 font-semibold text-gray-700 sticky top-0 uppercase">
                                <tr>
                                    <th className="p-3 w-10 text-center">STT</th>
                                    <th className="p-3">Số HĐ</th>
                                    <th className="p-3">Mã Toa</th>
                                    <th className="p-3">Mã BN</th>
                                    <th className="p-3">Họ tên BN</th>
                                    <th className="p-3 w-12 text-center">Tuổi</th>
                                    <th className="p-3 w-12 text-center">GT</th>
                                    <th className="p-3">Địa chỉ</th>
                                    <th className="p-3 w-16 text-center">ĐT</th>
                                    <th className="p-3">Ngày lập</th>
                                    <th className="p-3 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {invoices.map((inv, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                        <td className="p-3 text-center">{idx + 1}</td>
                                        <td className="p-3">{inv['HoaDonID']}</td>
                                        <td className="p-3 font-medium text-blue-700">{inv['MaToa']}</td>
                                        <td className="p-3">{inv['BenhNhanID']}</td>
                                        <td className="p-3 font-bold uppercase">{inv['HoTen']}</td>
                                        <td className="p-3 text-center">{inv['Tuoi']}</td>
                                        <td className="p-3 text-center">{inv['gioitinh']}</td>
                                        <td className="p-3 truncate max-w-[200px]" title={inv['diachi']}>{inv['diachi']}</td>
                                        <td className="p-3 text-center">{inv['doituong']}</td>
                                        <td className="p-3 whitespace-nowrap">{inv['ngaylaphd']}</td>
                                        <td className="p-3 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => fetchDetails(inv)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded tooltip"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => onCreate(inv)}
                                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-semibold text-xs transition-shadow shadow-sm"
                                            >
                                                <ChevronRight size={14} /> Tạo
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 italic">Không có đơn thuốc nào trong ngày này</div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-xl">
                            <h3 className="font-bold text-lg text-gray-700">Chi tiết hóa đơn</h3>
                            <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {/* Header Info Grid */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Số hóa đơn:</label>
                                    <input readOnly value={selectedInvoice['HoaDonID'] || ''} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-800" />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Người nhận:</label>
                                    <input readOnly value={selectedInvoice['nguoinhan'] || selectedInvoice['HoTen'] || ''} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-800 uppercase" />
                                </div>

                                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Ngày lập:</label>
                                    <input readOnly value={selectedInvoice['ngaylap'] || selectedInvoice['ngaylaphd'] || ''} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-800" />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Đối tượng:</label>
                                    <input readOnly value={selectedInvoice['doituong'] || ''} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-800" />
                                </div>

                                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Người lập:</label>
                                    <input readOnly value={selectedInvoice['nguoilap'] || ''} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-800" />
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Tình trạng:</label>
                                    <input readOnly value={selectedInvoice['tinhtrang'] || ''} className="w-full px-3 py-2 border border-gray-200 rounded text-sm bg-white text-gray-800" />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-blue-600 text-white font-medium">
                                        <tr>
                                            <th className="p-3 w-12 text-center">STT</th>
                                            <th className="p-3">Mã thuốc</th>
                                            <th className="p-3">Tên thuốc</th>
                                            <th className="p-3">Đơn vị</th>
                                            <th className="p-3 text-center">Số lượng</th>
                                            <th className="p-3 text-right">Đơn giá</th>
                                            <th className="p-3 text-right">VAT%</th>
                                            <th className="p-3 text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loadingDetails ? (
                                            <tr><td colSpan={8} className="p-8 text-center text-gray-500">Đang tải chi tiết...</td></tr>
                                        ) : details.length > 0 ? (
                                            <>
                                                {details.map((d, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="p-3 text-center">{i + 1}</td>
                                                        <td className="p-3">{d['Mã thuốc']}</td>
                                                        <td className="p-3">{d['Tên thuốc']}</td>
                                                        <td className="p-3">{d['Đơn vị']}</td>
                                                        <td className="p-3 text-center">{d['Số lượng']}</td>
                                                        <td className="p-3 text-right">{new Intl.NumberFormat('vi-VN').format(d['Đơn giá'])}</td>
                                                        <td className="p-3 text-right">{d['VAT'] || 0}</td>
                                                        <td className="p-3 text-right">{new Intl.NumberFormat('vi-VN').format(d['Thành tiền'])}</td>
                                                    </tr>
                                                ))}
                                                <TotalRow />
                                            </>
                                        ) : (
                                            <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">Không có thuốc</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 border-t flex justify-end gap-3 bg-white pb-6 pr-6">
                            <button className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 text-sm shadow-sm">
                                In nhãn sử dụng
                            </button>
                            <button
                                onClick={() => { setShowDetail(false); onCreate(selectedInvoice); }}
                                className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 text-sm shadow-sm"
                            >
                                Phát & in hóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PrescriptionCreateForm = ({
    initialData,
    onCancel,
    onSuccess
}: {
    initialData: any,
    onCancel: () => void,
    onSuccess: () => void
}) => {
    // Header States
    const [code] = useState('PXK' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(Math.random() * 1000));
    const [documentNumber, setDocumentNumber] = useState(initialData?.['HoaDonID'] || '');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(
        initialData ? `Xuất đơn thuốc - Bệnh nhân: ${initialData['HoTen']}` : ''
    );
    const [warehouseId, setWarehouseId] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [receiverName, setReceiverName] = useState(initialData?.['HoTen'] || '');

    // Master Data
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [items, setItems] = useState<SelectedItem[]>([]);

    // Search & Add Logic
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [loadingAutoFill, setLoadingAutoFill] = useState(false);

    useEffect(() => {
        const loadMaster = async () => {
            const [w, u] = await Promise.all([getWarehouses(), getAllUsers()]);
            setWarehouses(w);
            setUsers(u);
            if (w.length > 0) {
                setWarehouseId(w[0].id);
            }
        };
        loadMaster();
    }, []);

    // Auto-fill logic when initialData and warehouseId are present
    useEffect(() => {
        if (initialData && warehouseId) {
            autoAllocateBatches();
        }
    }, [initialData, warehouseId]);

    const autoAllocateBatches = async () => {
        setLoadingAutoFill(true);
        setItems([]);
        try {
            let legacyDetails = [];
            // Parse details if available, otherwise fetch
            if (initialData.toathuocs) {
                legacyDetails = parseToathuocs(initialData.toathuocs);
            } else if (initialData['HoaDonID']) {
                const res = await api.get('/legacy/invoices', {
                    params: {
                        loai: 'load_hdct',
                        maphieu: initialData['HoaDonID'],
                        KhoCode: 'kho_CS0'
                    }
                });
                if (res.data && res.data[0] && res.data[0].toathuocs) {
                    legacyDetails = parseToathuocs(res.data[0].toathuocs);
                }
            }

            const allocatedItems: SelectedItem[] = [];

            for (const legItem of legacyDetails) {
                const legacyCode = legItem['Mã thuốc'];
                const requiredQty = legItem['Số lượng'];
                if (!legacyCode || requiredQty <= 0) continue;

                // 1. Find Product by Legacy Code (assuming code is compatible or exact match in product search)
                const productRes = await getProducts(1, legacyCode);

                // Find exact match if multiple returned
                const product = productRes.data?.find((p: any) => p.code === legacyCode) || productRes.data?.[0];

                if (!product) {
                    // console.warn(`Not found product for code: ${legacyCode}`);
                    continue;
                }

                // 2. Fetch Batches
                const batchRes = await api.get('/inventory/batches', { params: { warehouse_id: warehouseId, product_id: product.id } });
                const batches = batchRes.data || [];

                // 3. FIFO Selection
                // Sort batches by expiry date ascending
                batches.sort((a: any, b: any) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

                let remainingQty = requiredQty;

                for (const batch of batches) {
                    if (remainingQty <= 0) break;

                    const batchQty = batch.quantity;
                    const takeQty = Math.min(remainingQty, batchQty);

                    if (takeQty > 0) {
                        allocatedItems.push({
                            product_id: product.id,
                            product_code: product.code,
                            product_name: product.name,
                            unit: product.unit || 'Viên',
                            batch_code: batch.batch_code,
                            expiry_date: batch.expiry_date,
                            quantity: takeQty,
                            quantity_in_stock: batchQty,
                            price: (batch.import_price || 0) * 1.1 // Markup 10%
                        });
                        remainingQty -= takeQty;
                    }
                }

                if (remainingQty > 0) {
                    // console.warn(`Insufficient stock for ${legacyCode}. Missing ${remainingQty}`);
                }
            }

            setItems(allocatedItems);

        } catch (error) {
            console.error('Auto allocation failed:', error);
        } finally {
            setLoadingAutoFill(false);
        }
    };

    const handleSearchProduct = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const data = await getProducts(1, searchQuery);
            setSearchResults(data.data || []);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectProduct = async (product: any) => {
        if (!warehouseId) { alert('Vui lòng chọn Kho dược trước'); return; }
        setSelectedProduct(product);
        setLoadingBatches(true);
        try {
            const res = await api.get('/inventory/batches', { params: { warehouse_id: warehouseId, product_id: product.id } });
            setBatches(res.data);
            if (res.data.length === 0) alert('Sản phẩm này không có tồn kho trong kho đã chọn');
        } catch { alert('Lỗi tải danh sách lô'); }
        finally { setLoadingBatches(false); }
    };

    const handleAddBatch = (batch: any) => {
        if (items.find(i => i.product_id === selectedProduct.id && i.batch_code === batch.batch_code)) {
            alert('Lô hàng này đã được thêm');
            return;
        }
        setItems([...items, {
            product_id: selectedProduct.id,
            product_code: selectedProduct.code,
            product_name: selectedProduct.name,
            unit: selectedProduct.unit || 'Viên',
            batch_code: batch.batch_code,
            expiry_date: batch.expiry_date,
            quantity: 1,
            quantity_in_stock: batch.quantity,
            price: (batch.import_price || 0) * 1.1 // Markup 10%
        }]);
        setShowSearchModal(false);
        setSelectedProduct(null);
        setBatches([]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = async () => {
        if (!warehouseId || !receiverName || items.length === 0) {
            alert('Vui lòng điền đủ thông tin');
            return;
        }
        try {
            await api.post('/inventory/export', {
                warehouse_id: warehouseId,
                sub_type: 'prescription',
                receiver_id: receiverId || null,
                receiver_name: receiverName,
                code,
                document_number: documentNumber,
                description,
                items: items.map(item => ({
                    product_id: item.product_id,
                    batch_code: item.batch_code,
                    expiry_date: item.expiry_date,
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit
                }))
            });
            alert('Lưu thành công!');
            onSuccess();
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
                <h2 className="text-xl font-bold">Tạo phiếu xuất đơn thuốc</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2"><ClipboardList size={18} /> Thông tin chung</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Mã phiếu</label>
                        <input className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-500" value={code} readOnly />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Số đơn thuốc</label>
                        <input className="w-full px-3 py-2 border rounded" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Kho xuất</label>
                        <select className="w-full px-3 py-2 border rounded" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                            <option value="">-- Chọn kho --</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bệnh nhân</label>
                        <input className="w-full px-3 py-2 border rounded font-bold" value={receiverName} onChange={e => setReceiverName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bác sĩ</label>
                        <select className="w-full px-3 py-2 border rounded" value={receiverId} onChange={e => setReceiverId(e.target.value)}>
                            <option value="">-- Chọn bác sĩ --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ngày kê</label>
                        <input type="date" className="w-full px-3 py-2 border rounded" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea className="w-full px-3 py-2 border rounded" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        Danh sách thuốc
                        {loadingAutoFill && <span className="text-xs font-normal text-blue-600 flex items-center gap-1"><Loader className="animate-spin" size={14} /> Đang tự động điền thuốc...</span>}
                    </h3>
                    <button onClick={() => setShowSearchModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700">
                        <Plus size={16} /> Thêm thuốc
                    </button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 font-semibold text-gray-700">
                        <tr>
                            <th className="p-3 w-10">#</th>
                            <th className="p-3">Tên thuốc</th>
                            <th className="p-3 text-center">Lô</th>
                            <th className="p-3 text-center">SL</th>
                            <th className="p-3 text-right">Đơn giá</th>
                            <th className="p-3 text-right">Thành tiền</th>
                            <th className="p-3 text-center">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.length === 0 && !loadingAutoFill && (
                            <tr><td colSpan={7} className="p-8 text-center text-gray-400 italic">Chưa có thuốc nào được chọn</td></tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="p-3 text-center">{idx + 1}</td>
                                <td className="p-3">
                                    <div className="font-bold text-gray-900">{item.product_name}</div>
                                    <div className="text-xs text-gray-500">{item.product_code} - HSD: {item.expiry_date}</div>
                                </td>
                                <td className="p-3 text-center"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.batch_code}</span></td>
                                <td className="p-3 text-center">
                                    <input
                                        type="number"
                                        className="w-16 text-center border rounded py-1"
                                        value={item.quantity}
                                        onChange={e => {
                                            const v = Number(e.target.value);
                                            const newItems = [...items];
                                            newItems[idx].quantity = v > item.quantity_in_stock ? item.quantity_in_stock : v;
                                            setItems(newItems);
                                        }}
                                    />
                                    <div className="text-[10px] text-gray-400 mt-1">Max: {item.quantity_in_stock}</div>
                                </td>
                                <td className="p-3 text-right">{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                                <td className="p-3 text-right font-bold">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => {
                                        const newItems = [...items];
                                        newItems.splice(idx, 1);
                                        setItems(newItems);
                                    }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-semibold text-gray-700">Hủy bỏ</button>
                <button onClick={handleSubmit} className="px-8 py-2.5 bg-blue-900 text-white rounded-lg font-bold shadow-lg hover:bg-blue-800 flex items-center gap-2">
                    <Save size={18} /> Lưu phiếu
                </button>
            </div>

            {/* Search Modal - Reused logic */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Tìm thuốc</h3>
                            <button onClick={() => setShowSearchModal(false)}><X size={24} /></button>
                        </div>
                        <div className="p-4 flex gap-4">
                            <input
                                autoFocus
                                className="flex-1 border rounded-lg px-4 py-2"
                                placeholder="Nhập tên thuốc..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSearchProduct()}
                            />
                            <button onClick={handleSearchProduct} className="bg-blue-600 text-white px-6 rounded-lg font-bold">Tìm</button>
                        </div>
                        <div className="flex-1 overflow-hidden flex p-4 gap-4 border-t h-96">
                            <div className="flex-1 overflow-y-auto border rounded divide-y">
                                {searching ? <div className="p-4 text-center">Đang tìm...</div> :
                                    searchResults.map(p => (
                                        <div key={p.id} className={`p-3 cursor-pointer hover:bg-blue-50 ${selectedProduct?.id === p.id ? 'bg-blue-100' : ''}`} onClick={() => handleSelectProduct(p)}>
                                            <div className="font-bold text-sm">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.code} | {p.unit}</div>
                                        </div>
                                    ))}
                            </div>
                            <div className="w-1/3 overflow-y-auto border rounded p-2 space-y-2 bg-gray-50">
                                {loadingBatches ? <div className="text-center text-xs p-2">Đang tải lô...</div> :
                                    batches.map(b => (
                                        <div key={b.id} onClick={() => handleAddBatch(b)} className="bg-white p-2 rounded shadow-sm border cursor-pointer hover:border-blue-500">
                                            <div className="font-bold text-xs text-blue-700">{b.batch_code}</div>
                                            <div className="text-[10px] text-gray-500">HSD: {b.expiry_date} - SL: {b.quantity}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RetailSaleForm = ({ onSuccess }: { onSuccess: () => void }) => {
    // 1. Form State
    const [customer, setCustomer] = useState({ name: 'KHÁCH VÃNG LAI', age: '', gender: 'Nam', phone: '', address: '' });
    const [invoice, setInvoice] = useState({
        code: 'AUTO',
        date: new Date().toISOString().split('T')[0],
        warehouseId: '',
        user: 'PK Đa Khoa Bồ Đề', // Hardcoded or from auth?
        reason: 'Bán theo yêu cầu - Miễn đổi trả'
    });

    // 2. Data State
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [items, setItems] = useState<SelectedItem[]>([]);

    // 3. Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [inputQty, setInputQty] = useState(1);
    const [adding, setAdding] = useState(false);

    const [availableBatches, setAvailableBatches] = useState<any[]>([]);

    useEffect(() => {
        getWarehouses().then(data => {
            setWarehouses(data);
            if (data.length > 0) setInvoice(prev => ({ ...prev, warehouseId: data[0].id }));
        });
    }, []);

    // Search Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchQuery.trim()) { setSearchResults([]); return; }
            setSearching(true);
            try {
                const res = await getProducts(1, searchQuery);
                setSearchResults(res.data || []);
            } finally { setSearching(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchBatches = async (warehouseId: string, productId: string) => {
        if (!warehouseId || !productId) return;
        try {
            const res = await api.get('/inventory/batches', {
                params: { warehouse_id: warehouseId, product_id: productId }
            });
            const batches = res.data || [];
            batches.sort((a: any, b: any) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
            setAvailableBatches(batches);
        } catch (e) {
            console.error("Error fetching batches", e);
        }
    };

    const handleSelectProduct = (p: any) => {
        setSelectedProduct(p);
        setSearchQuery(p.Name);
        setSearchResults([]);
        // Fetch batches immediately
        fetchBatches(invoice.warehouseId, p.Id);
    };

    const allocateAndAdd = async () => {
        if (!selectedProduct || !invoice.warehouseId || inputQty <= 0) return;

        // Use existing batches if available, or fetch if empty (though handleSelectProduct should have fetched)
        let batches = availableBatches;
        if (batches.length === 0) {
            setAdding(true);
            try {
                const res = await api.get('/inventory/batches', {
                    params: { warehouse_id: invoice.warehouseId, product_id: selectedProduct.Id }
                });
                batches = res.data || [];
                batches.sort((a: any, b: any) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
                setAvailableBatches(batches);
            } catch (e) {
                alert('Lỗi lấy thông tin lô');
                setAdding(false);
                return;
            }
            setAdding(false);
        }

        setAdding(true);
        try {
            let remaining = inputQty;
            const newItems: SelectedItem[] = [];

            for (const b of batches) {
                if (remaining <= 0) break;
                if (b.quantity <= 0) continue;

                const take = Math.min(remaining, b.quantity);
                newItems.push({
                    product_id: selectedProduct.Id,
                    product_code: selectedProduct.Code,
                    product_name: selectedProduct.Name,
                    unit: selectedProduct.UnitName || 'Đơn vị',
                    batch_code: b.batch_code,
                    expiry_date: b.expiry_date,
                    quantity: take,
                    quantity_in_stock: b.quantity,
                    price: b.import_price || 0
                });
                remaining -= take;
            }

            if (remaining > 0) {
                alert(`Kho không đủ hàng. Thiếu ${remaining} ${selectedProduct.UnitName}`);
            }

            if (newItems.length > 0) {
                setItems([...items, ...newItems]);
                // Reset input
                setSelectedProduct(null);
                setSearchQuery('');
                setInputQty(1);
                setAvailableBatches([]); // Clear batches
            }
        } catch (e) {
            console.error(e);
            alert('Lỗi khi thêm thuốc');
        } finally {
            setAdding(false);
        }
    };

    const handleSubmit = async () => {
        if (items.length === 0) { alert('Chưa có thuốc nào'); return; }
        if (!invoice.warehouseId) { alert('Chưa chọn kho'); return; }

        try {
            await api.post('/inventory/export', {
                warehouse_id: invoice.warehouseId,
                sub_type: 'retail', // Distinct type
                receiver_name: customer.name,
                description: `${invoice.reason} - ĐT: ${customer.phone} - ĐC: ${customer.address}`,
                items: items.map(i => ({
                    product_id: i.product_id,
                    batch_code: i.batch_code,
                    quantity: i.quantity,
                    price: i.price, // Selling price
                }))
            });
            alert('Bán thuốc thành công!');
            onSuccess();
        } catch (e: any) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        }
    };

    const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return (
        <div className="space-y-4">
            {/* Header / Info Form */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-12">
                    <div className="space-y-3">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Mã phiếu</label>
                            <input className="w-full px-3 py-1.5 border rounded bg-gray-50 text-gray-500" value={invoice.code} readOnly />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Ngày lập</label>
                            <input type="date" className="w-full px-3 py-1.5 border rounded" value={invoice.date} onChange={e => setInvoice({ ...invoice, date: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Người lập</label>
                            <input className="w-full px-3 py-1.5 border rounded bg-gray-50" value={invoice.user} readOnly />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Kho</label>
                            <select className="w-full px-3 py-1.5 border rounded" value={invoice.warehouseId} onChange={e => setInvoice({ ...invoice, warehouseId: e.target.value })}>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Khách hàng (*)</label>
                            <input className="w-full px-3 py-1.5 border rounded uppercase font-bold" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Tuổi / GT</label>
                            <div className="flex gap-4">
                                <input className="w-20 px-3 py-1.5 border rounded" placeholder="Tuổi" value={customer.age} onChange={e => setCustomer({ ...customer, age: e.target.value })} />
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1"><input type="radio" checked={customer.gender === 'Nam'} onChange={() => setCustomer({ ...customer, gender: 'Nam' })} /> Nam</label>
                                    <label className="flex items-center gap-1"><input type="radio" checked={customer.gender === 'Nữ'} onChange={() => setCustomer({ ...customer, gender: 'Nữ' })} /> Nữ</label>
                                </div>
                                <input className="flex-1 px-3 py-1.5 border rounded" placeholder="Số điện thoại" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input className="w-full px-3 py-1.5 border rounded" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Lý do</label>
                            <input className="w-full px-3 py-1.5 border rounded" value={invoice.reason} onChange={e => setInvoice({ ...invoice, reason: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-bold text-gray-700 mb-4">Chi tiết đơn thuốc</h3>

                {/* Input Row */}
                <div className="bg-gray-50 p-2 rounded grid grid-cols-[3fr_1fr_100px_100px_50px] gap-2 mb-4 border relative">
                    <div className="relative">
                        <div className="flex flex-col">
                            <input
                                placeholder="Nhập tên thuốc để tìm..."
                                className="w-full p-2 border rounded"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {/* Batch Info Display */}
                            {selectedProduct && availableBatches.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1 flex gap-2 overflow-x-auto">
                                    <span className="font-bold whitespace-nowrap">Tồn kho:</span>
                                    {availableBatches.map((b, i) => (
                                        <span key={i} className="bg-blue-50 px-1 rounded border border-blue-100 whitespace-nowrap">
                                            Lô {b.batch_code} (HSD: {new Date(b.expiry_date).toLocaleDateString()}): <b className="text-red-600">{b.quantity}</b>
                                        </span>
                                    ))}
                                </div>
                            )}
                            {selectedProduct && availableBatches.length === 0 && (
                                <div className="text-xs text-red-500 mt-1 italic">Hết hàng trong kho này</div>
                            )}
                        </div>

                        {searching && <div className="absolute right-3 top-2.5"><Loader size={16} className="animate-spin text-gray-400" /></div>}
                        {/* Search Dropdown */}
                        {searchQuery && searchResults.length > 0 && !selectedProduct && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-xl border rounded z-10 max-h-60 overflow-y-auto">
                                {searchResults.map(p => (
                                    <div key={p.Id} className="p-2 hover:bg-blue-50 cursor-pointer text-sm" onClick={() => handleSelectProduct(p)}>
                                        <div className="font-bold">{p.Name}</div>
                                        <div className="text-xs text-gray-500">{p.Code} - {p.UnitName}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <input className="p-2 border rounded bg-white text-gray-500 h-[42px]" readOnly value={selectedProduct?.UnitName || ''} placeholder="Đơn vị" />
                    <input className="p-2 border rounded h-[42px]" type="number" min="1" value={inputQty} onChange={e => setInputQty(Number(e.target.value))} placeholder="SL" />
                    <input className="p-2 border rounded bg-gray-100 h-[42px]" readOnly placeholder="Đơn giá" />
                    <button
                        onClick={allocateAndAdd}
                        disabled={adding || !selectedProduct}
                        className="bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center disabled:bg-gray-300 h-[42px]"
                    >
                        {adding ? <Loader size={16} className="animate-spin" /> : <Plus size={20} />}
                    </button>
                    {selectedProduct && <div className="absolute top-1 right-2 text-[10px] text-green-600 font-bold bg-green-100 px-1 rounded">Đã chọn: {selectedProduct.Name}</div>}
                </div>

                {/* Table */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-blue-600 text-white font-medium">
                        <tr>
                            <th className="p-3 w-10 text-center">STT</th>
                            <th className="p-3">Tên hàng hóa</th>
                            <th className="p-3">Thành phần</th>
                            <th className="p-3">Đơn vị</th>
                            <th className="p-3 text-center">Số lượng</th>
                            <th className="p-3 text-right">Đơn giá</th>
                            <th className="p-3 text-right">Thành tiền</th>
                            <th className="p-3 text-center">#</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.length === 0 && (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400 italic">Chưa nhập thuốc</td></tr>
                        )}
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="p-3 text-center">{idx + 1}</td>
                                <td className="p-3 font-medium">{item.product_name}</td>
                                <td className="p-3 text-gray-500">{item.product_code} (Lô: {item.batch_code})</td>
                                <td className="p-3">{item.unit}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">{new Intl.NumberFormat('vi-VN').format(item.price)}</td>
                                <td className="p-3 text-right font-bold">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => {
                                        const newI = [...items];
                                        newI.splice(idx, 1);
                                        setItems(newI);
                                    }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold">
                        <tr>
                            <td colSpan={6} className="p-3 text-right">Tổng cộng:</td>
                            <td className="p-3 text-right text-blue-700 text-lg">{new Intl.NumberFormat('vi-VN').format(totalAmount)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-end gap-3">
                <button onClick={handleSubmit} className="px-6 py-2 bg-blue-700 text-white rounded font-bold hover:bg-blue-800 shadow-lg flex items-center gap-2">
                    <Save size={18} /> Bán thuốc
                </button>
                <button onClick={() => setItems([])} className="px-6 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 shadow-lg flex items-center gap-2">
                    <Plus size={18} /> Lập phiếu mới
                </button>
            </div>
        </div>
    );
};

const PrescriptionExportCreatePage = () => {
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'retail'>('pending');
    const [selectedLegacyItem, setSelectedLegacyItem] = useState<any>(null);

    const handleCreate = (legacyItem: any) => {
        setSelectedLegacyItem(legacyItem);
        setViewMode('create');
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedLegacyItem(null);
    };

    const handleSuccess = () => {
        setViewMode('list');
        setActiveTab('history');
        setSelectedLegacyItem(null);
    };

    if (viewMode === 'create') {
        return (
            <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
                <PrescriptionCreateForm
                    initialData={selectedLegacyItem}
                    onCancel={handleBack}
                    onSuccess={handleSuccess}
                />
            </div>
        );
    }

    return (
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quản lý xuất đơn thuốc</h1>
                <button
                    onClick={() => handleCreate(null)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700"
                >
                    <Plus size={20} /> Tạo mới
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <Clock size={16} /> Đơn thuốc chờ xuất
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('history')}
                >
                    <FileText size={16} /> Lịch sử xuất đơn
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'retail' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('retail')}
                >
                    <ShoppingCart size={16} /> Bán thuốc dịch vụ
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'pending' && <LegacyPrescriptionList onCreate={handleCreate} />}
                {activeTab === 'history' && <PrescriptionHistoryList onSelect={() => { /* Optional: View detail */ }} />}
                {activeTab === 'retail' && <RetailSaleForm onSuccess={() => setActiveTab('history')} />}
            </div>
        </div>
    );
};

export default PrescriptionExportCreatePage;
