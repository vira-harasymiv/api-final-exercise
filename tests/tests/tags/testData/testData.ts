//Wrong data types to substitute into the tag's `name` field for negative tests
export const invalidDataTypesForName = [
  { id: 1, dataType: "null", data: null },

  { id: 2, dataType: "boolean", data: true },

  { id: 3, dataType: "number", data: 1 },

  { id: 4, dataType: "array", data: ["a", "b"] },

  { id: 5, dataType: "object", data: { a: 1 } },
];

//Values that are valid strings but violate the minimum length rule (>= 2 chars after trim)
export const tooShortNamesForName = [
  { id: 1, description: "missing name", data: undefined },

  { id: 2, description: "empty string", data: "" },

  { id: 3, description: "whitespace only", data: "   " },

  { id: 4, description: "single character", data: "a" },
];
