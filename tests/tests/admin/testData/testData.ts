//Wrong data types to substitute into the user's info `name` field for negative tests
export const invalidDataTypesForName = [
  { id: 3, dataType: "null", data: null },

  { id: 4, dataType: "boolean", data: true },

  { id: 5, dataType: "number", data: 1 },
];

//Wrong data types to substitute into the user's info `name` field for negative tests
export const invalidDataTypesForEmail = [
  {
    id: 1,
    dataType: "empty string",
    data: "",
    message: "Invalid email address",
  },

  {
    id: 2,
    dataType: "email domain",
    data: "user@",
    message: "Invalid email address",
  },

  {
    id: 3,
    dataType: "email without local part",
    data: "@example.com",
    message: "Invalid email address",
  },

  { id: 4, dataType: "null", data: null, message: "No valid fields to update" },

  {
    id: 5,
    dataType: "boolean",
    data: true,
    message: "No valid fields to update",
  },

  { id: 6, dataType: "number", data: 1, message: "No valid fields to update" },
];

//Wrong data types to substitute into the user's info `isActive` field for negative tests
export const invalidDataTypesForIsActive = [
  { id: 1, dataType: " string", data: "true" },

  { id: 2, dataType: "null", data: null },

  { id: 3, dataType: "number", data: 1 },
];
