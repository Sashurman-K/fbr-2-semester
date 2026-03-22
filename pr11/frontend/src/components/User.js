import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
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

  const handleUpdateUser = async (id, userData) => {
    try {
      const response = await api.updateUser(id, userData);
      setUsers(users.map(u => u.id === id ? response.data : u));
      setEditingUser(null);
    } catch (err) {
      alert('Ошибка при обновлении пользователя');
    }
  };

  const handleBlockUser = async (id, username) => {
    if (!window.confirm(`Заблокировать пользователя ${username}?`)) return;

    try {
      await api.deleteUser(id);
      setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
    } catch (err) {
      alert('Ошибка при блокировке пользователя');
    }
  };

  const containerStyle = {
    padding: '20px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };

  const thStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left'
  };

  const tdStyle = {
    border: '1px solid #ddd',
    padding: '12px'
  };

  const buttonStyle = {
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px'
  };

  const errorStyle = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  };

  const roleColors = {
    admin: '#e74c3c',
    seller: '#f39c12',
    user: '#3498db'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={containerStyle}>
      <h2>Управление пользователями</h2>

      {error && <div style={errorStyle}>{error}</div>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Username</th>
            <th style={thStyle}>Имя</th>
            <th style={thStyle}>Фамилия</th>
            <th style={thStyle}>Роль</th>
            <th style={thStyle}>Статус</th>
            <th style={thStyle}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.username}</td>
              <td style={tdStyle}>
                {editingUser === user.id ? (
                  <input
                    type="text"
                    defaultValue={user.first_name}
                    onChange={(e) => {
                      const updated = { ...user, first_name: e.target.value };
                      setUsers(users.map(u => u.id === user.id ? updated : u));
                    }}
                    style={{ width: '100%', padding: '5px' }}
                  />
                ) : user.first_name}
              </td>
              <td style={tdStyle}>
                {editingUser === user.id ? (
                  <input
                    type="text"
                    defaultValue={user.last_name}
                    onChange={(e) => {
                      const updated = { ...user, last_name: e.target.value };
                      setUsers(users.map(u => u.id === user.id ? updated : u));
                    }}
                    style={{ width: '100%', padding: '5px' }}
                  />
                ) : user.last_name}
              </td>
              <td style={tdStyle}>
                {editingUser === user.id ? (
                  <select
                    defaultValue={user.role}
                    onChange={(e) => {
                      const updated = { ...user, role: e.target.value };
                      setUsers(users.map(u => u.id === user.id ? updated : u));
                    }}
                    style={{ width: '100%', padding: '5px' }}
                  >
                    <option value="user">Пользователь</option>
                    <option value="seller">Продавец</option>
                    <option value="admin">Администратор</option>
                  </select>
                ) : (
                  <span style={{
                    backgroundColor: roleColors[user.role] || '#95a5a6',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {user.role === 'admin' ? 'Админ' : user.role === 'seller' ? 'Продавец' : 'Пользователь'}
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                <span style={{
                  color: user.isActive ? '#27ae60' : '#e74c3c',
                  fontWeight: 'bold'
                }}>
                  {user.isActive ? 'Активен' : 'Заблокирован'}
                </span>
              </td>
              <td style={tdStyle}>
                {editingUser === user.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateUser(user.id, user)}
                      style={{...buttonStyle, backgroundColor: '#27ae60', color: 'white'}}
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      style={{...buttonStyle, backgroundColor: '#95a5a6', color: 'white'}}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingUser(user.id)}
                      style={{...buttonStyle, backgroundColor: '#3498db', color: 'white'}}
                    >
                      Редактировать
                    </button>
                    {user.isActive && (
                      <button
                        onClick={() => handleBlockUser(user.id, user.username)}
                        style={{...buttonStyle, backgroundColor: '#e74c3c', color: 'white'}}
                      >
                        Заблокировать
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;