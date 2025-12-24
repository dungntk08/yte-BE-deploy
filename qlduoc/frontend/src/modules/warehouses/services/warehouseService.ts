import api from '../../../api/axios';
import { Warehouse } from '../models/Warehouse';

export const getWarehouses = async () => {
    const response = await api.get('/warehouses');
    return response.data;
};

export const createWarehouse = async (data: Partial<Warehouse>) => {
    const response = await api.post('/warehouses', data);
    return response.data;
};

export const updateWarehouse = async (id: string, data: Partial<Warehouse>) => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
};

export const deleteWarehouse = async (id: string) => {
    await api.delete(`/warehouses/${id}`);
};

// Permission / User Management
export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const getWarehouseUsers = async (warehouseId: string) => {
    const response = await api.get(`/warehouses/${warehouseId}/users`);
    return response.data;
};

export const assignUserToWarehouse = async (warehouseId: string, userId: string) => {
    const response = await api.post(`/warehouses/${warehouseId}/users`, { user_id: userId });
    return response.data;
};

export const removeUserFromWarehouse = async (warehouseId: string, userId: string) => {
    await api.delete(`/warehouses/${warehouseId}/users/${userId}`);
};
