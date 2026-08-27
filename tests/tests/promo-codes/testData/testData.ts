//A date one year in the future - satisfies the "must be in the future" rule for expiresAt
export const futureDate = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

//A date one day in the past - violates the "must be in the future" rule for expiresAt
export const pastDate = () =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

//Short unique promo code that stays within the 20-char limit regardless of prefix length
export const randomCode = (prefix: string) =>
  (prefix + Math.floor(Math.random() * 1_000_000)).toUpperCase().slice(0, 20);

//Invalid/boundary values for the promo code's `code` field
export const invalidCodes = [
  {
    id: 1,
    description: "missing code",
    code: undefined,
    expectedError: "Invalid input: expected string, received undefined",
  },

  {
    id: 2,
    description: "empty string",
    code: "",
    expectedError: "Code must be at least 3 characters",
  },

  {
    id: 3,
    description: "whitespace only",
    code: "   ",
    expectedError:
      "Code may only contain uppercase letters, digits, and hyphens",
  },

  {
    id: 4,
    description: "2 characters (too short)",
    code: "AB",
    expectedError: "Code must be at least 3 characters",
  },

  {
    id: 5,
    description: "21 characters (too long)",
    code: "A".repeat(21),
    expectedError: "Code must be at most 20 characters",
  },

  {
    id: 6,
    description: "lowercase letters",
    code: "abc123",
    expectedError:
      "Code may only contain uppercase letters, digits, and hyphens",
  },

  {
    id: 7,
    description: "containing a space",
    code: "AB CD",
    expectedError:
      "Code may only contain uppercase letters, digits, and hyphens",
  },

  {
    id: 8,
    description: "containing an underscore",
    code: "AB_CD",
    expectedError:
      "Code may only contain uppercase letters, digits, and hyphens",
  },
];

//Wrong data types to substitute into the `code` field for negative tests
export const invalidDataTypesForCode = [
  {
    id: 1,
    dataType: "null",
    data: null,
    expectedError: "Invalid input: expected string, received null",
  },

  {
    id: 2,
    dataType: "boolean",
    data: true,
    expectedError: "Invalid input: expected string, received boolean",
  },

  {
    id: 3,
    dataType: "number",
    data: 123,
    expectedError: "Invalid input: expected string, received number",
  },

  {
    id: 4,
    dataType: "array",
    data: ["A"],
    expectedError: "Invalid input: expected string, received array",
  },

  {
    id: 5,
    dataType: "object",
    data: { a: 1 },
    expectedError: "Invalid input: expected string, received object",
  },
];

//Invalid/boundary values for the `discountPercent` field
export const invalidDiscountPercents = [
  {
    id: 1,
    description: "missing discountPercent",
    data: undefined,
    expectedError: "Invalid input: expected number, received NaN",
  },

  {
    id: 2,
    description: "0 (below the minimum)",
    data: 0,
    expectedError: "Discount must be at least 1%",
  },

  {
    id: 3,
    description: "a negative value",
    data: -5,
    expectedError: "Discount must be at least 1%",
  },

  {
    id: 4,
    description: "101 (above the maximum)",
    data: 101,
    expectedError: "Discount cannot exceed 100%",
  },

  {
    id: 5,
    description: "a decimal value",
    data: 10.5,
    expectedError: "Invalid input: expected int, received number",
  },

  {
    id: 6,
    description: "a non-numeric string",
    data: "ten",
    expectedError: "Invalid input: expected number, received NaN",
  },

  {
    id: 7,
    description: "null",
    data: null,
    expectedError: "Discount must be at least 1%",
  },
];

//Invalid values for the `expiresAt` field
export const invalidExpiresAtValues = [
  {
    id: 1,
    description: "missing expiresAt",
    data: undefined,
    expectedError: "Invalid input: expected date, received Date",
  },

  {
    id: 2,
    description: "a date in the past",
    data: "2020-01-01T00:00:00Z",
    expectedError: "Expiration date must be in the future",
  },

  {
    id: 3,
    description: "an invalid date string",
    data: "not-a-date",
    expectedError: "Invalid input: expected date, received Date",
  },

  {
    id: 4,
    description: "an array",
    data: ["not-a-date"],
    expectedError: "Invalid input: expected date, received Date",
  },
];

//Invalid values for the optional `maxUses` field
export const invalidMaxUsesValues = [
  {
    id: 1,
    description: "0 (must be positive)",
    data: 0,
    expectedError: "Too small: expected number to be >0",
  },

  {
    id: 2,
    description: "a negative value",
    data: -1,
    expectedError: "Too small: expected number to be >0",
  },

  {
    id: 3,
    description: "a non-numeric string",
    data: "five",
    expectedError: "Invalid input: expected number, received NaN",
  },
];
