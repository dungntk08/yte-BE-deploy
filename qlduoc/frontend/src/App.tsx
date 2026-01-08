import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProductListPage from './modules/products/pages/ProductListPage';
import ProductCreatePage from './modules/products/pages/ProductCreatePage';
import WarehouseListPage from './modules/warehouses/pages/WarehouseListPage';
import ImportManagementPage from './modules/inventory/pages/ImportManagementPage';
import ExportManagementPage from './modules/inventory/pages/ExportManagementPage';
import RequestManagementPage from './modules/inventory/pages/RequestManagementPage';
import InventoryExportCreatePage from './modules/inventory/pages/InventoryExportCreatePage';
import InternalExportCreatePage from './modules/inventory/pages/InternalExportCreatePage';
import SupplierListPage from './modules/suppliers/pages/SupplierListPage';
// import UnitManagementPage from './modules/units/pages/UnitManagementPage';
import StockAlertsPage from './modules/inventory/pages/StockAlertsPage';
import InventoryStockPage from './modules/inventory/pages/InventoryStockPage';
import UserListPage from './modules/users/pages/UserListPage';
import InventoryCheckReportPage from './modules/reports/pages/InventoryCheckReportPage';
import DashboardPage from './modules/dashboard/pages/DashboardPage';
import MedicalCenterManagementPage from './modules/admin/pages/MedicalCenterManagementPage';
import AdminLoginPage from './modules/admin/pages/AdminLoginPage';

// Simple Auth Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Auth Guard
const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Component to check auth on startup
const AuthInitializer = () => {
  const token = localStorage.getItem('token');
  React.useEffect(() => {
    if (token) {
      // Check if token is valid
      import('./api/axios').then(module => {
        const api = module.default;
        api.get('/user').catch(() => {
          // 401 interceptor handles clean up
          // But we can also force it here if needed
        });
      });
    }
  }, [token]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Admin Management */}
        <Route path="/admin/medical-centers" element={<AdminRoute><MedicalCenterManagementPage /></AdminRoute>} />

        <Route path="/products" element={<ProtectedRoute><ProductListPage /></ProtectedRoute>} />
        <Route path="/products/create" element={<ProtectedRoute><ProductCreatePage /></ProtectedRoute>} />
        <Route path="/products/edit/:id" element={<ProtectedRoute><ProductCreatePage /></ProtectedRoute>} />

        <Route path="/warehouses" element={<ProtectedRoute><WarehouseListPage /></ProtectedRoute>} />
        <Route path="/inventory/import" element={<ProtectedRoute><ImportManagementPage /></ProtectedRoute>} />
        <Route path="/inventory/export" element={<ProtectedRoute><ExportManagementPage /></ProtectedRoute>} />
        <Route path="/inventory/requests" element={<ProtectedRoute><RequestManagementPage /></ProtectedRoute>} />
        <Route path="/inventory/alerts" element={<ProtectedRoute><StockAlertsPage /></ProtectedRoute>} />
        <Route path="/inventory/export/create" element={<ProtectedRoute><InventoryExportCreatePage /></ProtectedRoute>} />
        <Route path="/inventory/export/internal/create" element={<ProtectedRoute><InternalExportCreatePage /></ProtectedRoute>} />
        <Route path="/inventory/stock" element={<ProtectedRoute><InventoryStockPage /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><SupplierListPage /></ProtectedRoute>} />
        {/* <Route path="/units" element={<ProtectedRoute><UnitManagementPage /></ProtectedRoute>} /> */}
        <Route path="/users" element={<ProtectedRoute><UserListPage /></ProtectedRoute>} />
        <Route path="/reports/inventory-check" element={<ProtectedRoute><InventoryCheckReportPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
