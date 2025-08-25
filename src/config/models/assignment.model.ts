export interface Assignment {
  assignmentId: string;
  assignmentName: string;
  description?: string;
  status?: string;
  groupAssignmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupAssignment {
  groupAssignmentId: string;
  assignmentGroupName: string;
  description?: string;
  createdAt?: string;
}

export interface AssignmentCreateRequest {
  assignmentName: string;
  description?: string;
  status?: string;
  groupAssignmentId?: string;
}

export interface AssignmentUpdateRequest {
  assignmentName?: string;
  description?: string;
  status?: string;
  groupAssignmentId?: string;
}

export interface AssignmentResponse {
  assignmentId: string;
  assignmentName: string;
  description?: string;
  groupAssignmentId?: string;
  createdAt: string;
  updatedAt: string;
} 