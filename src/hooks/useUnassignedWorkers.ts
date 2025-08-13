import useSWR from 'swr';
import { API_URLS } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';

export interface UnassignedWorker {
  userId: string;
  userName: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  address: string;
  image: string;
  roleId: string;
  roleName: string;
  description: string;
  password?: string;
  createAt?: string;
  rating?: number;
  reasonForLeave?: string;
}

export const useUnassignedWorkers = () => {
  const { data, error, isLoading, mutate } = useSWR(
    API_URLS.USER.GET_UNASSIGNED_WORKERS,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  // Debug logging
  console.log("🔍 Unassigned Workers Debug:", {
    url: API_URLS.USER.GET_UNASSIGNED_WORKERS,
    data,
    error,
    isLoading
  });

  return {
    unassignedWorkers: data || [],
    isLoading,
    error,
    mutate,
  };
};

export default useUnassignedWorkers;
