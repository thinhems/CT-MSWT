import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserRoleInfo = () => {
  const { user, getUserRole, hasRole, hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#fee2e2', 
        borderRadius: '8px',
        margin: '16px 0' 
      }}>
        <p style={{ color: '#dc2626', margin: 0 }}>
          ❌ Chưa đăng nhập
        </p>
      </div>
    );
  }

  const roleInfo = getUserRole();

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8fafc', 
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      margin: '16px 0' 
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        color: '#1e293b',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        🎭 Thông tin Role & Quyền hạn
      </h3>
      
      {/* User Basic Info */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          color: '#475569',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          👤 Thông tin cơ bản:
        </h4>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>ID:</strong> {user?.userId || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Tên đăng nhập:</strong> {user?.username || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Họ tên:</strong> {user?.fullName || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Phone:</strong> {user?.phone || 'N/A'}
          </p>
        </div>
      </div>

      {/* Role Information */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          color: '#475569',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🏷️ Thông tin Role:
        </h4>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Role ID:</strong> {roleInfo?.roleId || 'N/A'}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Role Name:</strong> 
            <span style={{ 
              marginLeft: '8px',
              padding: '4px 8px',
              backgroundColor: roleInfo?.role === 'Leader' ? '#dbeafe' : 
                            roleInfo?.role === 'Manager' ? '#fef3c7' :
                            roleInfo?.role === 'Supervisor' ? '#ecfdf5' : '#f3f4f6',
              color: roleInfo?.role === 'Leader' ? '#1e40af' : 
                     roleInfo?.role === 'Manager' ? '#92400e' :
                     roleInfo?.role === 'Supervisor' ? '#166534' : '#374151',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {roleInfo?.role || 'N/A'}
            </span>
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>Vị trí:</strong> {roleInfo?.position || 'N/A'}
          </p>
        </div>
      </div>

      {/* Role Flags */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          color: '#475569',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🚩 Phân loại Role:
        </h4>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'isLeader', label: 'Leader', color: '#dc2626' },
            { key: 'isManager', label: 'Manager', color: '#d97706' },
            { key: 'isSupervisor', label: 'Supervisor', color: '#059669' },
            { key: 'isWorker', label: 'Worker', color: '#4f46e5' }
          ].map(({ key, label, color }) => (
            <span
              key={key}
              style={{
                padding: '4px 8px',
                backgroundColor: roleInfo?.[key] ? color : '#f3f4f6',
                color: roleInfo?.[key] ? 'white' : '#6b7280',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {roleInfo?.[key] ? '✅' : '❌'} {label}
            </span>
          ))}
        </div>
      </div>

      {/* Permission Check */}
      <div>
        <h4 style={{ 
          margin: '0 0 8px 0', 
          color: '#475569',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🔐 Kiểm tra quyền hạn:
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {['Worker', 'Supervisor', 'Manager', 'Leader'].map(role => (
            <div 
              key={role}
              style={{ 
                padding: '8px 12px',
                backgroundColor: hasPermission(role) ? '#ecfdf5' : '#fef2f2',
                color: hasPermission(role) ? '#166534' : '#dc2626',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'center',
                border: `1px solid ${hasPermission(role) ? '#bbf7d0' : '#fecaca'}`
              }}
            >
              <strong>{role}:</strong> {hasPermission(role) ? '✅ Có quyền' : '❌ Không có quyền'}
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <details style={{ marginTop: '16px' }}>
        <summary style={{ 
          cursor: 'pointer',
          color: '#6b7280',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          🐛 Debug Info (Raw Data)
        </summary>
        <pre style={{ 
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '10px',
          overflow: 'auto',
          marginTop: '8px'
        }}>
          {JSON.stringify({ user, roleInfo }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default UserRoleInfo; 