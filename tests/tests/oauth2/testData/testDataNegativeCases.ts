import { checkBadStatusCode } from "../../../app/utils/general-expect-helpers";
import {
  checkInvalidGrantType,
  checkUnauthorizedStatusCodeForRefreshToken,
  checkEmptyProperty,
  checkUnauthorizedStatusCodeForPasswordGrant,
  checkUnauthorizedStatusCodeForCredentialsGrant,
} from "../helpers/expect-helpers";
import { passwordGrantPayload } from "./payloads";

//Missing/incorrect field cases for the Password Grant flow: each entry supplies a
//ready-to-send payload and the response-check helper matching its expected error
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
    checkError: checkBadStatusCode,
  },

  {
    title: "Logging without email - should be 400 error",
    stepLabel: "Login as admin without email",
    payload: {
      grant_type: "password",
      password: process.env.ADMIN_PASSWORD,
    },
    checkError: checkBadStatusCode,
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
    checkError: checkUnauthorizedStatusCodeForPasswordGrant,
  },

  {
    title: "Logging with incorrect password - should be 401 error",
    stepLabel: "Login as admin with incorrect password",
    payload: {
      ...passwordGrantPayload,
      password: "admin",
    },
    checkError: checkUnauthorizedStatusCodeForPasswordGrant,
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
    checkError: checkBadStatusCode,
  },
  {
    title: "Logging without client_secret - should be 400 error",
    stepLabel: "Take token without client_secret property",
    buildPayload: (clientId) => ({
      grant_type: "client_credentials",
      client_id: clientId,
    }),
    checkError: checkBadStatusCode,
  },
  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Take token with incorrect grant_type",
    buildPayload: (clientId, clientSecret) => ({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    checkError: checkBadStatusCode,
  },
  {
    title: "Logging with non-registered client_id - should be 401 error",
    stepLabel: "Take token with non-registered client_id",
    buildPayload: (_clientId, clientSecret) => ({
      grant_type: "client_credentials",
      client_id: "00000000-0000-0000-0000-000000000000",
      client_secret: clientSecret,
    }),
    checkError: checkUnauthorizedStatusCodeForCredentialsGrant,
  },
  {
    title: "Logging with incorrect client_secret - should be 401 error",
    stepLabel: "Take token with incorrect client_secret",
    buildPayload: (clientId) => ({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: "incorrect-secret",
    }),
    checkError: checkUnauthorizedStatusCodeForCredentialsGrant,
  },
];

//Missing/incorrect field cases for the Refresh Token Grant flow: buildPayload takes
//a valid refresh token (obtained in the spec) and mutates it into an invalid one
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
    checkError: checkBadStatusCode,
  },

  {
    title: "Logging with incorrect grant_type - should be 400 error",
    stepLabel: "Take token with incorrect grant_type",
    buildPayload: (refreshToken) => ({
      grant_type: "client_credentials",
      refresh_token: refreshToken,
    }),
    checkError: checkBadStatusCode,
  },
  {
    title: "Logging with non-existent refresh token - should be 401 error",
    stepLabel: "Take token with non-existent refresh token",
    buildPayload: (refreshToken) => ({
      grant_type: "refresh_token",
      refresh_token: "dfdflfldfjkfjlkjkjflkdf-dfdkfjdkfkdfj",
    }),
    checkError: checkUnauthorizedStatusCodeForRefreshToken,
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
    checkError: checkUnauthorizedStatusCodeForRefreshToken,
  },
];
