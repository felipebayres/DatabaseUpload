import 'reflect-metadata';
import 'express-async-errors';

import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import AppError from './errors/AppError';
import './database';
import app from './app';

app.use(express.json());
app.use(routes);
app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  console.log(err);
  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});
app.listen(3333, () => {
  console.log('🚀 Server started on port 3333!');
});
