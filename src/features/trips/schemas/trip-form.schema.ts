import { z } from "zod";

export const tripFormSchema = z
  .object({
    name: z.string().trim().min(1, "required").max(120, "too_long"),
    description: z.string().max(5000, "too_long"),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "required"),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "required"),
    timezone: z.string().min(1, "required"),
  })
  .refine((value) => value.end_date >= value.start_date, { path: ["end_date"], message: "end_before_start" });

export type TripFormValues = z.infer<typeof tripFormSchema>;
