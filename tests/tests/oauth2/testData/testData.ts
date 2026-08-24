import { checkBadStatusCode } from "../../../app/utils/expect-helpers";

//Wrong data types to substitute into the `grant_type` field - every case is expected
//to fail schema validation regardless of which grant is being tested
export const invalidDataTypes = [
  { id: 1, dataType: "empty string", data: "" },

  { id: 2, dataType: "null", data: null },

  { id: 3, dataType: "boolean", data: true },

  { id: 4, dataType: "number", data: 1 },
];

//Wrong data types to substitute into client_id/client_secret/refresh_token fields,
//each paired with the response-check helper matching its expected error
export const invalidDataTypesForCredentials = [
  {
    id: 1,
    dataType: "empty string",
    data: "",
    errorDescription: "Too small: expected string to have >=1 characters",
  },

  {
    id: 2,
    dataType: "null",
    data: null,
    errorDescription: "Invalid input: expected string, received null",
  },

  {
    id: 3,
    dataType: "boolean",
    data: true,
    errorDescription: "Invalid input: expected string, received boolean",
  },

  {
    id: 4,
    dataType: "number",
    data: 1,
    errorDescription: "Invalid input: expected string, received number",
  },
];

//Wrong data types to substitute into the `password` field for Password Grant negative tests
export const invalidDataTypesForPassword = [
  {
    id: 1,
    dataType: "empty string",
    data: "",
    errorDescription: "Too small: expected string to have >=1 characters",
  },
  {
    id: 2,
    dataType: "null",
    data: null,
    errorDescription: "Invalid input: expected string, received null",
  },
  {
    id: 3,
    dataType: "boolean",
    data: true,
    errorDescription: "Invalid input: expected string, received boolean",
  },
  {
    id: 4,
    dataType: "number",
    data: 1,
    errorDescription: "Invalid input: expected string, received number",
  },
];

//Invalid/malformed email values for Password Grant negative tests, each paired with
//the response-check helper matching its expected error
export const testDataForInvalidEmail = [
  {
    id: 1,
    dataType: "empty string",
    data: "",
    error_description: "Invalid email address",
  },

  {
    id: 2,
    dataType: "English and Korean letters",
    data: "adminê´€ë¦¬ìž",
    error_description: "Invalid email address",
  },

  {
    id: 3,
    dataType: "no domain",
    data: "user@",
    error_description: "Invalid email address",
  },

  {
    id: 4,
    dataType: "no local part",
    data: "@example.com",
    error_description: "Invalid email address",
  },

  {
    id: 5,
    dataType: "SQL Injection",
    data: "admin@dojo.api' --",
    error_description: "Invalid email address",
  },

  {
    id: 6,
    dataType: "double @ symbol",
    data: "user@@example.com",
    error_description: "Invalid email address",
  },

  {
    id: 7,
    dataType: "contains spaces",
    data: "user name@example.com",
    error_description: "Invalid email address",
  },

  {
    id: 8,
    dataType: "invalid characters",
    data: "user!#$%@example.com",
    error_description: "Invalid email address",
  },

  {
    id: 9,
    dataType: "consecutive dots",
    data: "user..name@example.com",
    error_description: "Invalid email address",
  },

  {
    id: 10,
    dataType: "null",
    data: null,
    error_description: "Invalid input: expected string, received null",
  },

  {
    id: 11,
    dataType: "boolean",
    data: true,
    error_description: "Invalid input: expected string, received boolean",
  },
];
