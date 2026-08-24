import { z } from "zod";

// Uploaded file item
export const uploadedFileSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
  size: z.number().nonnegative(),
  type: z.string().min(1),
});
export type UploadedFile = z.infer<typeof uploadedFileSchema>;
