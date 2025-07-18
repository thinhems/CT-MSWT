import axios from "axios";
import { BASE_API_URL } from "../constants/api-urls";

// Create axios instance for SWR
const swrAxios = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000, // Increase timeout to 30s
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
});

// Add request interceptor to include auth token
swrAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
swrAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      throw new Error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
    }

    // Handle API errors
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      getErrorMessage(error.response?.status) ||
      "Đã có lỗi xảy ra";

    throw new Error(message);
  }
);

// Error message mapping
const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "Dữ liệu không hợp lệ";
    case 401:
      return "Vui lòng đăng nhập lại";
    case 403:
      return "Bạn không có quyền truy cập";
    case 404:
      return "Không tìm thấy dữ liệu";
    case 409:
      return "Dữ liệu đã tồn tại";
    case 422:
      return "Dữ liệu không đúng định dạng";
    case 500:
      return "Lỗi hệ thống, vui lòng thử lại sau";
    case 503:
      return "Dịch vụ tạm thời không khả dụng";
    default:
      return "Đã có lỗi xảy ra";
  }
};

// SWR fetcher function with retry logic
export const swrFetcher = async (url: string, options?: RequestInit, retryCount = 0): Promise<any> => {
  const maxRetries = 3;
  
  try {
    let response;
    
    if (options) {
      // For POST, PUT, DELETE requests
      response = await swrAxios({
        url,
        method: options.method || "GET",
        data: options.body ? JSON.parse(options.body as string) : undefined,
        headers: {
          ...swrAxios.defaults.headers.common,
          ...(options.headers as Record<string, string>),
        },
      });
    } else {
      // For GET requests
      response = await swrAxios.get(url);
    }

    return response.data;
  } catch (error: any) {
    console.error(`SWR Fetcher Error for ${url} (Attempt ${retryCount + 1}):`, error);
    
    // Retry on network errors or timeouts
    if (retryCount < maxRetries && (!error.response || error.code === 'ECONNABORTED')) {
      console.log(`Retrying request to ${url} in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return swrFetcher(url, options, retryCount + 1);
    }
    
    throw error;
  }
};

// Enhanced fetcher with better typing
export const typedSwrFetcher = <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  return swrFetcher(url, options) as Promise<T>;
};

// Fetcher for paginated data
export const paginatedSwrFetcher = async (
  url: string,
  params?: Record<string, any>
) => {
  try {
    const response = await swrAxios.get(url, { params });
    return response.data;
  } catch (error: any) {
    console.error(`Paginated SWR Fetcher Error for ${url}:`, error);
    throw error;
  }
};

export default swrFetcher;
