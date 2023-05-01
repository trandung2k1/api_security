import { Response, Request, NextFunction } from 'express';
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statusCode);
    return res.json({
        status: statusCode,
        message: error?.message,
    });
};
