import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  useEffect(() => {
    fetchUsers();
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;

    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      if (err.response?.status === 403) {
        alert('У вас нет прав для удаления пользователей');
      } else {
        alert('Ошибка при удалении');
      }
    }
  };

  const containerStyle = {
    padding: '20px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const thStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  };

  const buttonStyle = {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '14px'
  };

  const errorStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  };

  const roleBadgeStyle = (role) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: role === 'admin' ? '#e74c3c' : role === 'seller' ? '#f39c12' : '#2ecc71',
    color: 'white'
  });

  const canManage = userRole === 'admin';

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={containerStyle}>
      <h2>Пользователи</h2>

      {error && <div style={errorStyle}>{error}</div>}

      {!canManage && (
        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
          ⚠️ Просмотр пользователей доступен только администраторам
        </div>
      )}

      {canManage && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Роль</th>
              <th style={thStyle}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.id}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>
                  <span style={roleBadgeStyle(user.role)}>
                    {user.role === 'admin' ? 'Администратор' : user.role === 'seller' ? 'Продавец' : 'Покупатель'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <Link to={`/users/${user.id}`}>
                    <button style={{ ...buttonStyle, backgroundColor: '#3498db', color: 'white' }}>
                      Просмотр
                    </button>
                  </Link>

                  {userRole === 'admin' && user.id !== parseInt(localStorage.getItem('userId')) && (
                    <>
                      <Link to={`/users/${user.id}/edit`}>
                        <button style={{ ...buttonStyle, backgroundColor: '#f39c12', color: 'white' }}>
                          Редактировать
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: 'white' }}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {users.length === 0 && !loading && canManage && (
        <p style={{ textAlign: 'center', color: '#666' }}>Нет пользователей</p>
      )}
    </div>
  );
}

export default Users;
