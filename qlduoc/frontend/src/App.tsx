import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProductListPage from './modules/products/pages/ProductListPage';
import ProductCreatePage from './modules/products/pages/ProductCreatePage';
import WarehouseListPage from './modules/warehouses/pages/WarehouseListPage';
import InventoryImportPage from './modules/inventory/pages/InventoryImportPage';
import InventoryRequestPage from './modules/inventory/pages/InventoryRequestPage';
import InventoryExportCreatePage from './modules/inventory/pages/InventoryExportCreatePage';

// Simple Auth Guard
interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/products" replace /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductListPage /></ProtectedRoute>} />
        <Route path="/products/create" element={<ProtectedRoute><ProductCreatePage /></ProtectedRoute>} />
        <Route path="/products/edit/:id" element={<ProtectedRoute><ProductCreatePage /></ProtectedRoute>} />
        
        <Route path="/warehouses" element={<ProtectedRoute><WarehouseListPage /></ProtectedRoute>} />
        <Route path="/inventory/import" element={<ProtectedRoute><InventoryImportPage /></ProtectedRoute>} />
        <Route path="/inventory/requests" element={<ProtectedRoute><InventoryRequestPage /></ProtectedRoute>} />
        <Route path="/inventory/export/create" element={<ProtectedRoute><InventoryExportCreatePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
