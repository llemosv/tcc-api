import { ZodError } from 'zod';

export function formatZodErrors(error: ZodError): any {
  return {
    statusCode: 400,
    error: 'Bad Request',
    message: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}
