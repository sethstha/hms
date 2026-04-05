import { z } from "zod";

export const errorSchema = z.object({ error: z.string() });
export const successSchema = z.object({ success: z.boolean() });

export type ApiError = z.infer<typeof errorSchema>;
