import api from '../../../api/axios';

export interface Supplier {
    id: string;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_code?: string;
}

export const getSuppliers = async (search?: string) => {
    const response = await api.get('/suppliers', { params: { search } });
    return response.data;
};

export const createSupplier = async (supplier: Partial<Supplier>) => {
    const response = await api.post('/suppliers', supplier);
    return response.data;
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
};

export const deleteSupplier = async (id: string) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
};
