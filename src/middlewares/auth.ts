import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, failBody } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError)
        return res.status(400).json(failBody('VALIDATION_ERROR', 'Validation failed', err.flatten()));
    if (err instanceof AppError)
        return res.status(err.status).json(failBody(err.code, err.message, err.details));
    console.error(err);
    return res.status(500).json(failBody('INTERNAL_ERROR', 'Something went wrong'));
}
