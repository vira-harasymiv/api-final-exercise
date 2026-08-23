import { z } from "zod";

// Single user item returned by admin search
export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type User = z.infer<typeof userSchema>;

// Full GET /admin/users response - array of matched users
export const userSearchResultSchema = z.array(userSchema);
export type UserSearchResult = z.infer<typeof userSearchResultSchema>;
