import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import TableHeader from '../../../components/common/Table/TableHeader';
import Pagination from '../../../components/common/Table/Pagination';
import SearchBar from '../../../components/common/Search/SearchBar';
import { getProducts, exportProducts } from '../services/productService';
import { Product } from '../models/Product';
import { Edit, Plus, Download, Upload } from 'lucide-react';
import ProductImportModal from '../components/ProductImportModal';
import ProductDetailModal from '../components/ProductDetailModal';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | string | null>(null);
  const [activeTabId, setActiveTabId] = useState<number>(1);
  // const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage, search, activeTabId]); // Re-fetch on page, search or tab change

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProducts(currentPage, search, activeTabId);
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



  return (
    <DashboardLayout>
      {showImportModal && (
        <ProductImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchData(); // Re-fetch data after successful import
          }}
        />
      )}

      {showDetailModal && (
        <ProductDetailModal
          typeId={activeTabId}
          initialProductId={selectedProductId}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProductId(null);
          }}
          onSuccess={() => {
            // setShowDetailModal(false); // Can keep open if needed, or close
            fetchData();
          }}
        />
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách Sản phẩm</h1>
          <p className="text-gray-500 mt-1">Quản lý kho thuốc và vật tư y tế</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={20} />
            <span>Nhập Excel</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={20} />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => {
              setSelectedProductId(null);
              setShowDetailModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Thêm mới / Chi tiết</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar (original, now potentially redundant with new filter search) */}
        <div className="flex border-b border-gray-200 bg-white px-4">
          {[
            { id: 1, label: 'Thuốc' },
            { id: 2, label: 'Vật tư y tế' },
            { id: 3, label: 'Vắc xin' },
            { id: 5, label: 'Hoá chất' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTabId(tab.id); setCurrentPage(1); }}
              className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTabId === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <SearchBar value={search} onChange={handleSearch} placeholder="Tìm kiếm theo tên hoặc mã..." />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <TableHeader columns={[
              { key: 'Index', label: 'STT', width: '50px', align: 'center' },
              { key: 'Code', label: 'Mã dược', width: '10%' },
              { key: 'Name', label: 'Tên Thuốc, VTYT, Vắc xin, Dung môi' },
              { key: 'ActiveIngredient', label: 'Hoạt chất' },
              { key: 'Unit', label: 'ĐVT', width: '80px' },
              { key: 'RegistrationNumber', label: 'Số đăng ký', width: '120px' },
              { key: 'PharmacyType', label: 'Loại vật tư', width: '120px' }, // Displaying PharmacyType here based on request context? Or ProductType? Let's use PharmacyType from medicine data
              { key: 'PharmacyGroup', label: 'Nhóm dược' },
              { key: 'PharmacyCategory', label: 'Loại dược' },
              { key: 'IsActive', label: 'Hoạt động', align: 'center', width: '80px' },
              { key: 'Actions', label: 'Thao tác', align: 'center', width: '100px' },
            ]} />
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">Đang tải...</td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product, index) => (
                  <tr
                    key={product.Id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onDoubleClick={() => {
                      setSelectedProductId(product.Id);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-2 py-4 text-center text-gray-500">{(currentPage - 1) * 20 + index + 1}</td>
                    <td className="px-4 py-4 font-medium text-gray-900">{product.Code || '---'}</td>
                    <td className="px-4 py-4 text-gray-900">
                      <div className='font-medium'>{product.Name}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 max-w-xs truncate">{product.medicine?.ActiveIngredientName}</td>
                    <td className="px-4 py-4 text-gray-600">{product.UnitName}</td>
                    <td className="px-4 py-4 text-gray-600">{product.medicine?.RegistrationNumber}</td>
                    <td className="px-4 py-4 text-gray-600">{product.medicine?.PharmacyType}</td>
                    <td className="px-4 py-4 text-gray-600">{product.medicine?.PharmacyGroup}</td>
                    <td className="px-4 py-4 text-gray-600">{product.medicine?.PharmacyCategory}</td>
                    <td className="px-4 py-4 text-center">
                      {product.IsActive ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-400">test</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" onClick={() => {
                          setSelectedProductId(product.Id);
                          setShowDetailModal(true);
                        }}>
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">Chưa có sản phẩm nào.</td>
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
