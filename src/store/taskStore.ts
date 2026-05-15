import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskBody, UpdateTaskBody } from '../types/task';

// In-memory store: all tasks live here for the lifetime of the process.
// Restarting the server resets this array — swap this module for a DB adapter
// when persistence is needed.
const tasks: Task[] = [];

// Returns a shallow copy so callers cannot mutate the internal array directly.
export function findAll(): Task[] {
  return [...tasks];
}

export function findById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function create(body: CreateTaskBody): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(), // UUIDs are generated server-side; clients never supply an id
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'todo', // default status for new tasks
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
    // Only spread fields that were explicitly provided in the request body
    ...(body.title !== undefined && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.status !== undefined && { status: body.status }),
    updatedAt: new Date().toISOString(), // always refresh on any update
  };
  tasks[index] = updated;
  return updated;
}

export function remove(id: string): boolean {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1); // splice mutates in place and shifts remaining items
  return true;
}
