import React, { useState, useEffect, useRef } from 'react';
import { Printer, Plus, Trash2, FileText, RefreshCw, Download, ChevronDown, Check, X } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import api from '../../../api/axios';
import { getWarehouses } from '../../warehouses/services/warehouseService';
import * as XLSX from 'xlsx';

const InventoryCheckReportPage: React.FC = () => {
    // Filters
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [warehouseIds, setWarehouseIds] = useState<string[]>([]);
    const [fromDate, setFromDate] = useState('2026-01-01');
    const [toDate, setToDate] = useState('2026-01-31');
    const [reportType, setReportType] = useState('no-liquidate');

    // UI State
    const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // Council
    const [council, setCouncil] = useState([{ name: '', position: '' }, { name: '', position: '' }]);

    // Data
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        fetchWarehouses();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsWarehouseDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchWarehouses = async () => {
        const data = await getWarehouses();
        setWarehouses(data);
        if (data.length > 0) setWarehouseIds([String(data[0].Id)]);
    };

    const fetchReport = async () => {
        if (warehouseIds.length === 0) {
            alert('Vui lòng chọn ít nhất một kho');
            return;
        }
        setLoading(true);
        try {
            const response = await api.get('/reports/inventory-check', {
                params: {
                    warehouse_ids: warehouseIds,
                    date: toDate
                }
            });
            setReportData(response.data);
        } catch (error) {
            console.error(error);
            alert('Lỗi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const getPdfUrl = () => {
        const baseUrl = api.defaults.baseURL || 'http://localhost:8000/api';
        const params = new URLSearchParams();
        warehouseIds.forEach(id => params.append('warehouse_ids', id));
        params.append('date', toDate);
        params.append('fromDate', fromDate);
        council.forEach((c, i) => {
            params.append(`council[${i}][name]`, c.name);
            params.append(`council[${i}][position]`, c.position);
        });
        return `${baseUrl}/reports/inventory-check/pdf?${params.toString()}`;
    };

    const handleExportExcel = () => {
        if (!reportData || !reportData.items) return;

        const ws_data = [];

        // Header
        const warehouseName = reportData.warehouse?.Name || '';
        ws_data.push(["Kho:", warehouseName]);
        ws_data.push(["Tổ kiểm kê gồm có:"]);
        council.forEach((c, i) => {
            ws_data.push(["", `${i + 1}. ${c.name}`, "", "Chức vụ:", c.position]);
        });
        ws_data.push([]);
        ws_data.push(["Đã kiểm kê tại: Trạm y tế phường Bồ Đề 01218", "", "", "", "từ giờ......ngày......tháng......năm...... đến giờ......ngày......tháng......năm......"]);
        ws_data.push(["Kết quả như sau:"]);
        ws_data.push([]);

        // Table Header
        ws_data.push([
            "STT", "Tên nhãn hiệu, quy cách phẩm chất", "ĐVT", "Nước sản xuất", "Lô sản xuất", "Hạn dùng", "Số lượng", "", "Đơn giá", "Thành tiền", "Ghi chú"
        ]);
        ws_data.push([
            "", "", "", "", "", "", "Sổ sách", "Thực tế", "", "", ""
        ]);

        const headerR1Index = ws_data.length - 2;
        const headerR2Index = ws_data.length - 1;

        reportData.items.forEach((item: any, idx: number) => {
            ws_data.push([
                idx + 1, item.product_name, item.unit, item.country, item.batch_number, item.expiry_date,
                item.book_quantity, "", item.unit_price, item.total_amount, ""
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Merges
        ws['!merges'] = [
            { s: { r: headerR1Index, c: 6 }, e: { r: headerR1Index, c: 7 } },
            { s: { r: headerR1Index, c: 0 }, e: { r: headerR2Index, c: 0 } },
            { s: { r: headerR1Index, c: 1 }, e: { r: headerR2Index, c: 1 } },
            { s: { r: headerR1Index, c: 2 }, e: { r: headerR2Index, c: 2 } },
            { s: { r: headerR1Index, c: 3 }, e: { r: headerR2Index, c: 3 } },
            { s: { r: headerR1Index, c: 4 }, e: { r: headerR2Index, c: 4 } },
            { s: { r: headerR1Index, c: 5 }, e: { r: headerR2Index, c: 5 } },
            { s: { r: headerR1Index, c: 8 }, e: { r: headerR2Index, c: 8 } },
            { s: { r: headerR1Index, c: 9 }, e: { r: headerR2Index, c: 9 } },
            { s: { r: headerR1Index, c: 10 }, e: { r: headerR2Index, c: 10 } },
        ];

        ws['!cols'] = [
            { wch: 5 }, { wch: 30 }, { wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
        ];

        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}_${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}`;
        const typeStr = reportType === 'liquidate' ? 'mau-thanh-ly' : 'mau-khong-thanh-ly';
        const fileName = `bien-ban-kiem-ke-duoc-${typeStr}_${dateStr}.xlsx`;

        XLSX.writeFile(XLSX.utils.book_new(), fileName); // Just init
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Baocao");
        XLSX.writeFile(wb, fileName);
    };

    const addCouncilMember = () => {
        setCouncil([...council, { name: '', position: '' }]);
    };

    const removeCouncilMember = (idx: number) => {
        const newCouncil = [...council];
        newCouncil.splice(idx, 1);
        setCouncil(newCouncil);
    };

    const updateCouncil = (idx: number, field: string, value: string) => {
        const newCouncil = [...council];
        // @ts-ignore
        newCouncil[idx][field] = value;
        setCouncil(newCouncil);
    };

    const toggleWarehouseSelection = (id: string) => {
        if (warehouseIds.includes(id)) {
            setWarehouseIds(warehouseIds.filter(x => x !== id));
        } else {
            setWarehouseIds([...warehouseIds, id]);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                        <FileText /> Biên bản kiểm kê dược
                    </h1>
                </div>

                {/* Filters Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian (Từ ngày)</label>
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày (Chốt số liệu)</label>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Kho kiểm kê</label>
                            <button
                                onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
                                className="w-full border rounded px-3 py-2 text-sm bg-white flex justify-between items-center"
                            >
                                <span className="truncate">
                                    {warehouseIds.length === 0 ? 'Chọn kho...' :
                                        warehouseIds.length === warehouses.length ? 'Tất cả kho' :
                                            `${warehouseIds.length} kho đã chọn`}
                                </span>
                                <ChevronDown size={16} className="text-gray-500" />
                            </button>
                            {isWarehouseDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {warehouses.map(w => (
                                        <div
                                            key={w.Id}
                                            onClick={() => toggleWarehouseSelection(String(w.Id))}
                                            className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-b last:border-0"
                                        >
                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${warehouseIds.includes(String(w.Id)) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                {warehouseIds.includes(String(w.Id)) && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className="text-sm">{w.Name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mẫu báo cáo</label>
                            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                                <option value="no-liquidate">Mẫu không thanh lý</option>
                                <option value="liquidate">Mẫu thanh lý</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-bold text-gray-700">Hội đồng kiểm kê</h3>
                            <button onClick={addCouncilMember} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Plus size={16} /></button>
                        </div>
                        {council.map((c, idx) => (
                            <div key={idx} className="flex gap-4 mb-2 items-center">
                                <span className="text-sm text-gray-500 w-6 italic">{idx + 1}.</span>
                                <div className="flex items-center gap-2 flex-1">
                                    <label className="text-xs text-gray-600 whitespace-nowrap">Ông/Bà:</label>
                                    <input placeholder="Nhập tên..." value={c.name} onChange={e => updateCouncil(idx, 'name', e.target.value)} className="flex-1 border rounded px-3 py-1.5 text-sm" />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <label className="text-xs text-gray-600 whitespace-nowrap">Chức danh:</label>
                                    <input placeholder="Nhập chức danh..." value={c.position} onChange={e => updateCouncil(idx, 'position', e.target.value)} className="flex-1 border rounded px-3 py-1.5 text-sm" />
                                </div>
                                <button onClick={() => removeCouncilMember(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2 gap-3">
                        <button onClick={fetchReport} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold">
                            <RefreshCw size={18} /> Xem báo cáo
                        </button>
                        <button
                            onClick={() => {
                                if (warehouseIds.length === 0) return alert('Vui lòng chọn kho');
                                setShowPreviewModal(true);
                            }}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 shadow-sm font-medium"
                        >
                            <Printer size={18} /> In biên bản
                        </button>
                    </div>
                </div>

                {/* On-Page Preview (HTML) - Fixed table structure for hydration cleanliness */}
                <div className="bg-gray-50 p-8 border rounded-xl overflow-auto max-h-[800px]">
                    {!reportData ? (
                        <div className="text-center text-gray-500">Chưa có dữ liệu báo cáo</div>
                    ) : (
                        <div className="max-w-[210mm] mx-auto bg-white text-black font-serif text-sm leading-relaxed p-8 shadow">
                            {/* Header */}
                            <div className="flex justify-between mb-6">
                                <div>
                                    <div className="font-bold">Trạm Y tế phường Bồ Đề</div>
                                    <div>Trạm y tế phường Bồ Đề 01218</div>
                                </div>
                                <div className="text-center">
                                    <h1 className="font-bold text-xl uppercase">BIÊN BẢN KIỂM KÊ</h1>
                                    <div className="italic">Từ ngày {fromDate.split('-').reverse().join('/')} đến ngày {toDate.split('-').reverse().join('/')}</div>
                                </div>
                                <div className="w-1/3"></div>
                            </div>

                            <div className="mb-4">
                                <div><span className="font-bold">Kho:</span> {reportData.warehouse?.Name}</div>
                                <div className="font-bold mt-2">Tổ kiểm kê gồm có:</div>
                                <ol className="list-decimal pl-8 mt-1">
                                    {council.map((c, i) => (
                                        <li key={i} className="mb-1">
                                            <span className="inline-block w-64">{c.name}</span>
                                            <span className="font-bold">Chức vụ:</span> {c.position}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="mb-4">
                                <div>Đã kiểm kê tại: Trạm y tế phường Bồ Đề 01218</div>
                                <div className="italic text-right">từ giờ......ngày......tháng......năm...... đến giờ......ngày......tháng......năm......</div>
                                <div className="font-bold mt-2">Kết quả như sau:</div>
                            </div>

                            <table className="w-full border-collapse border border-black text-xs">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-1 text-center w-10" rowSpan={2}>STT</th>
                                        <th className="border border-black p-1 text-left" rowSpan={2}>Tên nhãn hiệu, quy cách phẩm chất</th>
                                        <th className="border border-black p-1 text-center w-16" rowSpan={2}>ĐVT</th>
                                        <th className="border border-black p-1 text-center w-24" rowSpan={2}>Nước sản xuất</th>
                                        <th className="border border-black p-1 text-center w-24" rowSpan={2}>Lô sản xuất</th>
                                        <th className="border border-black p-1 text-center w-24" rowSpan={2}>Hạn dùng</th>
                                        <th className="border border-black p-1 text-center" colSpan={2}>Số lượng</th>
                                        <th className="border border-black p-1 text-right w-24" rowSpan={2}>Đơn giá</th>
                                        <th className="border border-black p-1 text-right w-24" rowSpan={2}>Thành tiền</th>
                                        <th className="border border-black p-1 text-center w-20" rowSpan={2}>Ghi chú</th>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-1 text-center w-16">Sổ sách</th>
                                        <th className="border border-black p-1 text-center w-16">Thực tế</th>
                                    </tr>
                                    <tr>
                                        {[...Array(11)].map((_, i) => (
                                            <th key={i} className="border border-black p-1 text-center italic font-normal">{['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4', '5', '6'][i] || i + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.items?.length > 0 ? (
                                        reportData.items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                                <td className="border border-black p-1 font-semibold">{item.product_name}</td>
                                                <td className="border border-black p-1 text-center">{item.unit}</td>
                                                <td className="border border-black p-1 text-center">{item.country}</td>
                                                <td className="border border-black p-1 text-center">{item.batch_number}</td>
                                                <td className="border border-black p-1 text-center">{item.expiry_date}</td>
                                                <td className="border border-black p-1 text-right font-bold">{formatCurrency(item.book_quantity)}</td>
                                                <td className="border border-black p-1 text-right"></td>
                                                <td className="border border-black p-1 text-right">{formatCurrency(item.unit_price)}</td>
                                                <td className="border border-black p-1 text-right">{formatCurrency(item.total_amount)}</td>
                                                <td className="border border-black p-1"></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={11} className="border border-black p-4 text-center">Không có dữ liệu</td></tr>
                                    )}
                                    {reportData.items?.length > 0 && (
                                        <tr className="font-bold">
                                            <td colSpan={9} className="border border-black p-1 text-right">Tổng cộng:</td>
                                            <td className="border border-black p-1 text-right">
                                                {formatCurrency(reportData.items.reduce((sum: number, item: any) => sum + item.total_amount, 0))}
                                            </td>
                                            <td className="border border-black p-1"></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="mt-8 grid grid-cols-2 gap-8 text-center">
                                <div>
                                    <div className="font-bold">Thư Ký</div>
                                    <div className="mt-16">(Ký, họ tên)</div>
                                </div>
                                <div>
                                    <div className="italic mb-1">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                                    <div className="font-bold">Trưởng Ban</div>
                                    <div className="mt-16">(Ký, họ tên, đóng dấu)</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-50 flex flex-col bg-gray-100">
                    <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 uppercase">
                            IN BIÊN BẢN KIỂM KÊ DƯỢC {reportType === 'liquidate' ? 'MẪU THANH LÝ' : 'MẪU KHÔNG THANH LÝ'}
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                            >
                                <X size={18} /> Đóng
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 font-medium"
                            >
                                <Download size={18} /> Xuất Excel
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-0 overflow-hidden bg-gray-500">
                        <iframe
                            src={getPdfUrl()}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                        />
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InventoryCheckReportPage;
