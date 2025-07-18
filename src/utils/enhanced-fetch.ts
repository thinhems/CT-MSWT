import { buildUrlParams } from "./build-url-params";

export class FetchError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "FetchError";
  }
}

export interface EnhancedFetchOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
  timeout?: number;
}

const getErrorMessage = (status: number, message?: string): string => {
  switch (status) {
    case 400:
      return "400 - Dữ liệu không hợp lệ";
    case 401:
      return "401 - Vui lòng đăng nhập lại";
    case 403:
      return "403 - Bạn không có quyền truy cập";
    case 404:
      return "404 - Đã có lỗi xảy ra khi kết nối đến máy chủ";
    case 415:
      return "415 - Không hỗ trợ định dạng dữ liệu";
    case 422:
      return "422 - Dữ liệu không đúng định dạng";
    case 500:
      return "500 - Lỗi hệ thống, vui lòng thử lại sau";
    default:
      return message || "500 - Lỗi hệ thống, vui lòng thử lại sau";
  }
};

export const MAX_TIME_OUT = 300000; // 5 minutes

export async function enhancedFetch<T>(
  endpoint: string,
  options: EnhancedFetchOptions = { method: "GET" }
): Promise<T> {
  const { params, token, timeout = MAX_TIME_OUT, ...fetchOptions } = options;

  // Build URL with query parameters
  const baseUrl = (import.meta as any).env.VITE_API_URL || "https://capstoneproject-mswt-su25.onrender.com/api";
  const url = new URL(`${baseUrl}/${endpoint}`);
  const finalUrl = buildUrlParams(url, params);

  // Modify headers handling for FormData
  const headers: any = {
    ...fetchOptions.headers,
  };

  // Only set Content-Type if body is not FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(finalUrl.toString(), {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      // const errorData = (await response.json()) as IResponse;
      throw new FetchError(response.status, getErrorMessage(response.status));
    }

    return response?.json() as T;
  } catch (error: any) {
    console.error(error);

    if (error.name === "AbortError") {
      return {
        success: false,
        message: "Yêu cầu đã hết thời gian chờ",
      } as T;
    }

    if (error instanceof FetchError) {
      return {
        success: false,
        message: error.message,
        status: error.status,
      } as T;
    }

    return {
      success: false,
      message: "Đã có lỗi xảy ra khi kết nối đến máy chủ",
    } as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
