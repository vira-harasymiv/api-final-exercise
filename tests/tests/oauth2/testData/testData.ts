import {
  checkEmptyProperty,
  checkInvalidEmail,
  checkBadRequest,
} from "../../../app/utils/expect-helpers";

export const invalidDataTypes = [
  { id: 1, dataType: "empty string", data: "" },

  { id: 2, dataType: "null", data: null },

  { id: 3, dataType: "boolean", data: true },

  { id: 4, dataType: "number", data: 1 },
];

export const invalidDataTypesForCredentials = [
  { id: 1, dataType: "empty string", data: "", check: checkEmptyProperty },

  { id: 2, dataType: "null", data: null, check: checkBadRequest },

  { id: 3, dataType: "boolean", data: true, check: checkBadRequest },

  { id: 4, dataType: "number", data: 1, check: checkBadRequest },
];

export const invalidDataTypesForPassword = [
  { id: 1, dataType: "empty string", data: "", check: checkEmptyProperty },
  {
    id: 2,
    dataType: "null",
    data: null,
    check: checkBadRequest,
  },
  {
    id: 3,
    dataType: "boolean",
    data: true,
    check: checkBadRequest,
  },
  {
    id: 4,
    dataType: "number",
    data: 1,
    check: checkBadRequest,
  },
];

export const testDataForInvalidEmail = [
  {
    id: 1,
    dataType: "empty string",
    data: "",
    check: checkInvalidEmail,
  },

  {
    id: 2,
    dataType: "English and Korean letters",
    data: "adminê´€ë¦¬ìž",
    check: checkInvalidEmail,
  },

  {
    id: 3,
    dataType: "no domain",
    data: "user@",
    check: checkInvalidEmail,
  },

  {
    id: 4,
    dataType: "no local part",
    data: "@example.com",
    check: checkInvalidEmail,
  },

  {
    id: 5,
    dataType: "SQL Injection",
    data: "admin@dojo.api' --",
    check: checkInvalidEmail,
  },

  {
    id: 6,
    dataType: "double @ symbol",
    data: "user@@example.com",
    check: checkInvalidEmail,
  },

  {
    id: 7,
    dataType: "contains spaces",
    data: "user name@example.com",
    check: checkInvalidEmail,
  },

  {
    id: 8,
    dataType: "invalid characters",
    data: "user!#$%@example.com",
    check: checkInvalidEmail,
  },

  {
    id: 9,
    dataType: "consecutive dots",
    data: "user..name@example.com",
    check: checkInvalidEmail,
  },

  {
    id: 10,
    dataType: "null",
    data: null,
    check: checkBadRequest,
  },

  {
    id: 11,
    dataType: "boolean",
    data: true,
    check: checkBadRequest,
  },
];
