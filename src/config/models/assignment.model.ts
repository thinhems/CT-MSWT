export interface Assignment {
  assignmentId: string;
  assignmentName: string;
  description?: string;
  timesPerDay?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentCreateRequest {
  assignmentName: string;
  description?: string;
  timesPerDay?: string;
  status?: string;
}

export interface AssignmentUpdateRequest {
  assignmentName?: string;
  description?: string;
  timesPerDay?: string;
  status?: string;
}

export interface AssignmentResponse {
  assignmentId: string;
  assignmentName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
} 