//Boundary/format values for the `title` field - all rejected with the same
//"Title must be at least 3 characters" message
export const invalidTitles = [
  {
    id: 1,
    description: "missing title",
    data: undefined,
  },

  {
    id: 2,
    description: "empty string",
    data: "",
  },

  {
    id: 3,
    description: "whitespace only",
    data: "   ",
  },

  {
    id: 4,
    description: "2 characters (too short)",
    data: "AB",
  },
];

//Wrong data types for the `title` field - also rejected with the
//"Title must be at least 3 characters" message, since the API only checks `typeof === 'string'`
export const invalidTitleDataTypes = [
  {
    id: 1,
    dataType: "number",
    data: 123,
  },

  {
    id: 2,
    dataType: "boolean",
    data: true,
  },

  {
    id: 3,
    dataType: "null",
    data: null,
  },

  {
    id: 4,
    dataType: "array",
    data: ["A", "B", "C"],
  },

  {
    id: 5,
    dataType: "object",
    data: { a: 1 },
  },
];

//Invalid values for the `instructor` field - all rejected with the
//"Instructor is required with at least a name" message
export const invalidInstructors = [
  {
    id: 1,
    description: "missing instructor",
    data: undefined,
  },

  {
    id: 2,
    description: "instructor without a name",
    data: { bio: "Some bio" },
  },

  {
    id: 3,
    description: "instructor as a string",
    data: "Jane",
  },
];
