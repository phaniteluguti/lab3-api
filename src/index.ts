import express from 'express';
import taskRouter from './routes/tasks';
import healthRouter from './routes/health';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Body parsing
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/tasks', taskRouter);

// 404 catch-all
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Task API listening on http://localhost:${PORT}`);
});

export default app;
