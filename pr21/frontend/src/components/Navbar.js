import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        const role = response.data.role;
        const name = response.data.username;
        localStorage.setItem('get', response);
        setUserRole(role);
        setUsername(name);
        console.log(role);
        // Сохраняем в localStorage только если получили с сервера
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', name);

      } catch (err) {
        console.error('Ошибка получения информации о пользователе:', err);

        // Если токен невалидный, очищаем localStorage
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('username');
        }

        setUserRole('');
        setUsername('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [location.pathname]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch (err) {
        console.error('Ошибка при выходе');
      }
    }

    // Очищаем все данные пользователя
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');

    setUserRole('');
    setUsername('');

    navigate('/login');
  };

  // Проверяем наличие токена для определения авторизации
  const isAuthenticated = !!localStorage.getItem('accessToken');

  const navStyle = {
    backgroundColor: '#2c3e50',
    padding: '1rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '1rem'
  };

  const buttonStyle = {
    backgroundColor: '#000000',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const userInfoStyle = {
    marginRight: '1rem',
    fontSize: '14px',
    color: '#ecf0f1'
  };

  const roleColors = {
    admin: '#e74c3c',
    seller: '#f39c12',
    user: '#3498db'
  };

  const roleNames = {
    admin: 'Администратор',
    seller: 'Продавец',
    user: 'Пользователь'
  };

  // Показываем загрузку, если проверяем авторизацию
  if (isLoading) {
    return (
      <nav style={navStyle}>
        <div>Загрузка...</div>
      </nav>
    );
  }

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}>Главная</Link>
        {isAuthenticated && (
          <>
            <Link to="/products" style={linkStyle}>Товары</Link>
            {(userRole === 'seller' || userRole === 'admin') && (
              <Link to="/products/new" style={linkStyle}>+ Добавить товар</Link>
            )}
            {userRole === 'admin' && (
              <Link to="/users" style={linkStyle}> Пользователи</Link>
            )}
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <span style={userInfoStyle}>
              {username || 'Пользователь'}
              <span style={{
                marginLeft: '8px',
                backgroundColor: roleColors[userRole] || '#95a5a6',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {roleNames[userRole] || userRole || 'Гость'}
              </span>
            </span>
            <button onClick={handleLogout} style={buttonStyle}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Вход</Link>
            <Link to="/register" style={linkStyle}>Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;