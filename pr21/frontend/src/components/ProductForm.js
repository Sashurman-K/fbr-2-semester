import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    image: null,
    imagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canManage = userRole === 'seller' || userRole === 'admin';

  useEffect(() => {
    if (!canManage) {
      alert('У вас нет прав для этого действия');
      navigate('/products');
      return;
    }
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.getProduct(id);
      setFormData({
        title: response.data.title,
        category: response.data.category,
        description: response.data.description,
        price: response.data.price,
        image: null,
        imagePreview: response.data.imageUrl
      });
    } catch (err) {
      setError('Товар не найден');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const productData = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      price: Number(formData.price),
      image: formData.image
    };

    try {
      if (isEditing) {
        await api.updateProduct(id, productData);
      } else {
        await api.createProduct(productData);
      }
      navigate('/products');
    } catch (err) {
      setError('Ошибка при сохранении товара');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px'
  };

  const formStyle = {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '100px'
  };

  const buttonStyle = {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  };

  const errorStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  };

  const imagePreviewStyle = {
    maxWidth: '200px',
    maxHeight: '200px',
    marginTop: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  };

  return (
    <div style={containerStyle}>
      <h2>{isEditing ? 'Редактировать товар' : 'Создать товар'}</h2>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Название:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Категория:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Описание:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={textareaStyle}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Цена (₽):</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Изображение:</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            style={inputStyle}
          />
          {formData.imagePreview && (
            <div>
              <img src={formData.imagePreview} alt="Preview" style={imagePreviewStyle} />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {formData.image ? 'Новое изображение' : 'Текущее изображение'}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: '#2ecc71',
              color: 'white',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Создать')}
          </button>

          <Link to="/products" style={{ flex: 1 }}>
            <button
              type="button"
              style={{
                ...buttonStyle,
                backgroundColor: '#95a5a6',
                color: 'white',
                width: '100%'
              }}
            >
              Отмена
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;