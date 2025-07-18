import { useState } from 'react';
import userService from '../services/userService';

const ApiTestDebug = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testGetUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🔍 Testing API GET /users...');
      console.log('Base URL:', import.meta.env.VITE_API_URL);
      
      const users = await userService.getAllUsers();
      console.log('✅ API Response:', users);
      
      setResult({
        success: true,
        data: users,
        count: users.length
      });
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '300px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 10000
    }}>
      <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>🔧 API Debug Tool</h3>
      
      <button
        onClick={testGetUsers}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '12px'
        }}
      >
        {loading ? '⏳ Testing...' : '🧪 Test GET /users'}
      </button>

      {error && (
        <div style={{
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '8px',
          fontSize: '12px'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={{
          backgroundColor: result.success ? '#e6ffe6' : '#ffe6e6',
          color: result.success ? '#006600' : '#cc0000',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {result.success ? (
            <>
              ✅ Success!<br/>
              Users found: {result.count}<br/>
              <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer' }}>View Data</summary>
                <pre style={{ 
                  fontSize: '10px', 
                  overflow: 'auto', 
                  maxHeight: '200px',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  marginTop: '4px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </>
          ) : (
            `❌ Failed: ${result.error}`
          )}
        </div>
      )}

      <div style={{ 
        fontSize: '10px', 
        color: '#666', 
        marginTop: '8px',
        borderTop: '1px solid #eee',
        paddingTop: '8px'
      }}>
        API URL: {import.meta.env.VITE_API_URL || 'Not configured'}
      </div>
    </div>
  );
};

export default ApiTestDebug; 