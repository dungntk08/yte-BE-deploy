import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import { createOpeningStockManual, parseOpeningStock, downloadSample, createImportNote } from '../services/inventoryService';
import { getSuppliers, Supplier } from '../services/supplierService';
import { Warehouse } from '../../warehouses/models/Warehouse';
import { Product } from '../../products/models/Product';
import { FileUp, Plus, Trash2, Save, Download } from 'lucide-react';
import ProductSearchSelect from '../../../components/common/ProductSearchSelect';

const InventoryImportPage: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    
    // Import Mode
    const [importMode, setImportMode] = useState<'OPENING_STOCK' | 'SUPPLIER'>('SUPPLIER');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    
    // State
    const [loading, setLoading] = useState(false);
    
    // Auto-generate code: PN + YYYYMMDD + HHmm
    const generateCode = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `PN${yyyy}${mm}${dd}${hh}${min}`;
    };

    const [manualCode, setManualCode] = useState(generateCode());
    const [manualItems, setManualItems] = useState<any[]>([
        { product_id: '', product_name: '', product_code: '', batch_code: '', expiry_date: '', quantity: 1, price: 0, vat: 0, discount: 0 }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const wData = await getWarehouses();
            setWarehouses(wData);
            if (wData.length > 0) setSelectedWarehouse(wData[0].id);

            const sData = await getSuppliers();
            setSuppliers(sData);

        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleFileParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLoading(true);
            try {
                const parsedItems = await parseOpeningStock(file);
                if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                     const newItems = parsedItems.map(item => ({
                         product_id: item.product_id,
                         product_name: item.product_name,
                         product_code: item.product_code,
                         batch_code: item.batch_code,
                         expiry_date: item.expiry_date,
                         quantity: item.quantity,
                         price: item.price
                     }));
                     
                     if (manualItems.length === 1 && !manualItems[0].product_id) {
                         setManualItems(newItems);
                     } else {
                         setManualItems([...manualItems, ...newItems]);
                     }
                     alert(`Đã đọc ${newItems.length} dòng từ file Excel`);
                } else {
                    alert('File không có dữ liệu hoặc không tìm thấy mã thuốc nào khớp.');
                }
            } catch (error: any) {
                alert('Lỗi đọc file: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
                e.target.value = '';
            }
        }
    };

    const onDownloadSample = async () => {
        try {
            await downloadSample();
        } catch (error) {
            alert('Lỗi tải file mẫu');
        }
    };

    // ... Manual Handlers ...
    const addManualItem = () => {
        setManualItems([...manualItems, { product_id: '', product_name: '', product_code: '', batch_code: '', expiry_date: '', quantity: 1, price: 0, vat: 0, discount: 0 }]);
    };

    const removeManualItem = (index: number) => {
        const newItems = [...manualItems];
        newItems.splice(index, 1);
        setManualItems(newItems);
    };

    const updateManualItem = (index: number, field: string, value: any) => {
        const newItems = [...manualItems];
        newItems[index][field] = value;
        setManualItems(newItems);
    };

    const handleProductSelect = (index: number, product: Product) => {
        const newItems = [...manualItems];
        newItems[index].product_id = product.id;
        newItems[index].product_name = product.name;
        newItems[index].product_code = product.code;
        newItems[index].price = product.price || 0; 
        setManualItems(newItems);
    };

    const handleManualSubmit = async () => {
        if (!selectedWarehouse) {
            alert('Vui lòng chọn kho');
            return;
        }
        if (manualItems.some(i => !i.product_id || !i.batch_code || !i.expiry_date || i.quantity <= 0)) {
            alert('Vui lòng điền đầy đủ thông tin chi tiết (Thuốc, Lô, HSD, SL > 0)');
            return;
        }

        setLoading(true);
        try {
            if (importMode === 'OPENING_STOCK') {
                await createOpeningStockManual({
                    warehouse_id: selectedWarehouse,
                    code: manualCode,
                    items: manualItems
                });
            } else {
                if (!selectedSupplier) {
                    alert('Vui lòng chọn nhà cung cấp');
                    setLoading(false);
                    return;
                }
                await createImportNote({
                    warehouse_id: selectedWarehouse,
                    supplier_id: selectedSupplier,
                    code: manualCode,
                    items: manualItems,
                    description: `Nhập hàng từ NCC`
                });
            }
            alert('Tạo phiếu nhập thành công!');
            setManualItems([{ product_id: '', product_name: '', product_code: '', batch_code: '', expiry_date: '', quantity: 1, price: 0 }]);
            setManualCode(generateCode());
        } catch (error: any) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {importMode === 'SUPPLIER' ? 'Nhập Từ Nhà Cung Cấp' : 'Nhập Tồn Đầu Kỳ'}
                        </h1>
                        <div className="flex border-b border-gray-200 mt-4">
                            <button
                                onClick={() => setImportMode('SUPPLIER')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                                    importMode === 'SUPPLIER'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Nhập từ nhà cung cấp
                            </button>
                            <button
                                onClick={() => setImportMode('OPENING_STOCK')}
                                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                                    importMode === 'OPENING_STOCK'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Nhập tồn đầu
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onDownloadSample}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Download size={18} />
                            Tải file mẫu
                        </button>
                        
                        <input 
                            type="file" 
                            id="excel-upload" 
                            className="hidden" 
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileParse}
                        />
                        <label 
                            htmlFor="excel-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer shadow-sm transition-colors text-sm font-medium ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <FileUp size={18} />
                            {loading ? 'Đang đọc...' : 'Nhập từ Excel'}
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mã phiếu</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 text-sm" 
                                value={manualCode} 
                                onChange={(e) => setManualCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày lập</label>
                            <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kho nhập</label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                            >
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        {importMode === 'SUPPLIER' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                >
                                    <option value="">-- Chọn Nhà cung cấp --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    {/* ... Rest of existing table code ... */}

                    {/* Details Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Chi tiết phiếu nhập</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-3 border">#</th>
                                        <th className="p-3 border min-w-[200px]">Tên hàng hóa</th>
                                        <th className="p-3 border w-32">Số lô</th>
                                        <th className="p-3 border w-32">Hạn dùng</th>
                                        <th className="p-3 border w-24">Số lượng</th>
                                        <th className="p-3 border w-32">Đơn giá</th>
                                        <th className="p-3 border w-20">VAT %</th>
                                        <th className="p-3 border w-28">CK (VNĐ)</th>
                                        <th className="p-3 border w-32">Thành tiền</th>
                                        <th className="p-3 border w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manualItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-2 border text-center">{index + 1}</td>
                                            <td className="p-2 border">
                                                <ProductSearchSelect 
                                                    value={item.product_id}
                                                    initialDisplayName={item.product_id ? (item.product_name ? `${item.product_name} (${item.product_code || ''})` : 'Đã chọn thuốc') : ''}
                                                    onSelect={(p) => handleProductSelect(index, p)}
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={item.batch_code}
                                                    onChange={(e) => updateManualItem(index, 'batch_code', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="date" 
                                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                                    value={item.expiry_date}
                                                    onChange={(e) => updateManualItem(index, 'expiry_date', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                    value={item.quantity}
                                                    onChange={(e) => updateManualItem(index, 'quantity', parseInt(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                    value={item.price}
                                                    onChange={(e) => updateManualItem(index, 'price', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    max="100"
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                    placeholder="0"
                                                    value={item.vat}
                                                    onChange={(e) => updateManualItem(index, 'vat', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-right"
                                                    placeholder="0"
                                                    value={item.discount}
                                                    onChange={(e) => updateManualItem(index, 'discount', parseFloat(e.target.value))}
                                                />
                                            </td>
                                            <td className="p-2 border text-right font-medium text-gray-700">
                                                {(item.quantity * item.price * (1 + (item.vat || 0)/100) - (item.discount || 0)).toLocaleString()}
                                            </td>
                                            <td className="p-2 border text-center">
                                                <button onClick={() => removeManualItem(index)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <button onClick={addManualItem} className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800">
                                <Plus size={18} /> Thêm dòng
                            </button>
                            <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                    Tổng tiền: {manualItems.reduce((sum, item) => sum + (item.quantity * item.price * (1 + (item.vat || 0)/100) - (item.discount || 0)), 0).toLocaleString()} VND
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                         <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</button>
                         <button 
                            onClick={handleManualSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                         >
                            <Save size={20} />
                            {loading ? 'Đang xử lý...' : 'Lưu phiếu nhập'}
                         </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InventoryImportPage;
