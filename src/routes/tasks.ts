import { Router, Request, Response, NextFunction } from 'express';
import * as store from '../store/taskStore';
import { validateCreateTask, validateUpdateTask } from '../middleware/validate';
import { CreateTaskBody, UpdateTaskBody } from '../types/task';

const router = Router();

/**
 * GET /tasks
 * Returns all tasks in the store.
 *
 * @param _req - Express request object (no parameters used)
 * @param res - Express response object
 * @returns {200} JSON array of all Task objects. Returns an empty array when no tasks exist.
 *   Response shape: Array<{ id: string, title: string, description: string,
 *     status: 'todo'|'in-progress'|'done', createdAt: string, updatedAt: string }>
 *
 * @example
 * curl -X GET http://localhost:3000/tasks
 */
router.get('/', (_req: Request, res: Response) => {
  res.json(store.findAll());
});

/**
 * GET /tasks/:id
 * Returns a single task by its UUID.
 *
 * @param req - Express request object
 * @param req.params.id - UUID of the task to retrieve
 * @param res - Express response object
 * @param next - Express next function (unused; present for consistency)
 * @returns {200} The matching Task object.
 *   Response shape: { id: string, title: string, description: string,
 *     status: 'todo'|'in-progress'|'done', createdAt: string, updatedAt: string }
 * @returns {404} When no task with the given id exists.
 *   Response shape: { error: string }
 *
 * @example
 * curl -X GET http://localhost:3000/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  const task = store.findById(req.params.id);
  if (!task) {
    res.status(404).json({ error: `Task with id '${req.params.id}' not found` });
    return;
  }
  res.json(task);
});

/**
 * POST /tasks
 * Creates a new task. Runs validateCreateTask middleware before the handler.
 *
 * @param req - Express request object
 * @param req.body.title - (required) Title of the task; non-empty string, max 200 characters
 * @param req.body.description - (optional) Description of the task; defaults to empty string
 * @param req.body.status - (optional) Initial status; one of 'todo' | 'in-progress' | 'done'; defaults to 'todo'
 * @param res - Express response object
 * @param next - Express next function; called with error on unexpected store failure
 * @returns {201} The newly created Task object with server-generated id, createdAt, and updatedAt.
 *   Response shape: { id: string, title: string, description: string,
 *     status: 'todo'|'in-progress'|'done', createdAt: string, updatedAt: string }
 * @returns {400} When validation fails (missing title, blank title, title too long, invalid status).
 *   Response shape: { error: string }
 * @returns {500} On unexpected store error.
 *   Response shape: { error: 'Internal Server Error' }
 *
 * @example
 * curl -X POST http://localhost:3000/tasks \
 *   -H 'Content-Type: application/json' \
 *   -d '{"title": "Buy groceries", "description": "Milk and eggs", "status": "todo"}'
 */
router.post(
  '/',
  validateCreateTask,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as CreateTaskBody;
      const task = store.create({
        title: body.title.trim(),
        description: typeof body.description === 'string' ? body.description.trim() : '',
        status: body.status,
      });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /tasks/:id
 * Updates one or more fields of an existing task. Runs validateUpdateTask middleware
 * before the handler. Only the fields present in the request body are changed;
 * omitted fields retain their current values. updatedAt is always refreshed.
 *
 * @param req - Express request object
 * @param req.params.id - UUID of the task to update
 * @param req.body.title - (optional) New title; non-empty string, max 200 characters
 * @param req.body.description - (optional) New description string
 * @param req.body.status - (optional) New status; one of 'todo' | 'in-progress' | 'done'
 * @param res - Express response object
 * @param next - Express next function; called with error on unexpected store failure
 * @returns {200} The updated Task object with a refreshed updatedAt timestamp.
 *   Response shape: { id: string, title: string, description: string,
 *     status: 'todo'|'in-progress'|'done', createdAt: string, updatedAt: string }
 * @returns {400} When validation fails (no fields provided, invalid types, invalid status).
 *   Response shape: { error: string }
 * @returns {404} When no task with the given id exists.
 *   Response shape: { error: string }
 * @returns {500} On unexpected store error.
 *   Response shape: { error: 'Internal Server Error' }
 *
 * @example
 * curl -X PUT http://localhost:3000/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
 *   -H 'Content-Type: application/json' \
 *   -d '{"status": "in-progress"}'
 */
router.put(
  '/:id',
  validateUpdateTask,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as UpdateTaskBody;
      const updated = store.update(req.params.id, {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.status !== undefined && { status: body.status }),
      });
      if (!updated) {
        res.status(404).json({ error: `Task with id '${req.params.id}' not found` });
        return;
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /tasks/:id
 * Permanently removes a task from the store.
 *
 * @param req - Express request object
 * @param req.params.id - UUID of the task to delete
 * @param res - Express response object
 * @returns {204} No content; the task was successfully deleted. Response body is empty.
 * @returns {404} When no task with the given id exists.
 *   Response shape: { error: string }
 *
 * @example
 * curl -X DELETE http://localhost:3000/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
 */
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: `Task with id '${req.params.id}' not found` });
    return;
  }
  res.status(204).send();
});

export default router;
