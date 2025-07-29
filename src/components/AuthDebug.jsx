import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#fbbf24' }}>🔐 Auth Debug</h3>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Token:</strong> {token ? `✅ ${token.substring(0, 20)}...` : '❌ None'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>User Data:</strong> {userData ? '✅ Stored' : '❌ None'}
      </div>
      
      {user && (
        <div style={{ marginBottom: '8px' }}>
          <strong>User:</strong> {user.username || 'N/A'}
        </div>
      )}
      
      {user && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Role:</strong> {user.role || 'N/A'}
        </div>
      )}
      
      <button
        onClick={() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userData');
          window.location.reload();
        }}
        style={{
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        Clear Auth
      </button>
    </div>
  );
};

export default AuthDebug; 