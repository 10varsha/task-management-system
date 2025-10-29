export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  order: number;
  createdById: string;
  assignedToId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  assignedTo?: any;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  assignedToId?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  order?: number;
}
