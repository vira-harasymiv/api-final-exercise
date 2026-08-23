//Valid admin Password Grant payload with the optional `scope` field included
export const passwordGrantPayloadWithScope = {
  grant_type: "password",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  scope: "read write admin",
};

//Valid admin Password Grant payload using only the required fields
export const passwordGrantPayload = {
  grant_type: "password",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
