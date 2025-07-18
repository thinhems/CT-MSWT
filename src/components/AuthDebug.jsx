import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Check localStorage directly
  const accessToken = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#1f2937',
      color: '#f9fafb',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#60a5fa' }}>🐛 Auth Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>State:</strong>
        <div>• Loading: {loading ? '✅' : '❌'}</div>
        <div>• Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>• User: {user ? '✅' : '❌'}</div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>LocalStorage:</strong>
        <div>• Token: {accessToken ? '✅' : '❌'}</div>
        <div>• UserData: {userData ? '✅' : '❌'}</div>
      </div>

      {user && (
        <div style={{ marginBottom: '8px' }}>
          <strong>User Info:</strong>
          <div>• Username: {user.username}</div>
          <div>• RoleId: {user.roleId}</div>
          <div>• Role: {user.role}</div>
          <div>• Position: {user.position}</div>
          <div>• FullName: {user.fullName}</div>
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#9ca3af' }}>
        Refresh: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AuthDebug; 