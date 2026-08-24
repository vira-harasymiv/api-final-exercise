import {
  checkBadStatusCode,
  checkUnauthorizedStatusCode,
} from "../../../app/utils/expect-helpers";
import { passwordGrantPayload } from "./payloads";

//Missing/incorrect field cases for the Password Grant flow: each entry supplies a
//ready-to-send payload and the response-check helper matching its expected error
export const invalidCasesForPasswordGrant: Array<{
  title: string;
  stepLabel: string;
  payload: Record<string, string | undefined>;
  checkStatusCode: (response: any) => Promise<void>;
  error: string;
  errorDescription: string;
}> = [
  {
    title: "Logging without grant_type - should be 400 error",
    stepLabel: "Login as admin without grant_type property",
    payload: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription:
      "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
  },

  {
    title: "Logging without password - should be 400 error",
    stepLabel: "Login as admin without password",
    payload: {
      grant_type: "password",
      email: process.env.ADMIN_EMAIL,
    },
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },

  {
    title: "Logging without email - should be 400 error",
    stepLabel: "Login as admin without email",
    payload: {
      grant_type: "password",
      password: process.env.ADMIN_PASSWORD,
    },
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },

  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Login as admin with incorrect grant_type",
    payload: {
      ...passwordGrantPayload,
      grant_type: "admin",
    },
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription:
      "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
  },

  {
    title: "Logging with non-registered email - should be 401 error",
    stepLabel: "Login as admin with non-registered email",
    payload: {
      ...passwordGrantPayload,
      email: "non-existent-email@mail.com",
    },
    checkStatusCode: checkUnauthorizedStatusCode,
    error: "invalid_grant",
    errorDescription: "Invalid email or password",
  },

  {
    title: "Logging with incorrect password - should be 401 error",
    stepLabel: "Login as admin with incorrect password",
    payload: {
      ...passwordGrantPayload,
      password: "admin",
    },
    checkStatusCode: checkUnauthorizedStatusCode,
    error: "invalid_grant",
    errorDescription: "Invalid email or password",
  },
];

//Missing/incorrect field cases for the Client Credentials Grant flow: buildPayload takes
//a valid clientId/clientSecret pair (created in the spec) and mutates it into an invalid one
export const invalidCasesForClientCredentialsGrant: Array<{
  title: string;
  stepLabel: string;
  buildPayload: (
    clientId: string,
    clientSecret: string,
  ) => Record<string, string | undefined>;
  checkStatusCode: (response: any) => Promise<void>;
  error: string;
  errorDescription: string;
}> = [
  {
    title: "Logging without grant_type - should be 400 error",
    stepLabel: "Take token without grant_type property",
    buildPayload: (clientId, clientSecret) => ({
      client_id: clientId,
      client_secret: clientSecret,
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription:
      "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
  },

  {
    title: "Logging without client_id - should be 400 error",
    stepLabel: "Take token without client_id property",
    buildPayload: (_clientId, clientSecret) => ({
      grant_type: "client_credentials",
      client_secret: clientSecret,
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },

  {
    title: "Logging without client_secret - should be 400 error",
    stepLabel: "Take token without client_secret property",
    buildPayload: (clientId) => ({
      grant_type: "client_credentials",
      client_id: clientId,
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },

  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Take token with incorrect grant_type",
    buildPayload: (clientId, clientSecret) => ({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },

  {
    title: "Logging with non-registered client_id - should be 401 error",
    stepLabel: "Take token with non-registered client_id",
    buildPayload: (_clientId, clientSecret) => ({
      grant_type: "client_credentials",
      client_id: "00000000-0000-0000-0000-000000000000",
      client_secret: clientSecret,
    }),
    checkStatusCode: checkUnauthorizedStatusCode,
    error: "invalid_client",
    errorDescription: "Invalid client credentials",
  },
  {
    title: "Logging with incorrect client_secret - should be 401 error",
    stepLabel: "Take token with incorrect client_secret",
    buildPayload: (clientId) => ({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: "incorrect-secret",
    }),
    checkStatusCode: checkUnauthorizedStatusCode,
    error: "invalid_client",
    errorDescription: "Invalid client credentials",
  },
];

//Missing/incorrect field cases for the Refresh Token Grant flow: buildPayload takes
//a valid refresh token (obtained in the spec) and mutates it into an invalid one
export const invalidCasesForRefreshTokenGrant: Array<{
  title: string;
  stepLabel: string;
  buildPayload: (refreshToken: string) => Record<string, string | undefined>;
  checkStatusCode: (response: any) => Promise<void>;
  error: string;
  errorDescription: string;
}> = [
  {
    title: "Logging without grant_type - should be 400 error",
    stepLabel: "Take token without grant_type property",
    buildPayload: (refreshToken) => ({
      refresh_token: refreshToken,
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription:
      "Invalid discriminator value. Expected 'password' | 'client_credentials' | 'refresh_token'",
  },
  {
    title: "Logging without refresh token - should be 400 error",
    stepLabel: "Take token without refresh token property",
    buildPayload: () => ({
      grant_type: "refresh_token",
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },

  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Take token with incorrect grant_type",
    buildPayload: (refreshToken) => ({
      grant_type: "client_credentials",
      refresh_token: refreshToken,
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Invalid input: expected string, received undefined",
  },
  {
    title: "Logging with non-existent refresh token - should be 401 error",
    stepLabel: "Take token with non-existent refresh token",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "dfdflfldfjkfjlkjkjflkdf-dfdkfjdkfkdfj",
    }),
    checkStatusCode: checkUnauthorizedStatusCode,
    error: "invalid_grant",
    errorDescription: "Invalid refresh token",
  },
  {
    title: "Logging with empty refresh token - should be 400 error",
    stepLabel: "Take token with empty refresh token",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "",
    }),
    checkStatusCode: checkBadStatusCode,
    error: "invalid_request",
    errorDescription: "Too small: expected string to have >=1 characters",
  },

  {
    title:
      "Logging with refresh token contained only spaces - should be 401 error",
    stepLabel: "Take token using refresh token with spaces",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "             ",
    }),
    checkStatusCode: checkUnauthorizedStatusCode,
    error: "invalid_grant",
    errorDescription: "Invalid refresh token",
  },
];
