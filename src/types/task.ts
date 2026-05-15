export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
