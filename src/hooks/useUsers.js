import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import userService from '../services/userService';
import { API_URLS } from '../constants/api-urls';

// SWR fetcher function for users
const usersFetcher = async (url) => {
  const params = {};
  // Extract any query parameters from the URL if needed
  return await userService.getAllUsers(params);
};

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Use SWR for automatic data fetching and caching
  const { data: users, error: swrError, isLoading } = useSWR(
    API_URLS.USER.GET_ALL,
    usersFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  // Fetch users manually (for custom parameters)
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getAllUsers(params);
      // Trigger SWR revalidation
      mutate(API_URLS.USER.GET_ALL);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await userService.createUser(userData);
      // Trigger SWR revalidation to refresh the list
      mutate(API_URLS.USER.GET_ALL);
      return newUser;
    } catch (err) {
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await userService.updateUser(id, userData);
      // Trigger SWR revalidation to refresh the list
      mutate(API_URLS.USER.GET_ALL);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user status using specific API endpoint
  const updateUserStatus = useCallback(async (id, statusData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.updateUserStatus(id, statusData);
      // Trigger SWR revalidation to refresh the list
      mutate(API_URLS.USER.GET_ALL);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update user status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await userService.deleteUser(id);
      // Trigger SWR revalidation to refresh the list
      mutate(API_URLS.USER.GET_ALL);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.searchUsers(searchParams);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to search users');
      console.error('Error searching users:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users: users || [],
    loading: isLoading || loading,
    error: swrError || error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    searchUsers,
    refresh: () => mutate(API_URLS.USER.GET_ALL)
  };
};

export default useUsers; 