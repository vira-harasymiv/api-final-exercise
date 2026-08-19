export const passwordGrantPayloadWithScope = {
  grant_type: "password",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  scope: "read write admin",
};

export const passwordGrantPayload = {
  grant_type: "password",
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};
