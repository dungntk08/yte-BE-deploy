import api from '../../../api/axios';
import { Product } from '../models/Product';

export const getProducts = async (page = 1, search = '') => {
    const response = await api.get(`/products?page=${page}&search=${search}`);
    return response.data;
};

export const getProductById = async (id: number | string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async (product: Product) => {
    const response = await api.post('/products', product);
    return response.data;
};

export const updateProduct = async (id: number | string, product: Product) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    await api.delete(`/products/${id}`);
};

export const exportProducts = async () => {
    const response = await api.get('/products/export', {
        responseType: 'blob',
    });
    return response.data;
};

export const importProducts = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
