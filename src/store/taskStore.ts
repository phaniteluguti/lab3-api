import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskBody, UpdateTaskBody } from '../types/task';

const tasks: Task[] = [];

export function findAll(): Task[] {
  return [...tasks];
}

export function findById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function create(body: CreateTaskBody): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(),
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'todo',
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return task;
}

export function update(id: string, body: UpdateTaskBody): Task | undefined {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;

  const existing = tasks[index];
  const updated: Task = {
    ...existing,
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.status !== undefined && { status: body.status }),
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updated;
  return updated;
}

export function remove(id: string): boolean {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
