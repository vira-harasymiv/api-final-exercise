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

// Single OAuth client item
export const oauthClientSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string().min(1),
  grants: z.array(z.string().min(1)),
  scopes: z.array(z.string().min(1)),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
});
export type OauthClient = z.infer<typeof oauthClientSchema>;

// Full response - array of clients
export const oauthClientListSchema = z.array(oauthClientSchema);
export type OauthClientList = z.infer<typeof oauthClientListSchema>;

// Created client item
export const oauthCreatedClientSchema = z.object({
  id: z.string().min(1),
  clientId: z.string().min(1),
  name: z.string().min(1),
  grants: z.array(z.string().min(1)),
  scopes: z.array(z.string().min(1)),
  createdAt: z.iso.datetime(),
});
export type OauthClientCreated = z.infer<typeof oauthCreatedClientSchema>;
