import {
  checkUnauthorizedError,
  checkUnauthorizedClientError,
  checkUnauthorizedRefreshTokenError,
  checkEmptyProperty,
  checkInvalidEmail,
  checkBadRequest,
  checkInvalidGrantType,
} from "../../../app/utils/expect-helpers";
import { passwordGrantPayload } from "./payloads";

export const invalidCasesForPasswordGrant: Array<{
  title: string;
  stepLabel: string;
  payload: Record<string, string | undefined>;
  checkError: (response: any) => Promise<void>;
}> = [
  {
    title: "Logging without grant_type - should be 400 error",
    stepLabel: "Login as admin without grant_type property",
    payload: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
    checkError: checkInvalidGrantType,
  },

  {
    title: "Logging without password - should be 400 error",
    stepLabel: "Login as admin without password",
    payload: {
      grant_type: "password",
      email: process.env.ADMIN_EMAIL,
    },
    checkError: checkBadRequest,
  },

  {
    title: "Logging without email - should be 400 error",
    stepLabel: "Login as admin without email",
    payload: {
      grant_type: "password",
      password: process.env.ADMIN_PASSWORD,
    },
    checkError: checkBadRequest,
  },

  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Login as admin with incorrect grant_type",
    payload: {
      ...passwordGrantPayload,
      grant_type: "admin",
    },
    checkError: checkInvalidGrantType,
  },

  {
    title: "Logging with non-registered email - should be 401 error",
    stepLabel: "Login as admin with non-registered email",
    payload: {
      ...passwordGrantPayload,
      email: "non-existent-email@mail.com",
    },
    checkError: checkUnauthorizedError,
  },

  {
    title: "Logging with incorrect password - should be 401 error",
    stepLabel: "Login as admin with incorrect password",
    payload: {
      ...passwordGrantPayload,
      password: "admin",
    },
    checkError: checkUnauthorizedError,
  },
];

export const invalidCasesForClientCredentialsGrant: Array<{
  title: string;
  stepLabel: string;
  buildPayload: (
    clientId: string,
    clientSecret: string,
  ) => Record<string, string | undefined>;
  checkError: (response: any) => Promise<void>;
}> = [
  {
    title: "Logging without grant_type - should be 400 error",
    stepLabel: "Take token without grant_type property",
    buildPayload: (clientId, clientSecret) => ({
      client_id: clientId,
      client_secret: clientSecret,
    }),
    checkError: checkInvalidGrantType,
  },
  {
    title: "Logging without client_id - should be 400 error",
    stepLabel: "Take token without client_id property",
    buildPayload: (_clientId, clientSecret) => ({
      grant_type: "client_credentials",
      client_secret: clientSecret,
    }),
    checkError: checkBadRequest,
  },
  {
    title: "Logging without client_secret - should be 400 error",
    stepLabel: "Take token without client_secret property",
    buildPayload: (clientId) => ({
      grant_type: "client_credentials",
      client_id: clientId,
    }),
    checkError: checkBadRequest,
  },
  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Take token with incorrect grant_type",
    buildPayload: (clientId, clientSecret) => ({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    checkError: checkBadRequest,
  },
  {
    title: "Logging with non-registered client_id - should be 401 error",
    stepLabel: "Take token with non-registered client_id",
    buildPayload: (_clientId, clientSecret) => ({
      grant_type: "client_credentials",
      client_id: "00000000-0000-0000-0000-000000000000",
      client_secret: clientSecret,
    }),
    checkError: checkUnauthorizedClientError,
  },
  {
    title: "Logging with incorrect client_secret - should be 401 error",
    stepLabel: "Take token with incorrect client_secret",
    buildPayload: (clientId) => ({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: "incorrect-secret",
    }),
    checkError: checkUnauthorizedClientError,
  },
];

export const invalidCasesForRefreshTokenGrant: Array<{
  title: string;
  stepLabel: string;
  buildPayload: (refreshToken: string) => Record<string, string | undefined>;
  checkError: (response: any) => Promise<void>;
}> = [
  {
    title: "Logging without grant_type - should be 400 error",
    stepLabel: "Take token without grant_type property",
    buildPayload: (refreshToken) => ({
      refresh_token: refreshToken,
    }),
    checkError: checkInvalidGrantType,
  },
  {
    title: "Logging without refresh token - should be 400 error",
    stepLabel: "Take token without refresh token property",
    buildPayload: () => ({
      grant_type: "refresh_token",
    }),
    checkError: checkBadRequest,
  },

  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Take token with incorrect grant_type",
    buildPayload: (refreshToken) => ({
      grant_type: "client_credentials",
      refresh_token: refreshToken,
    }),
    checkError: checkBadRequest,
  },
  {
    title: "Logging with non-existent refresh token - should be 401 error",
    stepLabel: "Take token with non-existent refresh token",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "dfdflfldfjkfjlkjkjflkdf-dfdkfjdkfkdfj",
    }),
    checkError: checkUnauthorizedRefreshTokenError,
  },
  {
    title: "Logging with empty refresh token - should be 400 error",
    stepLabel: "Take token with empty refresh token",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "",
    }),
    checkError: checkEmptyProperty,
  },

  {
    title:
      "Logging with refresh token contained only spaces - should be 401 error",
    stepLabel: "Take token using refresh token with spaces",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "             ",
    }),
    checkError: checkUnauthorizedRefreshTokenError,
  },
];
