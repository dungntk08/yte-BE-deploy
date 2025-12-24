import api from '../../../api/axios';

export const importOpeningStock = async (warehouseId: string, file: File) => {
    const formData = new FormData();
    formData.append('warehouse_id', warehouseId);
    formData.append('file', file);

    const response = await api.post('/inventory/opening-stock', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Manual Import from Supplier
export const createImportNote = async (data: any) => {
    const response = await api.post('/inventory/import-supplier', data);
    return response.data;
};

export const createOpeningStockManual = async (data: any) => {
    const response = await api.post('/inventory/opening-stock/manual', data);
    return response.data;
};

export const parseOpeningStock = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/inventory/opening-stock/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const downloadSample = async () => {
    const response = await api.get('/inventory/opening-stock/sample', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_nhap_ton_dau.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};
