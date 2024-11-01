import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { formatZodErrors } from '../utils/zod-error-formatting';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = formatZodErrors(error);
        throw new BadRequestException(formattedError);
      }
      throw error;
    }
  }
}
