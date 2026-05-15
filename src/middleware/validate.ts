import { Request, Response, NextFunction } from 'express';
import { TaskStatus } from '../types/task';

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { title, status } = req.body as Record<string, unknown>;

  if (title === undefined || title === null) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ error: 'title must be a non-empty string' });
    return;
  }

  if (title.trim().length > 200) {
    res.status(400).json({ error: 'title must not exceed 200 characters' });
    return;
  }

  if (status !== undefined && !VALID_STATUSES.includes(status as TaskStatus)) {
    res
      .status(400)
      .json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  next();
}

export function validateUpdateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { title, description, status } = req.body as Record<string, unknown>;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ error: 'title must be a non-empty string' });
      return;
    }
    if (title.trim().length > 200) {
      res.status(400).json({ error: 'title must not exceed 200 characters' });
      return;
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    res.status(400).json({ error: 'description must be a string' });
    return;
  }

  if (status !== undefined && !VALID_STATUSES.includes(status as TaskStatus)) {
    res
      .status(400)
      .json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  if (title === undefined && description === undefined && status === undefined) {
    res
      .status(400)
      .json({ error: 'at least one field (title, description, status) must be provided' });
    return;
  }

  next();
}
