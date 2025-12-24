import api from '../../../api/axios';

export interface InventoryRequest {
    id: string;
    code: string;
    request_warehouse_id: string;
    supply_warehouse_id: string;
    created_by: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    description: string;
    created_at: string;
    request_warehouse?: { id: string; name: string };
    supply_warehouse?: { id: string; name: string };
    creator?: { id: string; name: string };
    details?: InventoryRequestDetail[];
}

export interface InventoryRequestDetail {
    id: string;
    product_id: string;
    quantity: number;
    unit?: string;
    product?: { id: string; name: string; code: string };
}

export const getInventoryRequests = async (type: 'sent' | 'received'): Promise<any> => {
    const response = await api.get('/inventory-requests', { params: { type } });
    return response.data;
};

export const createInventoryRequest = async (data: any): Promise<InventoryRequest> => {
    const response = await api.post('/inventory-requests', data);
    return response.data;
};

export const updateInventoryRequestStatus = async (id: string, status: string): Promise<InventoryRequest> => {
    const response = await api.put(`/inventory-requests/${id}/status`, { status });
    return response.data;
};

export const getInventoryRequestDetail = async (id: string): Promise<InventoryRequest> => {
    const response = await api.get(`/inventory-requests/${id}`);
    return response.data;
};
