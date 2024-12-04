import { z } from 'zod';

export const updateTccThemeSchema = z.object({ theme: z.string() });

export type UpdateTccThemeDTO = z.infer<typeof updateTccThemeSchema>;
