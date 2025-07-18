import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // Parse stored user data
          const storedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(storedUser);
          
          console.log('✅ Auth initialized from storage:', storedUser);
          console.log('🎭 User role:', storedUser?.role);
          console.log('💼 User position:', storedUser?.position);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any corrupted data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function using backend API
  const login = async (username, password) => {
    try {
      console.log('🔐 AuthContext: Starting login process...');
      setLoading(true);
      
      const result = await authService.login({ username, password });
      
      console.log('🔍 AuthContext: AuthService result:', result);
      
      if (result.success) {
        const { user: userData } = result.data;
        
        console.log('✅ AuthContext: Setting authentication state...');
        setIsAuthenticated(true);
        setUser(userData);
        
        console.log('✅ AuthContext: User logged in successfully:', userData);
        console.log('🎭 AuthContext: User role:', userData.role);
        console.log('💼 AuthContext: User position:', userData.position);
        console.log('🔐 AuthContext: Authentication state updated:', { isAuthenticated: true });
        
        return { success: true, user: userData };
      } else {
        console.log('❌ AuthContext: Login failed:', result.error);
        return { 
          success: false, 
          error: result.error 
        };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return { 
        success: false, 
        error: 'Đã có lỗi xảy ra trong quá trình đăng nhập' 
      };
    } finally {
      console.log('🔄 AuthContext: Setting loading to false...');
      setLoading(false);
    }
  };

  // Register function using backend API
  const register = async (userData) => {
    try {
      setLoading(true);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          error: result.error 
        };
      }
    } catch (error) {
      console.error('Registration error in context:', error);
      return { 
        success: false, 
        error: 'Đã có lỗi xảy ra trong quá trình đăng ký' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Get user role information
  const getUserRole = () => {
    if (!user) return null;
    
    return {
      roleId: user.roleId,
      role: user.role,
      position: user.position,
      isLeader: user.role === 'Leader',
      isManager: user.role === 'Manager',
      isSupervisor: user.role === 'Supervisor',
      isWorker: user.role === 'Worker',
    };
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Check if user has permission (role hierarchy)
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'Worker': 1,        // Nhân viên vệ sinh
      'Supervisor': 2,    // Giám sát viên và sinh
      'Manager': 3,       // Quản lý cấp cao
      'Leader': 4         // Quản trị hệ thống
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    getUserRole,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 