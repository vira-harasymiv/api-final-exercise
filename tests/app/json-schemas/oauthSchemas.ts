import { z } from "zod";

// Response for Client Credentials Grant - no refresh_token
export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("Bearer"),
  expires_in: z.number().int().positive(),
  scope: z.string().min(1),
});
export type TokenResponse = z.infer<typeof tokenResponseSchema>;

// Response for Password Grant - includes refresh_token
export const tokenResponseWithRefreshTokenSchema = tokenResponseSchema.extend({
  refresh_token: z.string().min(1),
});
export type TokenResponseWithRefreshToken = z.infer<
  typeof tokenResponseWithRefreshTokenSchema
>;
