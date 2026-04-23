import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import ProductForm from './components/ProductForm';
import Users from './components/Users';

// Защищенный маршрут
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Маршрут только для админа
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/products" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/products" replace />
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />

            <Route path="/products/new" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />

            <Route path="/products/:id" element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } />

            <Route path="/products/:id/edit" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />

            <Route path="/users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;