import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  useEffect(() => {
    fetchProducts();
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;

    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      if (err.response?.status === 403) {
        alert('У вас нет прав для удаления товаров');
      } else {
        alert('Ошибка при удалении');
      }
    }
  };

  const containerStyle = {
    padding: '20px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
    backgroundColor: '#f0f0f0'
  };

  const buttonStyle = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px'
  };

  const errorStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  };

  const canManage = userRole === 'seller' || userRole === 'admin';

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={containerStyle}>
      <h2>Товары</h2>

      {error && <div style={errorStyle}>{error}</div>}

      <div style={gridStyle}>
        {products.map(product => (
          <div key={product.id} style={cardStyle}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} style={imageStyle} />
            ) : (
              <div style={{ ...imageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
                📷 Нет изображения
              </div>
            )}
            <h3 style={{ margin: '10px 0' }}>{product.title}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>{product.category}</p>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#888' }}>
              {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
            </p>
            <p style={{ margin: '10px 0', fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>
              {product.price.toLocaleString()} ₽
            </p>
            <div>
              <Link to={`/products/${product.id}`}>
                <button style={{ ...buttonStyle, backgroundColor: '#3498db', color: 'white' }}>
                  Просмотр
                </button>
              </Link>

              {canManage && (
                <Link to={`/products/${product.id}/edit`}>
                  <button style={{ ...buttonStyle, backgroundColor: '#f39c12', color: 'white' }}>
                    Редактировать
                  </button>
                </Link>
              )}

              {userRole === 'admin' && (
                <button
                  onClick={() => handleDelete(product.id)}
                  style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: 'white' }}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Нет товаров.
          {canManage && (
            <Link to="/products/new">Добавить первый товар</Link>
          )}
        </p>
      )}
    </div>
  );
}

export default Products;