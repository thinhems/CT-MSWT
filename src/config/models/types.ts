// Base response interface for .NET API
export interface IBaseResponse<T> {
  $id: string;
  $values: T[];
}

// Generic API response interface
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  status?: number;
}

// Pagination interface
export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Paginated response interface
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
  success: boolean;
  message?: string;
}

// Common entity interfaces
export interface IBaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Status enum
export enum EntityStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  PENDING = "Pending",
  DELETED = "Deleted",
}

// User role enum
export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  SUPERVISOR = "Supervisor",
  WORKER = "Worker",
}

// Query parameters interface
export interface IQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}

export type IActionType = "view" | "update" | "delete";

export type IError = {
  message: string;
};

export interface TrashBin {
  trashBinId: string;
  status: string;
  areaId: string;
  location?: string;
  image?: string;
  restroomId?: string;
  createdAt?: string;
  updatedAt?: string;
  area?: {
    areaId: string;
    areaName: string;
    floorNumber: number;
    floorId: string;
  };
  alerts?: any[];
  requests?: any[];
  restroom?: any;
  schedules?: any[];
  sensorBins?: any[];
}

export interface TrashBinCreateRequest {
  areaId: string;
  location: string;
  image?: string;
  restroomId?: string;
}

export interface TrashBinUpdateRequest {
  status?: string;
  areaId?: string;
  location?: string;
  image?: string;
  restroomId?: string;
}
