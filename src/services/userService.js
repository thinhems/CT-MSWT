import api from './api';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';

// User Service for API interactions
export const userService = {
  // Get all users
  async getAllUsers(params = {}) {
    try {
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      
      // Add roleId to query params if provided
      if (params.roleId && params.roleId !== 'all') {
        queryParams.append('roleId', params.roleId);
      }
      
      // Add search term if provided
      if (params.search) {
        queryParams.append('search', params.search);
      }

      // Build the URL with query parameters
      const url = `${API_URLS.USER.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log('🔍 Calling API with URL:', url);

      const response = await api.get(url);
      console.log('🔍 Raw API Response:', response.data);
      
      // Handle .NET API response format
      let users = response.data;
      
      // If data has $values property (from .NET API), extract the actual array
      if (users && users.$values) {
        users = users.$values;
      }
      
      // Validate that users is an array
      if (!Array.isArray(users)) {
        console.error('❌ API response is not an array:', users);
        console.error('❌ Type:', typeof users);
        return []; // Return empty array instead of throwing error
      }
      
      console.log('📋 Users array length:', users.length);
      
      // Map API fields to frontend expected format
      const mappedUsers = users.map((user, index) => {
        try {
          const mappedPosition = this.mapRoleToPosition(user.roleId);
          console.log(`🔄 Mapping user ${index + 1}:`, {
            userId: user.userId,
            fullName: user.fullName,
            roleId: user.roleId,
            mappedPosition: mappedPosition
          });
          
          return {
            id: user.userId || `temp-${index}`,
            name: user.fullName || user.userName || "Unknown User",
            username: user.userName || "unknown",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "Chưa cập nhật",
            status: user.status || "Hoạt động",
            avatar: user.image || "https://i.pinimg.com/736x/65/d6/c4/65d6c4b0cc9e85a631cf2905a881b7f0.jpg",
            createdDate: user.createAt ? user.createAt.split('T')[0] : new Date().toISOString().split('T')[0],
            roleId: user.roleId, // Add roleId to the mapped user
            position: mappedPosition,
            location: "Chưa cập nhật",
            floor: "Chưa cập nhật"
          };
        } catch (err) {
          console.error(`❌ Error mapping user at index ${index}:`, user, err);
          return null;
        }
      }).filter(user => user !== null); // Remove any failed mappings
      
      console.log('✅ Mapped users successfully:', mappedUsers.length);
      return mappedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Helper function to map roleId to position
  mapRoleToPosition(roleId) {
    const roleMap = {
      'RL01': 'Quản lý cấp cao',
      'RL02': 'Quản trị hệ thống',
      'RL03': 'Giám sát viên vệ sinh',
      'RL04': 'Nhân viên vệ sinh'
    };
    return roleMap[roleId] || 'Nhân viên vệ sinh';
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(API_URLS.USER.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      console.log('🔄 Creating user with data:', userData);
      
      // Validate required fields
      const requiredFields = ['username', 'password', 'name', 'email', 'position', 'phone'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Email không đúng định dạng");
      }

      // Validate phone format (Vietnamese phone numbers)
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(userData.phone)) {
        throw new Error("Số điện thoại không đúng định dạng (VD: 0987654321)");
      }

      // Map frontend data to API expected format
      const mappedRoleId = this.mapPositionToRoleId(userData.position);
      console.log('🎭 Position to RoleId mapping:', {
        inputPosition: userData.position,
        mappedRoleId: mappedRoleId
      });
      
      const apiUserData = {
        userName: userData.username.trim(),
        password: userData.password,
        fullName: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        phone: userData.phone.trim(),
        address: userData.address?.trim() || "",
        status: userData.status || "Hoạt động",
        image: userData.avatar || "", // Handle image properly
        roleId: mappedRoleId
      };

      console.log('🔄 Sending API request to:', `${BASE_API_URL}/${API_URLS.USER.CREATE}`);
      console.log('📦 API payload:', {
        ...apiUserData,
        password: '[HIDDEN]', // Don't log password
        image: apiUserData.image ? `[IMAGE DATA: ${apiUserData.image.length} chars]` : 'No image'
      });
      
      const response = await api.post(API_URLS.USER.CREATE, apiUserData);
      
      console.log('✅ User creation API response:', response.data);
      console.log('📊 Response status:', response.status);
      
      // Map response back to frontend format
      const createdUser = response.data;
      
      if (!createdUser || !createdUser.userId) {
        throw new Error("API không trả về thông tin người dùng hợp lệ");
      }

      const responsePosition = this.mapRoleToPosition(createdUser.roleId);
      console.log('🔄 Response RoleId to Position mapping:', {
        responseRoleId: createdUser.roleId,
        mappedPosition: responsePosition
      });
      
      const mappedUser = {
        id: createdUser.userId,
        name: createdUser.fullName || createdUser.userName,
        username: createdUser.userName,
        email: createdUser.email,
        phone: createdUser.phone,
        address: createdUser.address || "Chưa cập nhật",
        status: createdUser.status || "Hoạt động",
        avatar: createdUser.image || userData.avatar || "https://i.pinimg.com/736x/65/d6/c4/65d6c4b0cc9e85a631cf2905a881b7f0.jpg",
        createdDate: createdUser.createAt ? createdUser.createAt.split('T')[0] : new Date().toISOString().split('T')[0],
        position: responsePosition,
        roleId: createdUser.roleId,
        location: "Chưa cập nhật",
        floor: "Chưa cập nhật"
      };

      console.log('✅ Mapped user for frontend:', mappedUser);
      return mappedUser;
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Enhanced error messages based on status code
      if (error.response?.status === 400) {
        const apiError = error.response.data?.message || error.response.data?.title || 'Dữ liệu không hợp lệ';
        throw new Error(`Lỗi 400: ${apiError}`);
      } else if (error.response?.status === 409) {
        throw new Error("Tên đăng nhập hoặc email đã tồn tại trong hệ thống");
      } else if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(`Lỗi xác thực: ${errorMessages.join(', ')}`);
        }
        throw new Error("Dữ liệu không đúng định dạng yêu cầu");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi server khi tạo người dùng. Vui lòng thử lại sau.");
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error("Không thể kết nối tới server. Kiểm tra kết nối mạng.");
      }
      
      // If it's our validation error, re-throw as is
      if (error.message.includes('Thiếu thông tin') || error.message.includes('không đúng định dạng')) {
        throw error;
      }
      
      throw new Error(error.message || "Có lỗi không xác định khi tạo người dùng");
    }
  },

  // Helper function to map position to roleId
  mapPositionToRoleId(position) {
    const positionMap = {
      'Nhân viên vệ sinh': 'RL04',
      'Giám sát viên vệ sinh': 'RL03',
      'Quản lý cấp cao': 'RL01',
      'Quản trị hệ thống': 'RL02'
    };
    const roleId = positionMap[position] || 'RL04';
    console.log('📋 mapPositionToRoleId:', {
      inputPosition: position,
      outputRoleId: roleId,
      available: Object.keys(positionMap)
    });
    return roleId;
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await api.put(API_URLS.USER.UPDATE(id), userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Update user status using specific API endpoint
  async updateUserStatus(id, noteData) {
    try {
      const endpoint = API_URLS.USER.UPDATE_STATUS(id);
      console.log('🚀 API Request Details:');
      console.log('📍 Endpoint:', endpoint);
      console.log('📦 Request Data:', noteData);
      console.log('🔗 Base URL:', BASE_API_URL);
      
      // Use the configured api instance (with proxy support)
      const response = await api.put(endpoint, noteData);
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      console.error('❌ Error Response:', error.response?.data);
      console.error('❌ Error Status:', error.response?.status);
      console.error('❌ Error Headers:', error.response?.headers);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await api.delete(API_URLS.USER.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Search users
  async searchUsers(searchParams) {
    try {
      // Add roleId to query params if provided
      const apiParams = { ...searchParams };
      
      const response = await api.get(API_URLS.USER.GET_ALL, { 
        params: apiParams 
      });
      
      console.log('🔍 Search API Response:', response.data);
      
      // Handle .NET API response format
      let users = response.data;
      
      // If data has $values property (from .NET API), extract the actual array
      if (users && users.$values) {
        users = users.$values;
      }
      
      // Validate that users is an array
      if (!Array.isArray(users)) {
        console.error('❌ Search API response is not an array:', users);
        console.error('❌ Type:', typeof users);
        return []; // Return empty array instead of throwing error
      }
      
      console.log('🔍 Search Users array length:', users.length);
      
      // Map API fields to frontend expected format
      const mappedUsers = users.map(user => ({
        id: user.userId,
        name: user.fullName || user.userName,
        username: user.userName,
        email: user.email,
        phone: user.phone,
        address: user.address || "Chưa cập nhật",
        status: user.status || "Hoạt động",
        avatar: user.image || "https://i.pinimg.com/736x/65/d6/c4/65d6c4b0cc9e85a631cf2905a881b7f0.jpg",
        createdDate: user.createAt ? user.createAt.split('T')[0] : new Date().toISOString().split('T')[0],
        roleId: user.roleId, // Add roleId to the mapped user
        position: this.mapRoleToPosition(user.roleId),
        location: "Chưa cập nhật",
        floor: "Chưa cập nhật"
      }));
      
      return mappedUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
};

export default userService; 