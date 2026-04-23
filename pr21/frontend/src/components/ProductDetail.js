import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  useEffect(() => {
    fetchProduct();
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.getProduct(id);
      setProduct(response.data);
    } catch (err) {
      setError('Товар не найден');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить товар?')) return;

    try {
      await api.deleteProduct(id);
      navigate('/products');
    } catch (err) {
      if (err.response?.status === 403) {
        alert('У вас нет прав для удаления товаров');
      } else {
        alert('Ошибка при удалении');
      }
    }
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const imageStyle = {
    maxWidth: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'block',
    margin: '0 auto 20px auto'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '16px'
  };

  const canManage = userRole === 'seller' || userRole === 'admin';

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;

  if (error) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p style={{ color: '#c62828' }}>{error}</p>
      <Link to="/products">Вернуться к товарам</Link>
    </div>
  );

  return (
    <div style={containerStyle}>
      <Link to="/products" style={{ display: 'block', marginBottom: '20px' }}>
        ← Назад к товарам
      </Link>

      <div style={cardStyle}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} style={imageStyle} />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
            📷 Изображение отсутствует
          </div>
        )}

        <h2>{product.title}</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>Категория: {product.category}</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '20px 0', color: '#2c3e50' }}>
          {product.price.toLocaleString()} ₽
        </p>
        <p style={{ lineHeight: '1.6', color: '#555' }}>{product.description}</p>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Добавлено: {new Date(product.createdAt).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            Автор: {product.createdBy}
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          {canManage && (
            <Link to={`/products/${id}/edit`}>
              <button style={{ ...buttonStyle, backgroundColor: '#f39c12', color: 'white' }}>
                ✏️ Редактировать
              </button>
            </Link>
          )}

          {userRole === 'admin' && (
            <button
              onClick={handleDelete}
              style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: 'white' }}
            >
              🗑️ Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;