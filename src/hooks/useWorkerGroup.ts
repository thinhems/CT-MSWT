import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { API_URLS } from '../constants/api-urls';

export interface WorkerGroupMember {
  id: string;
  name: string;
  position: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface WorkerGroup {
  workerGroupId: string;
  workerGroupName: string;
  description: string;
  createdAt: string;
  // Additional fields that might be populated when fetching with members
  members?: WorkerGroupMember[];
  leader?: WorkerGroupMember;
  area?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
}

interface UseWorkerGroupReturn {
  groups: WorkerGroup[];
  loading: boolean;
  error: string | null;
  fetchGroups: () => Promise<void>;
  fetchAllMembers: () => Promise<WorkerGroupMember[] | null>;
  createGroup: (groupData: Partial<WorkerGroup>) => Promise<WorkerGroup | null>;
  updateGroup: (id: string, groupData: Partial<WorkerGroup>) => Promise<WorkerGroup | null>;
  deleteGroup: (id: string) => Promise<boolean>;
  getGroupById: (id: string) => Promise<WorkerGroup | null>;
}

export const useWorkerGroup = (): UseWorkerGroupReturn => {
  const [groups, setGroups] = useState<WorkerGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching worker groups from:', API_URLS.WORKER_GROUP.GET_ALL);
      const response = await api.get(API_URLS.WORKER_GROUP.GET_ALL);
      
      console.log('API Response:', response);
      
      if (response.data && response.data.success) {
        setGroups(response.data.data || []);
      } else {
        setGroups(response.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching worker groups:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setError(err.response?.data?.message || err.message || 'Failed to fetch worker groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (groupData: Partial<WorkerGroup>): Promise<WorkerGroup | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(API_URLS.WORKER_GROUP.CREATE, groupData);
      
      if (response.data && response.data.success) {
        const newGroup = response.data.data;
        setGroups(prev => [...prev, newGroup]);
        return newGroup;
      } else {
        const newGroup = response.data;
        setGroups(prev => [...prev, newGroup]);
        return newGroup;
      }
    } catch (err: any) {
      console.error('Error creating worker group:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create worker group');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (id: string, groupData: Partial<WorkerGroup>): Promise<WorkerGroup | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(API_URLS.WORKER_GROUP.UPDATE(id), groupData);
      
      if (response.data && response.data.success) {
        const updatedGroup = response.data.data;
        setGroups(prev => prev.map(group => group.workerGroupId === id ? updatedGroup : group));
        return updatedGroup;
      } else {
        const updatedGroup = response.data;
        setGroups(prev => prev.map(group => group.workerGroupId === id ? updatedGroup : group));
        return updatedGroup;
      }
    } catch (err: any) {
      console.error('Error updating worker group:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update worker group');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(API_URLS.WORKER_GROUP.DELETE(id));
      
      setGroups(prev => prev.filter(group => group.workerGroupId !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting worker group:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete worker group');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGroupById = useCallback(async (id: string): Promise<WorkerGroup | null> => {
    try {
      setError(null);
      
      const response = await api.get(API_URLS.WORKER_GROUP.GET_BY_ID(id));
      
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (err: any) {
      console.error('Error fetching worker group by ID:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch worker group');
      return null;
    }
  }, []);

  const fetchAllMembers = useCallback(async (): Promise<WorkerGroupMember[] | null> => {
    try {
      setError(null);
      
      const response = await api.get(API_URLS.WORKER_GROUP.GET_ALL_MEMBERS);
      
      if (response.data && response.data.success) {
        return response.data.data || [];
      } else {
        return response.data || [];
      }
    } catch (err: any) {
      console.error('Error fetching all group members:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch group members');
      return null;
    }
  }, []);

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    fetchAllMembers,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
  };
};
