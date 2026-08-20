export const createClientPositiveCases = [
  {
    title: "Create client using ONLY required fields",
    stepLabel: "Create a new client using ONLY name required field",
    buildPayload: (name: string) => ({ name }),
  },
  {
    title: "Create client using grants optional field",
    stepLabel: "Create a new client using grants optional field",
    buildPayload: (name: string) => ({
      name,
      grants: ["client_credentials"],
    }),
  },
  {
    title: "Create client using scopes optional field",
    stepLabel: "Create a new client using scopes optional field",
    buildPayload: (name: string) => ({
      name,
      scopes: ["read", "write"],
    }),
  },
];
