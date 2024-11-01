import { z } from 'zod';

export const respondGuidanceRequestSchema = z.object({
  accept: z.boolean(),
  justification: z.string().nullable(),
});

export type RespondGuidanceRequestDTO = z.infer<
  typeof respondGuidanceRequestSchema
>;
