import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
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
      alert('Ошибка при удалении');
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={containerStyle}>
      <h2>Товары</h2>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      <div style={gridStyle}>
        {products.map(product => (
          <div key={product.id} style={cardStyle}>
            <h3 style={{ margin: '0 0 10px 0' }}>{product.title}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>{product.category}</p>
            <p style={{ margin: '5px 0' }}>{product.description}</p>
            <p style={{ margin: '10px 0', fontSize: '18px', fontWeight: 'bold' }}>
              {product.price.toLocaleString()} ₽
            </p>
            <div>
              <Link to={`/products/${product.id}`}>
                <button style={{...buttonStyle, backgroundColor: '#3498db', color: 'white'}}>
                  Просмотр
                </button>
              </Link>
              <Link to={`/products/${product.id}/edit`}>
                <button style={{...buttonStyle, backgroundColor: '#f39c12', color: 'white'}}>
                  Редактировать
                </button>
              </Link>
              <button
                onClick={() => handleDelete(product.id)}
                style={{...buttonStyle, backgroundColor: '#e74c3c', color: 'white'}}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && !loading && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          Нет товаров. <Link to="/products/new">Добавить первый товар</Link>
        </p>
      )}
    </div>
  );
}

export default Products;
