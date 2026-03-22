import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const navStyle = {
    backgroundColor: '#2c3e50',
    padding: '1rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '1rem'
  };

  const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}>Главная</Link>
        {isAuthenticated && (
          <>
            <Link to="/products" style={linkStyle}>Товары</Link>
            <Link to="/products/new" style={linkStyle}>+ Добавить товар</Link>
          </>
        )}
      </div>
      <div>
        {!isAuthenticated ? (
          <>
            <Link to="/login" style={linkStyle}>Вход</Link>
            <Link to="/register" style={linkStyle}>Регистрация</Link>
          </>
        ) : (
          <button onClick={handleLogout} style={buttonStyle}>
            Выйти
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
