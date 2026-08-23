//Wrong data types to substitute into the course `title` field for negative tests
export const invalidDataTypes = [
  { id: 1, dataType: "empty string", data: "" },

  { id: 2, dataType: "string with 1 character", data: "1" },

  { id: 3, dataType: "string with 2 characters", data: "12" },

  { id: 4, dataType: "null", data: null },

  { id: 5, dataType: "boolean", data: true },

  { id: 6, dataType: "number", data: 1 },
];
