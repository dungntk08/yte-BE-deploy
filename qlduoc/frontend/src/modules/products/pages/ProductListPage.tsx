import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import TableHeader from '../../../components/common/Table/TableHeader';
import Pagination from '../../../components/common/Table/Pagination';
import SearchBar from '../../../components/common/Search/SearchBar';
import { getProducts, deleteProduct, exportProducts, importProducts } from '../services/productService';
import { Product } from '../models/Product';
import { Edit, Trash2, Plus, Download, Upload, FileUp } from 'lucide-react';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage, search]); // Re-fetch on page or search change

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProducts(currentPage, search);
      setProducts(data.data);
      setTotalPages(data.last_page);
      
      // Reset page to 1 if search changes and current page > 1 (optional logic, kept simple here)
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
       if (error.response?.status === 403) {
          alert('Bạn không có quyền xem danh sách sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
      setSearch(value);
      setCurrentPage(1); // Reset to page 1 on search
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
      try {
          await deleteProduct(id);
          fetchData();
          alert('Xóa thành công');
      } catch (error: any) {
          alert(error.response?.data?.message || 'Xóa thất bại');
      }
  };

  const handleExport = async () => {
    try {
        const response = await exportProducts();
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `products_${new Date().toISOString().slice(0, 10)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Export failed:', error);
        alert('Xuất file thất bại');
    }
  };

  const handleImportClick = () => {
    const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
    if (fileInput) {
        fileInput.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        await importProducts(file);
        alert('Import thành công!');
        fetchData();
    } catch (error: any) {
        console.error('Import failed:', error);
        alert('Import thất bại: ' + (error.response?.data?.message || 'Lỗi không xác định'));
    } finally {
        event.target.value = ''; // Reset input
    }
  };

  const columns = [
      { key: 'code', label: 'Mã', width: '10%' },
      { key: 'name', label: 'Tên biệt dược' },
      { key: 'active_ingredient', label: 'Hoạt chất' },
      { key: 'unit', label: 'ĐVT', width: '10%' },
      { key: 'stock', label: 'Tồn kho', align: 'right' as const, width: '10%' },
      { key: 'price', label: 'Giá bán', align: 'right' as const, width: '15%' },
      { key: 'actions', label: 'Thao tác', align: 'center' as const, width: '10%' },
  ];

  return (
    <DashboardLayout>
      <input 
        type="file" 
        id="import-file-input" 
        style={{ display: 'none' }} 
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
      />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Sản phẩm</h1>
          <p className="text-gray-500 mt-1">Quản lý kho thuốc và vật tư y tế</p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
                <Download size={20} />
                Export Excel
            </button>
            <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Upload size={20} />
                Import Excel
            </button>
            <Link 
              to="/products/create" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Thêm mới
            </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <SearchBar value={search} onChange={handleSearch} placeholder="Tìm kiếm theo tên hoặc mã..." />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <TableHeader columns={columns} />
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                    <td colSpan={columns.length} className="text-center py-4">Đang tải...</td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{product.code || '---'}</td>
                    <td className="px-6 py-4 text-gray-900">
                        <div className='font-medium'>{product.name}</div>
                        <div className='text-xs text-gray-500'>{product.registration_number}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.active_ingredient}</td>
                    <td className="px-6 py-4 text-gray-600">{product.unit}</td>
                    <td className={`px-6 py-4 text-right font-medium ${(product.stock || 0) <= product.min_stock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock}
                    </td>
                    <td className="px-6 py-4 text-right">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" onClick={() => navigate(`/products/edit/${product.id}`)}>
                            <Edit size={16} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(product.id!)}>
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-500">Chưa có sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
        />
      </div>
    </DashboardLayout>
  );
};

export default ProductListPage;
